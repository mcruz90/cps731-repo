import { supabase } from './index';
import { profileService } from './profile';

// Add session caching for 30min
const CACHE_KEY = 'authSession';
const CACHE_DURATION = 30 * 60 * 1000; 

const getCachedSession = () => {
  const cached = localStorage.getItem(CACHE_KEY);
  if (!cached) return null;

  const { session, timestamp } = JSON.parse(cached);
  if (Date.now() - timestamp < CACHE_DURATION) {
    return session;
  }

  localStorage.removeItem(CACHE_KEY);
  return null;
};

// Auth service set up using Supabase
export const authService = {
    async getCurrentSession() {
      // Try to get cached session first
      const cachedSession = getCachedSession();
      if (cachedSession) {
        return cachedSession;
      }

      const { data: { session }, error } = await supabase.auth.getSession();
      if (error) throw error;

      // Cache the session
      if (session) {
        localStorage.setItem(CACHE_KEY, JSON.stringify({
          session,
          timestamp: Date.now()
        }));
      }

      return session;
    },
  
    async getUserProfile(userId) {
      const cacheKey = `profile_${userId}`;
      const cachedProfile = localStorage.getItem(cacheKey);
      
      if (cachedProfile) {
        return JSON.parse(cachedProfile);
      }

      try {
        const profile = await profileService.getProfile(userId);
        if (profile) {
          localStorage.setItem(cacheKey, JSON.stringify(profile));
        }
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

