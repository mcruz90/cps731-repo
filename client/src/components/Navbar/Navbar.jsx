import { useState } from 'react';
import { 
  AppBar, 
  Toolbar, 
  Typography, 
  Button,
  CircularProgress,
  Snackbar,
  Alert,
  Box 
} from '@mui/material';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { styled } from '@mui/material/styles';
import CartButton from './CartButton';

const NavLink = styled(Link)({
  color: 'inherit',
  textDecoration: 'none',
  marginLeft: '1rem'
});

const Navbar = () => {
  const { isAuthenticated, userRole, logout, loadingState } = useAuth();
  const navigate = useNavigate();
  const [error, setError] = useState(null);

  const handleLogout = async () => {
    try {
      await logout();
      navigate('/');
    } catch (err) {
      console.error('Logout error:', err);
      setError('Failed to logout. Please try again.');
    }
  };

  // Render different navigation items based on authentication and role
  const renderNavItems = () => {
    if (!isAuthenticated) {
      return (
        <>
          <Button 
            component={NavLink} 
            to="/login" 
            color="inherit"
          >
            Login
          </Button>
          <Button 
            component={NavLink} 
            to="/register" 
            color="inherit"
          >
            Register
          </Button>
        </>
      );
    }

    // Role-specific navigation
    const roleRoutes = {
      client: '/client',
      practitioner: '/practitioner',
      admin: '/admin',
      staff: '/staff'
    };

    return (
      <Box sx={{ display: 'flex', alignItems: 'center' }}>
        <Button 
          component={NavLink} 
          to={roleRoutes[userRole] || '/'} 
          color="inherit"
        >
          Dashboard
        </Button>
        <Button 
          component={NavLink} 
          to="/profile" 
          color="inherit"
        >
          Profile
        </Button>
        <Button 
          component={NavLink} 
          to="/about" 
          color="inherit"
        >
          About
        </Button>
        {userRole === 'client' && <CartButton />} {/* Only show for clients */}
        <Button 
          color="inherit" 
          onClick={handleLogout}
          disabled={loadingState?.logout}
          sx={{ 
            display: 'flex', 
            alignItems: 'center', 
            gap: 1 
          }}
        >
          {loadingState?.logout ? (
            <CircularProgress size={20} color="inherit" />
          ) : (
            'Logout'
          )}
        </Button>
      </Box>
    );
  };

  return (
    <>
      <AppBar position="static">
        <Toolbar>
          <Typography 
            variant="h6" 
            component={NavLink} 
            to="/" 
            sx={{ flexGrow: 1 }}
          >
            Serenity
          </Typography>
          {renderNavItems()}
        </Toolbar>
      </AppBar>

      {/* Error Snackbar */}
      <Snackbar 
        open={!!error} 
        autoHideDuration={6000} 
        onClose={() => setError(null)}
        anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
      >
        <Alert 
          onClose={() => setError(null)} 
          severity="error" 
          sx={{ width: '100%' }}
        >
          {error}
        </Alert>
      </Snackbar>
    </>
  );
};

export default Navbar;