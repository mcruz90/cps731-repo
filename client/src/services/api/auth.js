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
    },
  
    async register(userData) {
        try {
            // Explicitly destructure only the fields we want to send to Supabase
            const { 
                email, 
                password, 
                first_name,
                last_name,
                phone,
                address,
                city,
                province,
                postal_code
            } = userData;
            
            console.log('Starting registration process with data:', { 
                email, 
                first_name, 
                last_name 
            });
            
            // Sign up the user
            const { data: authData, error: signUpError } = await supabase.auth.signUp({
                email,
                password,
                options: {
                    data: {
                        role: 'client'
                    }
                }
            });

            if (signUpError) {
                console.error('Auth signup error:', signUpError);
                throw signUpError;
            }

            console.log('Auth signup successful:', authData?.user?.id);

            if (authData?.user) {
                // Create the user profile with only the fields that exist in the profiles table
                const newProfileData = {
                    id: authData.user.id,
                    first_name,
                    last_name,
                    phone,
                    address,
                    city,
                    province,
                    postal_code,
                    role: 'client',
                    is_active: true
                };

                console.log('Attempting to create profile with data:', newProfileData);

                const { data: createdProfile, error: profileError } = await supabase
                    .from('profiles')
                    .insert([newProfileData])
                    .select()
                    .single();

                if (profileError) {
                    console.error('Profile creation error:', profileError);
                    // If profile creation fails, we should probably delete the auth user
                    await supabase.auth.admin.deleteUser(authData.user.id);
                    throw profileError;
                }

                console.log('Profile created successfully:', createdProfile);
                return { user: authData.user, profile: createdProfile };
            }
            
            return null;
        } catch (error) {
            console.error('Registration process error:', error);
            throw error;
        }
    },
  
    async resetPassword(email) {
        const { error } = await supabase.auth.resetPasswordForEmail(email, {
            redirectTo: `${window.location.origin}/reset-password`,
        });
        
        if (error) throw error;
        return true;
    },
  
    async getUserRoleById(userId) {
        try {
            const { data: profile, error } = await supabase
                .from('profiles')
                .select('role')
                .eq('id', userId)
                .single();

            if (error) throw error;
            return profile;
        } catch (error) {
            console.error('Error fetching user role:', error);
            throw error;
        }
    },
};

