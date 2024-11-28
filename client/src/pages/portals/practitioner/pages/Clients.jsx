import React from 'react';
import { Typography } from '@mui/material';
import PortalLayout from '@/components/Layout/PortalLayout';

const Clients = () => {
  return (
    <PortalLayout>
      <Typography variant="h4" component="h1" gutterBottom>
        Clients
      </Typography>
      {/* Add client-related components here */}
    </PortalLayout>
  );
};

export default Clients;