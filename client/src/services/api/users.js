import { supabase } from './index';

export const userService = {
  // Get profile -- used to get the logged in user's profile when they go to their profile page
  getProfile: async (userId) => {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .single();
      
    if (error) throw error;
    return data;
  },

  // Update profile -- used to update the logged in user's profile
  updateProfile: async (userId, updates) => {
    const { data, error } = await supabase
        .from('profiles')
        .update(updates)
        .eq('id', userId)
        .select()
        .single();
      
    if (error) throw error;
    return data;
  }
};