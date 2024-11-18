import { supabase } from './index';

export const userService = {
  // Get profile -- used to get the logged in user's profile
  getProfile: async (userId) => {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .single();
      
    if (error) throw error;
    return data;
  },

  // Update profile -- used to update the logged inuser's profile
  updateProfile: async (userId, updates) => {
    const { data, error } = await supabase
        .from('profiles')
        .update(updates)
        .eq('id', userId)
        .select()
        .single();
      
    if (error) throw error;
    return data;
  },

  // Get all users with some of their profile data--only available to admins
  getAllUsers: async () => {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select(`
          id,
          first_name,
          last_name,
          email,
          phone,
          city,
          role,
          created_at
        `)
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error fetching users:', error);
      throw error;
    }
  }
};