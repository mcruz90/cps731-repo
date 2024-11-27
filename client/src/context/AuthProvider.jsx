// AuthProvider fleshes out the authentication context in greater detail
// e.g. it subscribes to auth state changes, which is useful for immediately updating the UI when the user logs in or out
// also tracks their current session state, as this will be needed to see if the user is too idle for a certain period of time and needs to be logged out for security reasons
// TODO: add a function to track how long the user has been idle and log them out if they have been idle for too long

import { useState, useEffect } from 'react';

// authentication API service
import { authService } from '@/services/api/auth';

// authentication context so that the authentication state can be accessed by the components that need it
import { AuthContext } from './AuthContext';

// prop types for typechecking the props passed to the component
import PropTypes from 'prop-types';

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [loadingState, setLoadingState] = useState({
    auth: true,
    profile: false,
    login: false,
    logout: false,
  });

  // initialize the authentication state
  useEffect(() => {
    let mounted = true;
    
    const initializeAuth = async () => {
      try {
        setLoadingState(prev => ({ ...prev, auth: true }));
        const session = await authService.getCurrentSession();
        
        if (!mounted) return;

        if (session?.user) {
          setUser(session.user);
          setLoadingState(prev => ({ ...prev, profile: true }));
          
          try {
            const userProfile = await authService.getUserProfile(session.user.id);
            if (mounted) {
              setProfile(userProfile);
            }
          } catch (profileError) {
            console.error('Error fetching profile:', profileError);
            if (mounted) {
              setProfile(null);
            }
          } finally {
            if (mounted) {
              setLoadingState(prev => ({ ...prev, profile: false }));
            }
          }
        }
      } catch (error) {
        console.error('Error initializing auth:', error);
        if (mounted) {
          setError(error);
        }
      } finally {
        if (mounted) {
          setLoadingState(prev => ({ 
            ...prev, 
            auth: false,
            profile: false 
          }));
          setLoading(false);
        }
      }
    };

    initializeAuth();

    // Subscribe to auth state changes
    const { data: { subscription } } = authService.onAuthStateChange(async (event, session) => {
      //console.log('Auth state changed:', event, session?.user);
      
      if (!mounted) return;

      setLoadingState(prev => ({ 
        ...prev, 
        auth: true,
        profile: false 
      }));

      if (session?.user) {
        setUser(session.user);
        setLoadingState(prev => ({ ...prev, profile: true }));
        
        try {
          const userProfile = await authService.getUserProfile(session.user.id);
          if (mounted) {
            setProfile(userProfile);
          }
        } catch (error) {
          console.error('Error fetching user profile:', error);
          if (mounted) {
            setProfile(null);
          }
        } finally {
          if (mounted) {
            setLoadingState(prev => ({ 
              ...prev, 
              auth: false,
              profile: false 
            }));
          }
        }
      } else {
        setUser(null);
        setProfile(null);
        setLoadingState(prev => ({ 
          ...prev, 
          auth: false,
          profile: false 
        }));
      }
    });

    return () => {
      mounted = false;
      subscription?.unsubscribe();
    };
  }, []);

  // TODO: remove this logging, only needed it for debugging
  //useEffect(() => {
  //  console.log('AuthProvider state:', {
  //    user,
  //    profile,
  //    loading,
  //    loadingState,
  //    error
  //  });
  //}, [user, profile, loading, loadingState, error]);

  
  // the value that will be provided to the components that need it
  const value = {
    user,
    profile,
    loading,
    loadingState,
    error,
    isAuthenticated: !!user,
    login: async (email, password) => {
      setLoadingState(prev => ({ ...prev, login: true }));
      try {
        const { user: authUser } = await authService.login(email, password);
        setUser(authUser);
        const userProfile = await authService.getUserProfile(authUser.id);
        setProfile(userProfile);
        return { user: authUser, profile: userProfile };
      } catch (error) {
        setError(error);
        throw error;
      } finally {
        setLoadingState(prev => ({ ...prev, login: false }));
      }
    },
    logout: async () => {
      setLoadingState(prev => ({ ...prev, logout: true }));
      try {
        await authService.logout();
        setUser(null);
        setProfile(null);
      } catch (error) {
        setError(error);
        throw error;
      } finally {
        setLoadingState(prev => ({ ...prev, logout: false }));
      }
    },
    clearError: () => setError(null),
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

AuthProvider.propTypes = {
  children: PropTypes.node.isRequired,
};

export default AuthProvider;