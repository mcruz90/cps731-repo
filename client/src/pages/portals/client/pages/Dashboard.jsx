import { Card, CardContent, Typography } from '@mui/material';
import Grid from '@mui/material/Grid2';
import PortalLayout from '@/components/Layout/PortalLayout';

const Dashboard = () => {
  return (
    <PortalLayout>
      <Typography variant="h4" component="h1" gutterBottom>
        Client Dashboard
      </Typography>
      <Grid container spacing={3}>
        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Typography variant="h6">Upcoming Appointments</Typography>
              {/* Add appointment list here */}
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Typography variant="h6">Recent Activity</Typography>
              {/* Add activity list here */}
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </PortalLayout>
  );
};

export default Dashboard;