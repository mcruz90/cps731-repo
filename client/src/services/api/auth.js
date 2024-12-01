import { supabase } from './index';
import { profileService } from './profile';

// Add session caching for 30min
const CACHE_KEY = 'authSession';
const CACHE_DURATION = 30 * 60 * 1000; 

// helper function to get the cached session
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
// Available methods:
// getCurrentSession, - tries to get the cached session first (params: none)
// getUserProfile, - fetches the user profile from the database (params: userId)
// login, - logs in the user (params: email, password)
// logout, - logs out the user (params: none)
// onAuthStateChange, - listens for changes in the user's authentication state (params: callback function)
// register, - registers a new user (params: userData)
// getUserRoleById, - fetches the user role from the database (params: userId)
// resetPassword, - resets the user's password ***** BACKBURNER UNTIL SEND-EMAIL EDGE FUNCTIONS IN SUPABASE FIGURED OUT???
// setSession, - verifies the token for password setup ***** BACKBURNER UNTIL SEND-EMAIL EDGE FUNCTIONS IN SUPABASE FIGURED OUT???
// updatePassword, - updates the user's password ***** BACKBURNER UNTIL SEND-EMAIL EDGE FUNCTIONS IN SUPABASE FIGURED OUT???

export const authService = {
    // tries to get the cached session first
    async getCurrentSession() {
      const cachedSession = getCachedSession();
      if (cachedSession) {
        
        // Check if the token is expired
        const { exp } = JSON.parse(atob(cachedSession.access_token.split('.')[1]));
        const currentTime = Math.floor(Date.now() / 1000);
        if (exp > currentTime) {
          return cachedSession;
        } else {

          // Token expired, refresh the session
          const { data: { session }, error } = await supabase.auth.refreshSession();
          if (error) throw error;
          
          // Cache the new session
          if (session) {
            localStorage.setItem(CACHE_KEY, JSON.stringify({
              session,
              timestamp: Date.now(),
            }));
          }
          return session;
        }
      }
    
      const { data: { session }, error } = await supabase.auth.getSession();
      if (error) throw error;
    
      // Cache the session
      if (session) {
        localStorage.setItem(CACHE_KEY, JSON.stringify({
          session,
          timestamp: Date.now(),
        }));
      }
    
      return session;
    },
  
    // fetches the user profile from the database
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
  
    // logs in the user
    async login(email, password) {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password
      });
      
      if (error) throw error;
      return { user: data.user };
    },
  
    // logs out the user
    async logout() {
      const { error } = await supabase.auth.signOut();
      if (error) throw error;
    },
  
    // listens for changes in the user's authentication state
    onAuthStateChange(callback) {
      return supabase.auth.onAuthStateChange(callback);
    },
  
    // registers a new user
    async register(userData) {
        try {
            
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
                    // If profile creation fails, we should probably delete the auth user // need to rethink this flow
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
    
    // resets the user's password
    async resetPassword(email) {
        const { error } = await supabase.auth.resetPasswordForEmail(email, {
            redirectTo: `${window.location.origin}/set-password`,
        });
        
        if (error) throw error;
        return true;
    },
  
    // fetches the user role from the database
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

    // verifies the token for password setup
    async setSession(token) {
        try {
            console.log('Attempting to verify token:', token);
            
            let response;
            try {
                response = await supabase.auth.verifyOtp({
                    token_hash: token,
                    type: 'recovery'
                });
            } catch (e) {
                console.log(e, 'OTP verification failed, trying session recovery');
                response = await supabase.auth.getSession();
            }
            
            const { data, error } = response;
            
            if (error) throw error;
            
            console.log('Session verification response:', data);
            return { session: data.session };
        } catch (error) {
            console.error('Set session error:', error);
            throw error;
        }
    },

    // updates the user's password
    async updatePassword(password) {
        try {
            const { data, error } = await supabase.auth.updateUser({
                password: password
            });
            
            if (error) throw error;
            return { user: data.user };
        } catch (error) {
            console.error('Password update error:', error);
            throw error;
        }
    }
};

