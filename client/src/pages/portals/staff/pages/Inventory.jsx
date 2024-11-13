import { Typography } from '@mui/material';
import PortalLayout from '@/components/Layout/PortalLayout';

const Inventory = () => {
  return (
    <PortalLayout>
      <Typography variant="h4" component="h1" gutterBottom>
        Inventory
      </Typography>
      {/* Add inventory component here */}
    </PortalLayout>
  );
};

export default Inventory