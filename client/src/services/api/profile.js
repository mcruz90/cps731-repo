import { supabase } from './index';

export const profileService = {
  async getProfile(userId) {
    console.log('ProfileService: getProfile called with userId:', userId);
    
    if (!userId) {
      throw new Error('User ID is required');
    }

    try {
      const timeoutPromise = new Promise((_, reject) => {
        setTimeout(() => reject(new Error('Profile fetch timeout')), 5000);
      });

      const fetchPromise = supabase
        .from('profiles')
        .select('id, first_name, last_name, phone, address, city, province, postal_code, role')
        .eq('id', userId)
        .single();

      const { data, error } = await Promise.race([fetchPromise, timeoutPromise]);

      console.log('Profile query result:', { data, error });

      if (error) {
        throw error;
      }

      return data;
    } catch (error) {
      console.error('ProfileService error:', error);
      throw new Error(`Failed to fetch profile: ${error.message}`);
    }
  },

  async updateProfile(userId, profileData) {
    if (!userId) {
      throw new Error('User ID is required');
    }

    try {
      const { data, error } = await supabase
        .from('profiles')
        .update({
          first_name: profileData.firstName,
          last_name: profileData.lastName,
          phone: profileData.phone,
          address: profileData.address,
          city: profileData.city,
          province: profileData.province,
          postal_code: profileData.postalCode,
          updated_at: new Date().toISOString()
        })
        .eq('id', userId)
        .select()
        .single();

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Update profile error:', error);
      throw new Error(`Failed to update profile: ${error.message}`);
    }
  }
};

// testing rls---may need to disable policies. admin can't access any reports with RLS on.
export const debugProfileService = {
  async testConnection() {
    const { data, error } = await supabase.from('profiles').select('count(*)');
    console.log('Connection test:', { data, error });
    return { data, error };
  },

  async testRLS(userId) {
    const { data, error } = await supabase.auth.getUser();
    console.log('Current auth state:', { data, error });
    
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', userId)
      .single();
      
    console.log('testing test test test for rls:', { profile, error: profileError });
    return { profile, error: profileError };
  }
};