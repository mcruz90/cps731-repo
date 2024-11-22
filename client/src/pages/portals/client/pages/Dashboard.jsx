import { Grid, Card, CardContent, Typography, Button, Box } from '@mui/material';
import ShoppingBagIcon from '@mui/icons-material/ShoppingBag';
import CalendarMonthIcon from '@mui/icons-material/CalendarMonth';
import PortalLayout from '@/components/Layout/PortalLayout';
import { useNavigate } from 'react-router-dom';

export default function Dashboard() {
  const navigate = useNavigate();

  return (
    <PortalLayout>
      <Grid container spacing={3}>
        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                <CalendarMonthIcon sx={{ mr: 1 }} />
                <Typography variant="h6">
                  Appointments
                </Typography>
              </Box>
              <Button 
                variant="contained" 
                onClick={() => navigate('/client/appointments')}
              >
                View Appointments
              </Button>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                <ShoppingBagIcon sx={{ mr: 1 }} />
                <Typography variant="h6">
                  Shop Products
                </Typography>
              </Box>
              <Button 
                variant="contained"
                onClick={() => navigate('/client/products')}
              >
                Browse Products
              </Button>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </PortalLayout>
  );
}