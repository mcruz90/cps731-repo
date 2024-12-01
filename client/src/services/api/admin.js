import { supabaseAdmin } from './adminClient';
import { notificationService } from './notifications';

/*
  Admin-specific database ops, so this uses supabaseAdmin rather than the regular supabase
  All other roles should import supabase from './index' instead

*/
export const adminService = {

  // admin can create users
  async createUser(userData) {
    console.log('AdminService: createUser called with:', userData);

    if (!userData.email || !userData.role) {
      throw new Error('Required fields missing');
    }

    try {
      const { data: authData, error: signUpError } = await supabaseAdmin.auth.admin.createUser({
        email: userData.email,
        email_confirm: true,
        user_metadata: {
          full_name: `${userData.firstName} ${userData.lastName}`,
          role: userData.role,
          is_new_user: true
        }
      });

      console.log('Auth user creation response:', authData, signUpError);

      if (signUpError) throw signUpError;
      if (!authData?.user?.id) throw new Error('User creation failed - no user ID returned');

      const { error: profileError } = await supabaseAdmin
        .from('profiles')
        .insert([{
          id: authData.user.id,
          first_name: userData.firstName,
          last_name: userData.lastName,
          email: userData.email,
          phone: userData.phone,
          role: userData.role,
          emergency_contact: userData.emergencyContact,
          address: userData.address,
          city: userData.city,
          province: userData.province,
          postal_code: userData.postalCode,
          specializations: userData.specializations,
          start_date: ['practitioner', 'staff'].includes(userData.role) ? userData.startDate : null,
          availability_notes: ['practitioner', 'staff'].includes(userData.role) ? userData.availability : null
        }]);

      console.log('Profile creation response:', profileError);

      if (profileError) {
        console.error('Profile creation error:', profileError);
        await supabaseAdmin.auth.admin.deleteUser(authData.user.id);
        throw profileError;
      }

      // Send welcome email -- BACKBURNER FOR NOW. RESEND NOT WORKING PROPERLY
      if (userData.sendWelcomeEmail) {
        try {
          console.log('Sending welcome email to:', userData.email);
          const emailResult = await notificationService.sendWelcomeEmail({
            email: userData.email,
            firstName: userData.firstName,
            lastName: userData.lastName,
            role: userData.role
          });
          console.log('Welcome email result:', emailResult);
        } catch (emailError) {
          console.error('Failed to send welcome email:', emailError);
        }
      }

      return {
        user: authData.user,
        profile: {
          first_name: userData.firstName,
          last_name: userData.lastName,
          role: userData.role
        }
      };
    } catch (error) {
      console.error('AdminService error:', error);
      throw new Error(`Failed to create user: ${error.message}`);
    }
  },

  async getUsers() {
    try {
      const { data, error } = await supabaseAdmin
        .from('profiles')
        .select(`
          id,
          first_name,
          last_name,
          email,
          phone,
          role,
          emergency_contact,
          address,
          city,
          province,
          postal_code,
          specializations,
          start_date,
          availability_notes,
          created_at,
          updated_at
        `);

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('AdminService error:', error);
      throw new Error(`Failed to fetch users: ${error.message}`);
    }
  },

  async updateUserStatus(userId, isActive) {
    try {
      const { error } = await supabaseAdmin
        .from('profiles')
        .update({ 
          is_active: isActive,
          updated_at: new Date().toISOString()
        })
        .eq('id', userId);

      if (error) throw error;
      return { success: true };
    } catch (error) {
      console.error('Update status error:', error);
      throw new Error(`Failed to update user status: ${error.message}`);
    }
  },

  
  async updateUser(userId, userData) {
    console.log('Updating user with ID:', userId);
    console.log('Update data:', userData);
    
    try {
      const cleanData = {
        first_name: userData.first_name?.trim() || '',
        last_name: userData.last_name?.trim() || '',
        email: userData.email?.trim() || '',
        phone: userData.phone?.trim() || null,
        city: userData.city?.trim() || null,
        role: userData.role || 'client',
        specializations: userData.specializations?.trim() || null,
        is_active: userData.is_active ?? true,
        updated_at: new Date().toISOString()
      };

      console.log('Cleaned update data:', cleanData);

      
      const { data, error } = await supabaseAdmin
        .from('profiles')  
        .update(cleanData)
        .eq('id', userId)
        .select()
        .single();

      if (error) {
        console.error('Supabase update error:', error);
        throw error;
      }

      console.log('Update successful:', data);
      return data;
    } catch (error) {
      console.error('Update user error:', error);
      throw new Error(`Failed to update user: ${error.message}`);
    }
  },

  // Admin-specific user management methods
  async getAllUsers() {
    try {
      const { data, error } = await supabaseAdmin
        .from('profiles')
        .select(`
          id,
          first_name,
          last_name,
          email,
          phone,
          role,
          city,
          province,
          postal_code,
          specializations,
          start_date,
          availability_notes,
          is_active,
          created_at,
          updated_at
        `)
        .order('created_at', { ascending: false });

      if (error) throw error;
      
      const processedData = data.map(user => ({
        ...user,
        is_active: user.is_active === null || user.is_active === undefined ? true : user.is_active
      }));

      return processedData;
    } catch (error) {
      console.error('Error fetching users:', error);
      throw error;
    }
  },

  // Deletes user from both the profiles and auth tables
  async deleteUser(userId) {
    try {
      console.log('Deleting user:', userId);

      // Delete from profiles first
      const { error: profileError } = await supabaseAdmin
        .from('profiles')
        .delete()
        .eq('id', userId);

      if (profileError) {
        console.error('Profile deletion error:', profileError);
        throw profileError;
      }

      // Then delete from auth
      const { error: authError } = await supabaseAdmin.auth.admin.deleteUser(
        userId
      );

      if (authError) {
        console.error('Auth deletion error:', authError);
        throw authError;
      }

      // Additional check to verify deletion
      const { data: checkUser } = await supabaseAdmin.auth.admin.getUserById(userId);
      if (checkUser) {
        throw new Error('User still exists after deletion attempt');
      }

      return { success: true };
    } catch (error) {
      console.error('Delete user error:', error);
      throw new Error(`Failed to delete user: ${error.message}`);
    }
  },

  // Get all products
  async getAllProducts() {
    try {
      const { data, error } = await supabaseAdmin
        .from('products')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Get products error:', error);
      throw new Error(`Failed to fetch products: ${error.message}`);
    }
  },

  // Create new product
  async createProduct(productData) {
    try {
      const { data, error } = await supabaseAdmin
        .from('products')
        .insert([productData])
        .select()
        .single();

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Create product error:', error);
      throw new Error(`Failed to create product: ${error.message}`);
    }
  },

  // Update existing product
  async updateProduct(productId, productData) {
    
    const { profit_margin, ...dataToUpdate } = productData;
    console.log ('profit_margin', profit_margin);

    try {
      const { data, error } = await supabaseAdmin
        .from('products')
        .update(dataToUpdate)
        .eq('id', productId)
        .select()
        .single();

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Update product error:', error);
      throw new Error(`Failed to update product: ${error.message}`);
    }
  },

  // Delete product
  async deleteProduct(productId) {
    try {
      const { error } = await supabaseAdmin
        .from('products')
        .delete()
        .eq('id', productId);

      if (error) throw error;
      return { success: true };
    } catch (error) {
      console.error('Delete product error:', error);
      throw new Error(`Failed to delete product: ${error.message}`);
    }
  },

  // gonna have to use this for now to quickly create users. workflow with edge functions above need to be properly figured out.
  async testManualAddUser(email, password, role = 'practitioner') {
    try {
      const { data: authData, error: signUpError } = await supabaseAdmin.auth.admin.createUser({
        email,
        password,
        email_confirm: true,
        user_metadata: {
          role,
          is_new_user: true
        }
      });

      if (signUpError) throw signUpError;
      if (!authData?.user?.id) throw new Error('User creation failed - no user ID returned');

      const { error: profileError } = await supabaseAdmin
        .from('profiles')
        .insert([{
          id: authData.user.id,
          first_name: 'Test',
          last_name: 'User',
          email: email,
          role: role
        }]);

      if (profileError) {
        await supabaseAdmin.auth.admin.deleteUser(authData.user.id);
        throw profileError;
      }

      return {
        success: true,
        user: authData.user
      };
    } catch (error) {
      console.error('Test user creation error:', error);
      throw new Error(`Failed to create test user: ${error.message}`);
    }
  },

   // Fetch appointments for a specific availability slot
   getAppointmentsByAvailability: async (availabilityId) => {
    try {
      const { data, error } = await supabaseAdmin
        .from('appointments')
        .select('*')
        .eq('availability_id', availabilityId);

      if (error) throw error;

      return data;
    } catch (error) {
      console.error('Error fetching appointments:', error);
      throw error;
    }
  },

  // Fetch appointments by practitioner
  getAppointmentsByPractitioner: async (practitionerId) => {
    try {
      const { data, error } = await supabaseAdmin
        .from('appointments')
        .select('availability_id')
        .eq('practitioner_id', practitionerId);

      if (error) throw error;

      return data;
    } catch (error) {
      console.error('Error fetching appointments:', error);
      throw error;
    }
  },

  getPractitioners: async () => {
    const { data, error } = await supabaseAdmin
      .from('profiles')
      .select('*')
      .eq('role', 'practitioner')
      .eq('is_active', true); 
    if (error) throw error;
    return data;
  },


  // Fetch practitioner's availability
  getPractitionerAvailability: async (practitionerId) => {
    try {
      const { data, error } = await supabaseAdmin
        .from('availability')
        .select('*')
        .eq('practitioner_id', practitionerId)
        .order('date', { ascending: true });

      if (error) throw error;

      return data;
    } catch (error) {
      console.error('Error fetching practitioner availability:', error);
      throw error;
    }
  },

  // Update availability slot
  updateAvailability: async (editedData) => {
    // Log the data being sent for debugging
    console.log('adminService.updateAvailability called with:', editedData);

    // Validate required fields
    const requiredFields = ['id', 'practitioner_id', 'service_id', 'date', 'start_time', 'end_time', 'is_available'];
    const missingFields = requiredFields.filter(field => !(field in editedData));
    if (missingFields.length > 0) {
      throw new Error(`Missing required fields: ${missingFields.join(', ')}`);
    }

    // Additional validation can be added here (e.g., date and time formats)

    const { data, error } = await supabaseAdmin
      .from('availability')
      .update({
        practitioner_id: editedData.practitioner_id,
        date: editedData.date,
        start_time: editedData.start_time,
        end_time: editedData.end_time,
        service_id: editedData.service_id,
        is_available: editedData.is_available
      })
      .eq('id', editedData.id)
      .select(); // Fetch the updated record

    if (error) {
      console.error('Error updating availability:', error);
      throw error;
    }

    console.log('Availability updated successfully:', data);
    return data;
  },

  // Delete availability slot
  deleteAvailability: async (availabilityId) => {
    try {
      const { error } = await supabaseAdmin
        .from('availability')
        .delete()
        .eq('id', availabilityId);

      if (error) {
        if (error.message.includes('violates foreign key constraint')) {
          throw new Error('Cannot delete this slot as there are existing appointments.');
        }
        throw error;
      }

      return { success: true };
    } catch (error) {
      console.error('Error deleting availability:', error);
      throw new Error(error.message || 'Failed to delete availability.');
    }
  },


   // Toggle availability status
   toggleAvailabilityStatus: async (availabilityId, newStatus) => {
    try {
      const { error } = await supabaseAdmin
        .from('availability')
        .update({ is_available: newStatus })
        .eq('id', availabilityId);

      if (error) throw error;

      return { success: true };
    } catch (error) {
      console.error('Error toggling availability status:', error);
      throw error;
    }
  },

  // Fetch services data
  fetchServicesData: async () => {
    try {
      const { data: services, error: servicesError } = await supabaseAdmin
        .from('services')
        .select('*');

      if (servicesError) throw servicesError;

      const { data: practitionerServices, error: psError } = await supabaseAdmin
        .from('practitioner_services')
        .select('*');

      if (psError) throw psError;

      return { services, practitionerServices };
    } catch (error) {
      console.error('Error fetching services data:', error);
      throw error;
    }
  }

};