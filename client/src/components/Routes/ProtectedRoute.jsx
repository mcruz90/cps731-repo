import { Navigate } from 'react-router-dom';
import PropTypes from 'prop-types';
import { useAuth } from '@/hooks/useAuth';
import { Box, CircularProgress } from '@mui/material';

export const ProtectedRoute = ({ children, allowedRoles }) => {
  const { isAuthenticated, userRole, loadingState } = useAuth();
  
  if (loadingState.auth || loadingState.profile) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
        <CircularProgress />
      </Box>
    );
  }

  if (!isAuthenticated || !allowedRoles.includes(userRole)) {
    return <Navigate to="/login" replace />;
  }

  return children;
};

ProtectedRoute.propTypes = {
  children: PropTypes.node.isRequired,
  allowedRoles: PropTypes.arrayOf(PropTypes.string).isRequired
};