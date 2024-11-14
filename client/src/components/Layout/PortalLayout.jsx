import PropTypes from 'prop-types';
import { Box, Container, Paper } from '@mui/material';
import { useTheme } from '@/hooks/useTheme';

const PortalLayout = ({ children }) => {
  const theme = useTheme();

  return (
    <Box
      sx={{
        minHeight: 'calc(100vh - 64px)', 
        backgroundColor: theme.palette.background.default,
        paddingTop: theme.spacing(3),
        paddingBottom: theme.spacing(3)
      }}
    >
      <Container maxWidth="lg">
        <Paper
          elevation={0}
          sx={{
            padding: theme.spacing(3),
            backgroundColor: theme.palette.background.paper,
            borderRadius: theme.shape.borderRadius
          }}
        >
          {children}
        </Paper>
      </Container>
    </Box>
  );
};

PortalLayout.propTypes = {
  children: PropTypes.node.isRequired
};

export default PortalLayout;