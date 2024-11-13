// Currently only dummy data is displayed--this will need to be replaced with actual data from supabase
// TODO: need to render actual layout and data from supabase
// TODO: add report display and search/filter functionality
import { Card, CardContent, Typography } from '@mui/material';
import Grid from '@mui/material/Grid2';
import PortalLayout from '@/components/Layout/PortalLayout';

const Dashboard = () => {
  return (
    <PortalLayout>
      <Typography variant="h4" component="h1" gutterBottom>
        Admin Dashboard
      </Typography>
      
      <Grid container spacing={3}>
        <Grid item xs={12} md={4}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Total Users
              </Typography>
              <Typography variant="h3">150</Typography>
            </CardContent>
          </Card>
        </Grid>
        
        <Grid item xs={12} md={4}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Today Appointments
              </Typography>
              <Typography variant="h3">24</Typography>
            </CardContent>
          </Card>
        </Grid>
        
        <Grid item xs={12} md={4}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Revenue This Month
              </Typography>
              <Typography variant="h3">$12,450</Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </PortalLayout>
  );
};

export default Dashboard;