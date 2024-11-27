import { Navigate } from 'react-router-dom';
import PropTypes from 'prop-types';
import { useAuth } from '@/hooks/useAuth';
import { Box, CircularProgress } from '@mui/material';

// Protected route component to ensure that only authenticated users with the appropriate roles can access their assigned route
export const ProtectedRoute = ({ children, allowedRoles }) => {
  const { isAuthenticated, userRole, loadingState } = useAuth();
  
  // show a loading spinner if the authentication or profile is still loading
  if (loadingState.auth || loadingState.profile) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
        <CircularProgress />
      </Box>
    );
  }

  // if the user is not authenticated or does not have the appropriate role, redirect to the login page
  if (!isAuthenticated || !allowedRoles.includes(userRole)) {
    return <Navigate to="/login" replace />;
  }

  // if the user is authenticated and has the appropriate role, render the children components (i.e. their designated portal)
  return children;
};

ProtectedRoute.propTypes = {
  children: PropTypes.node.isRequired,
  allowedRoles: PropTypes.arrayOf(PropTypes.string).isRequired
};