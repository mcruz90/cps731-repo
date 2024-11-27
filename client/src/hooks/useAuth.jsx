// This hook is used to access the authentication state
import { useContext } from 'react';

// authentication context so that the authentication state can be accessed by the components that need it
import { AuthContext } from '../context/AuthContext';

export function useAuth() {
  const context = useContext(AuthContext);
  
  // throw an error if the useAuth hook is used outside of an AuthProvider
  // prevents unauthorized access to protected routes
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }

  // get the role with proper fallback chain, depending on which data is available in supabase
  const userRole = context.profile?.role || 
                  context.user?.user_metadata?.role || 
                  context.user?.role;

  const isAuthenticated = context.user !== null;

  // TODO: remove this logging, only needed it for debugging
  //console.log('useAuth hook state:', {
  //  isAuthenticated,
  //  userRole,
  //  user: context.user,
  //  profile: context.profile,
  //  loading: context.loading,
  //  loadingState: context.loadingState
  //});

  return {
    ...context,
    userRole,
    isAuthenticated,
    user: context.user
  };
}