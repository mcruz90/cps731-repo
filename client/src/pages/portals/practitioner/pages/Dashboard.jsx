import { Card, CardContent, Typography } from '@mui/material';
import {Grid} from '@mui/material';
import PortalLayout from '@/components/Layout/PortalLayout';

export default function Dashboard() {
  return (
    <PortalLayout>
      <Typography variant="h4" component="h1" gutterBottom>
        Practitioner Dashboard
      </Typography>
      
      <Grid container spacing={3}>
        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Today Schedule
              </Typography>
              <Typography variant="body1">
                You have 5 appointments today
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        
        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Client Updates
              </Typography>
              <Typography variant="body1">
                2 new client notes need review
              </Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </PortalLayout>
  );
};