// TODO: add appointment list component here
// TODO: improve styling and layout
// TODO: move cancel/edit functionality to appointment list component  ?? better modularity?? or keep it here for simplicity and less files to keep track of??


import { useState, useEffect, useCallback } from 'react';
import { 
  Typography, 
  Card, 
  CardContent,
  Button,
  Box,
  Chip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions
} from '@mui/material';
import Grid from '@mui/material/Grid2';
import { useNavigate } from 'react-router-dom';
import PortalLayout from '@/components/Layout/PortalLayout';
import { appointmentService } from '@/services/api/appointments';
import { useAuth } from '@/hooks/useAuth';

const Appointments = () => {
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedAppointment, setSelectedAppointment] = useState(null);
  const { user } = useAuth();
  const navigate = useNavigate();

  const fetchAppointments = useCallback(async () => {
    if (!user) return;
    
    try {
      const data = await appointmentService.getAll();
      setAppointments(data);
    } catch (error) {
      console.error('Error fetching appointments:', error);
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    fetchAppointments();
  }, [fetchAppointments]);

  const handleCancel = async (appointmentId) => {
    try {
      await appointmentService.cancel(appointmentId);
      fetchAppointments();
      setSelectedAppointment(null);
    } catch (error) {
      console.error('Error cancelling appointment:', error);
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'confirmed': return 'success';
      case 'pending': return 'warning';
      case 'cancelled': return 'error';
      default: return 'default';
    }
  };

  return (
    <PortalLayout>
      <Box sx={{ mb: 4, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Typography variant="h4" component="h1">
          My Appointments
        </Typography>
        <Button 
          variant="contained" 
          onClick={() => navigate('/client/appointments/book')}
        >
          Book New Appointment
        </Button>
      </Box>

      {loading ? (
        <Typography>Loading...</Typography>
      ) : (
        <Grid container spacing={3}>
          {appointments.map((appointment) => (
            <Grid item xs={12} key={appointment.id}>
              <Card>
                <CardContent>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2 }}>
                    <Box>
                      <Typography variant="h6">
                        {appointment.service_type}
                      </Typography>
                      <Typography color="text.secondary">
                        {new Date(appointment.date).toLocaleDateString()} at {appointment.time}
                      </Typography>
                      <Typography>
                        with {appointment.practitioner_name}
                      </Typography>
                    </Box>
                    <Chip 
                      label={appointment.status} 
                      color={getStatusColor(appointment.status)}
                    />
                  </Box>
                  
                  {appointment.status !== 'cancelled' && (
                    <Button 
                      variant="outlined" 
                      color="error"
                      onClick={() => setSelectedAppointment(appointment)}
                    >
                      Cancel Appointment
                    </Button>
                  )}
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>
      )}

      {/* Cancellation Dialog */}
      <Dialog
        open={!!selectedAppointment}
        onClose={() => setSelectedAppointment(null)}
      >
        <DialogTitle>Cancel Appointment</DialogTitle>
        <DialogContent>
          <Typography>
            Are you sure you want to cancel your appointment on{' '}
            {selectedAppointment && new Date(selectedAppointment.date).toLocaleDateString()}?
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setSelectedAppointment(null)}>
            No, Keep It
          </Button>
          <Button 
            onClick={() => handleCancel(selectedAppointment.id)}
            color="error"
          >
            Yes, Cancel
          </Button>
        </DialogActions>
      </Dialog>
    </PortalLayout>
  );
};

export default Appointments;