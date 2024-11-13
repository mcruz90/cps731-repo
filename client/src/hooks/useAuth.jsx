// This hook is used to access the authentication state
import { useContext } from 'react';
import { AuthContext } from '../context/AuthContext';

export function useAuth() {
  const context = useContext(AuthContext);
  
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }

  // Get the role with proper fallback chain, depending on which data is available in supabase
  const userRole = context.profile?.role || 
                  context.user?.user_metadata?.role || 
                  context.user?.role;

  const isAuthenticated = context.user !== null;

  console.log('useAuth hook state:', {
    isAuthenticated,
    userRole,
    user: context.user,
    profile: context.profile,
    loading: context.loading,
    loadingState: context.loadingState
  });

  return {
    ...context,
    userRole,
    isAuthenticated,
    user: context.user
  };
}