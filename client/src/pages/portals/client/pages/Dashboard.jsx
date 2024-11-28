import { Grid, Card, CardContent, Typography, Button, Box } from '@mui/material';
import ShoppingBagIcon from '@mui/icons-material/ShoppingBag';
import CalendarMonthIcon from '@mui/icons-material/CalendarMonth';
import PortalLayout from '@/components/Layout/PortalLayout';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import MessagesList from './components/messaging/MessagesList';
import AppointmentList from './components/AppointmentList';
import { useAppointments } from '@/hooks/useAppointments';

export default function Dashboard() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { appointments, loading, error } = useAppointments(user?.id);

  return (
    <PortalLayout>
      <Grid container spacing={3}>
        {/* Upcoming Appointments Section */}
        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                <CalendarMonthIcon sx={{ mr: 1 }} />
                <Typography variant="h6">Appointments This Week</Typography>
              </Box>
              {loading ? (
                <Typography>Loading appointments...</Typography>
              ) : error ? (
                <Typography color="error">{error}</Typography>
              ) : (
                <AppointmentList appointments={appointments} readOnly />
              )}
              <Box mt={2} display="flex" gap={2}>
                <Button
                  variant="contained"
                  onClick={() => navigate('/client/appointments')}
                >
                  View All Appointments
                </Button>
                <Button
                  variant="contained"
                  onClick={() => navigate('/client/appointments/book')}
                >
                  Book an Appointment
                </Button>
              </Box>
            </CardContent>
          </Card>
        </Grid>

        {/* Shop Products Section */}
        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                <ShoppingBagIcon sx={{ mr: 1 }} />
                <Typography variant="h6">Shop Products</Typography>
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

        {/* Messages Section */}
        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <MessagesList userId={user?.id} />
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </PortalLayout>
  );
}
