import PropTypes from 'prop-types';
import { NavLink } from 'react-router-dom';
import { Box, Button } from '@mui/material';

const PortalNav = ({ links }) => {
  return (
    <Box sx={{ display: 'flex', gap: 2, mb: 3, pt: 2, justifyContent: 'center' }}>
      {links.map((link) => (
        <Button
          key={link.to}
          component={NavLink}
          to={link.to}
          variant="none"
          color="primary"
        >
          {link.label}
        </Button>
      ))}
    </Box>
  );
};

PortalNav.propTypes = {
  links: PropTypes.arrayOf(
    PropTypes.shape({
      to: PropTypes.string.isRequired,
      label: PropTypes.string.isRequired,
    })
  ).isRequired,
};

export default PortalNav;
