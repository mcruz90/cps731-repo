import { Grid, Card, CardContent, Typography, Button, Box } from '@mui/material';
import ShoppingBagIcon from '@mui/icons-material/ShoppingBag';
import CalendarMonthIcon from '@mui/icons-material/CalendarMonth';
import PortalLayout from '@/components/Layout/PortalLayout';
import { useNavigate } from 'react-router-dom';
import { useEffect, useState } from 'react';
import { appointmentService } from '@/services/api/appointments';
import AppointmentList from './components/AppointmentList'; 
import { useAuth } from '@/hooks/useAuth';
import { getCurrentWeekDateRange } from '@/utils/dateUtils';

export default function Dashboard() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [upcomingAppointments, setUpcomingAppointments] = useState([]);
  const [loadingAppointments, setLoadingAppointments] = useState(true);
  const [appointmentError, setAppointmentError] = useState(null);

  useEffect(() => {
    if (!user) return;

    const fetchUpcomingAppointments = async () => {
      try {
        const { start, end } = getCurrentWeekDateRange();
        const appointments = await appointmentService.getAppointmentsByDateRange(
          user.id,
          start,
          end
        );
        setUpcomingAppointments(appointments);
      } catch (error) {
        console.error('Error fetching upcoming appointments:', error);
        setAppointmentError('Failed to load upcoming appointments.');
      } finally {
        setLoadingAppointments(false);
      }
    };

    fetchUpcomingAppointments();
  }, [user]);

  return (
    <PortalLayout>
      <Grid container spacing={3}>
        {/* Upcoming Appointments Section */}
        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                <CalendarMonthIcon sx={{ mr: 1 }} />
                <Typography variant="h6">Upcoming Appointments</Typography>
              </Box>
              {loadingAppointments ? (
                <Typography>Loading appointments...</Typography>
              ) : appointmentError ? (
                <Typography color="error">{appointmentError}</Typography>
              ) : upcomingAppointments.length === 0 ? (
                <Typography>No appointments scheduled for this week.</Typography>
              ) : (
                <AppointmentList 
                  appointments={upcomingAppointments} 
                  readOnly={true}
                />
              )}
              <Box mt={2}>
                <Button 
                  variant="contained" 
                  onClick={() => navigate('/client/appointments')}
                >
                  View All Appointments
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
      </Grid>
    </PortalLayout>
  );
}