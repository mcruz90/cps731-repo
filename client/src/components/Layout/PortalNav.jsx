import { styled } from '@mui/material/styles';
import { Box, Container, Paper } from '@mui/material';
import { Link, useLocation } from 'react-router-dom';
import PropTypes from 'prop-types';

const NavContainer = styled(Box)(({ theme }) => ({
  marginBottom: theme.spacing(4),
  marginTop: theme.spacing(2),
}));

const NavWrapper = styled(Paper)(({ theme }) => ({
  padding: theme.spacing(1),
  backgroundColor: theme.palette.background.paper,
  borderRadius: theme.shape.borderRadius,
  boxShadow: '0 1px 3px rgba(123, 176, 212, 0.12)',
}));

const NavLink = styled(Link)(({ theme, active }) => ({
  color: active ? theme.palette.primary.main : theme.palette.text.secondary,
  textDecoration: 'none',
  padding: theme.spacing(1, 2),
  display: 'inline-block',
  fontSize: '0.9rem',
  fontWeight: 500,
  borderRadius: theme.shape.borderRadius,
  backgroundColor: active ? 'rgba(123, 176, 212, 0.08)' : 'transparent',
  transition: 'all 0.2s ease-in-out',
  '&:hover': {
    color: theme.palette.primary.main,
    backgroundColor: 'rgba(123, 176, 212, 0.08)',
  },
}));

const PortalNav = ({ links }) => {
  const location = useLocation();
  
  return (
    <NavContainer>
      <Container maxWidth="lg">
        <NavWrapper elevation={0}>
          <Box sx={{ 
            display: 'flex', 
            justifyContent: 'center',
            gap: 1,
            overflowX: 'auto',
            '&::-webkit-scrollbar': { height: 6 },
            '&::-webkit-scrollbar-track': { backgroundColor: 'transparent' },
            '&::-webkit-scrollbar-thumb': { backgroundColor: 'rgba(0,0,0,0.1)', borderRadius: 3 },
          }}>
            {links.map(({ to, label }) => (
              <NavLink 
                key={to} 
                to={to}
                active={location.pathname === to ? 1 : 0}
              >
                {label}
              </NavLink>
            ))}
          </Box>
        </NavWrapper>
      </Container>
    </NavContainer>
  );
};

PortalNav.propTypes = {
  links: PropTypes.arrayOf(PropTypes.shape({
    to: PropTypes.string.isRequired,
    label: PropTypes.string.isRequired
  })).isRequired
};

export default PortalNav;
