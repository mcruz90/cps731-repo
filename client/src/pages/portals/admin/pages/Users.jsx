// TODO: Add user management component here (i.e. "onboarding new staff" use case and diagrams from our documents)
// TODO: only admin can add elevated user roles (e.g. staff, admin)--this needs to be done here and updated in supabase
import { Typography } from '@mui/material';
import PortalLayout from '@/components/Layout/PortalLayout';

const Users = () => {
  return (
    <PortalLayout>
      <Typography variant="h4" component="h1" gutterBottom>
        User Management
      </Typography>
      {/* TODO: Add user management component here */}
    </PortalLayout>
  );
};

export default Users;