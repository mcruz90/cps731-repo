import PropTypes from 'prop-types';
import { Box, Container } from '@mui/material';
import { useTheme } from '@/hooks/useTheme';

const Layout = ({ children }) => {
  const theme = useTheme();

  return (
    <Box
      sx={{
        minHeight: '100vh',
        backgroundColor: theme.palette.background.default,
        paddingTop: theme.spacing(2),
        paddingBottom: theme.spacing(4)
      }}
    >
      <Container maxWidth="lg">
        {children}
      </Container>
    </Box>
  );
};

Layout.propTypes = {
  children: PropTypes.node.isRequired
};

export default Layout;