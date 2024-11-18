import { supabaseAdmin } from './adminClient';

export const adminService = {
  async createUser(userData) {
    console.log('AdminService: createUser called with:', userData);

    if (!userData.userEmail || !userData.password || !userData.userRole) {
      throw new Error('Required fields missing');
    }

    try {
      // Step 1: Create auth user
      const { data: authData, error: signUpError } = await supabaseAdmin.auth.admin.createUser({
        email: userData.userEmail,
        password: userData.password,
        email_confirm: true,
        user_metadata: {
          full_name: userData.userName,
          role: userData.userRole
        }
      });

      if (signUpError) {
        console.error('Auth creation error:', signUpError);
        throw signUpError;
      }

      if (!authData?.user?.id) {
        throw new Error('User creation failed - no user ID returned');
      }

      // Step 2: Create profile
      const { error: profileError } = await supabaseAdmin
        .from('profiles')
        .insert([{
          id: authData.user.id,
          first_name: userData.userName.split(' ')[0],
          last_name: userData.userName.split(' ').slice(1).join(' '),
          role: userData.userRole,
          email: userData.userEmail
        }]);

      if (profileError) {
        console.error('Profile creation error:', profileError);
        // Cleanup: Delete auth user if profile creation fails
        await supabaseAdmin.auth.admin.deleteUser(authData.user.id);
        throw profileError;
      }

      // Step 3: Create user role
      const { error: roleError } = await supabaseAdmin
        .from('user_roles')
        .insert([{
          user_id: authData.user.id,
          role: userData.userRole
        }]);

      if (roleError) {
        console.error('Role assignment error:', roleError);
        // Cleanup: Delete auth user and profile if role assignment fails
        await supabaseAdmin.auth.admin.deleteUser(authData.user.id);
        throw roleError;
      }

      return {
        user: authData.user,
        profile: {
          first_name: userData.userName.split(' ')[0],
          last_name: userData.userName.split(' ').slice(1).join(' '),
          role: userData.userRole
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
          role,
          created_at
        `);

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('AdminService error:', error);
      throw new Error(`Failed to fetch users: ${error.message}`);
    }
  }
};