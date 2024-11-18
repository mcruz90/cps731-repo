import { supabase } from './index';
import { profileService } from './profile';

// Auth service set up using Supabase
export const authService = {
    async getCurrentSession() {
      const { data: { session }, error } = await supabase.auth.getSession();
      if (error) throw error;
      return session;
    },
  
    async getUserProfile(userId) {
      try {
        const profile = await profileService.getProfile(userId);
        return profile;
      } catch (error) {
        console.error('Error fetching user profile:', error);
        return null;
      }
    },
  
    async login(email, password) {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password
      });
      
      if (error) throw error;
      return { user: data.user };
    },
  
    async logout() {
      const { error } = await supabase.auth.signOut();
      if (error) throw error;
    },
  
    onAuthStateChange(callback) {
      return supabase.auth.onAuthStateChange(callback);
    }
  };

