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

const NavLink = styled(Link)(({ theme }) => ({
  color: theme.palette.text.primary,
  textDecoration: 'none',
  marginLeft: '1rem',
  transition: 'color 0.2s ease-in-out',
  '&:hover': {
    color: theme.palette.primary.main,
  }
}));

const StyledButton = styled(Button)(({ theme }) => ({
  color: theme.palette.text.primary,
  fontWeight: 500,
  '&:hover': {
    color: theme.palette.primary.main,
    backgroundColor: 'rgba(123, 176, 212, 0.08)',
  },
  '&.register-btn': {
    backgroundColor: theme.palette.primary.main,
    color: theme.palette.common.white,
    '&:hover': {
      backgroundColor: theme.palette.primary.dark,
      color: theme.palette.common.white,
    }
  }
}));

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

  const renderNavItems = () => {
    if (!isAuthenticated) {
      return (
        <>
          <StyledButton 
            component={NavLink} 
            to="/login"
          >
            Login
          </StyledButton>
          <StyledButton 
            component={NavLink} 
            to="/register"
            className="register-btn"
          >
            Register
          </StyledButton>
        </>
      );
    }


    return (
      <Box sx={{ display: 'flex', alignItems: 'center' }}>
        
        <StyledButton 
          component={NavLink} 
          to="/about"
        >
          About
        </StyledButton>
        {userRole === 'client' && <CartButton />}
        <StyledButton 
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
        </StyledButton>
      </Box>
    );
  };

  return (
    <>
      <AppBar 
        position="static" 
        sx={{ 
          backgroundColor: 'rgba(255, 255, 255, 0.95)',
          boxShadow: '0 2px 4px rgba(123, 176, 212, 0.1)',
        }}
      >
        <Toolbar>
          <Typography 
            variant="h6" 
            component={NavLink} 
            to="/" 
            sx={{ 
              flexGrow: 1,
              fontWeight: 600,
              color: (theme) => theme.palette.primary.main,
              '&:hover': {
                color: (theme) => theme.palette.primary.dark,
              }
            }}
          >
            Serenity
          </Typography>
          {renderNavItems()}
        </Toolbar>
      </AppBar>

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