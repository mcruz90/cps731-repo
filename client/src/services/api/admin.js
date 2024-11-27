import { supabaseAdmin } from './adminClient';
import { notificationService } from './notifications';

/*
  Admin-specific database ops, so this uses supabaseAdmin rather than the regular supabase
  All other roles should import supabase from './index' instead

*/
export const adminService = {
  async createUser(userData) {
    console.log('AdminService: createUser called with:', userData);

    if (!userData.email || !userData.role) {
      throw new Error('Required fields missing');
    }

    try {
      // Create auth user
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

      // Create profile
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
          specializations: userData.role === 'practitioner' ? userData.specializations : null,
          start_date: ['practitioner', 'staff'].includes(userData.role) ? userData.startDate : null,
          availability_notes: ['practitioner', 'staff'].includes(userData.role) ? userData.availability : null
        }]);

      console.log('Profile creation response:', profileError);

      if (profileError) {
        console.error('Profile creation error:', profileError);
        await supabaseAdmin.auth.admin.deleteUser(authData.user.id);
        throw profileError;
      }

      // Send welcome email
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
          // Don't throw here - user is still created even if email fails???????
          // need to rethink this flow
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
    try {
      const updatedData = {
        first_name: userData.firstName.trim(),
        last_name: userData.lastName.trim(),
        phone: userData.phone?.trim() || null,
        email: userData.email.trim(),
        role: userData.role,
        specializations: userData.specializations?.trim() || null,
        start_date: userData.startDate || null,
        availability_notes: userData.availabilityNotes?.trim() || null,
        address: userData.address?.trim() || null,
        city: userData.city?.trim() || null,
        province: userData.province?.trim() || null,
        postal_code: userData.postalCode?.trim() || null,
        is_active: userData.isActive,
        updated_at: new Date().toISOString()
      };

      if (['staff', 'practitioner'].includes(userData.role)) {
        if (!userData.startDate) {
          throw new Error('Start date is required for staff and practitioners');
        }
      }

      const { error } = await supabaseAdmin
        .from('profiles')
        .update(updatedData)
        .eq('id', userId);

      if (error) throw error;
      return { success: true };
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
        is_active: user.is_active === null ? true : user.is_active
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
    try {
      const { data, error } = await supabaseAdmin
        .from('products')
        .update(productData)
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

      // Create basic profile
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
  }
};