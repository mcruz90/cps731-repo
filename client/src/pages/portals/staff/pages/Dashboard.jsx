import { Card, CardContent, Typography } from "@mui/material";
import PortalLayout from "@/components/Layout/PortalLayout";
import { Grid } from "@mui/material";

export default function Dashboard() {
  return (
    <PortalLayout>
      <Typography variant='h4' component='h1' gutterBottom>
        Staff Dashboard
      </Typography>

      <Grid container spacing={3}>
        <Grid item xs={12} md={4}>
          <Card>
            <CardContent>
              <Typography variant='h6' gutterBottom>
                Upcoming Check-ins
              </Typography>
              <Typography variant='h3'>3</Typography>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} md={4}>
          <Card>
            <CardContent>
              <Typography variant='h6' gutterBottom>
                Inventory Alerts
              </Typography>
              <Typography variant='h3'>2</Typography>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} md={4}>
          <Card>
            <CardContent>
              <Typography variant='h6' gutterBottom>
                Messages
              </Typography>
              <Typography variant='h3'>5</Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </PortalLayout>
  );
};
