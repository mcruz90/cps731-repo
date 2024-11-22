import { useState, useEffect } from 'react';
import {
  List,
  ListItem,
  ListItemText,
  Typography,
  Divider,
  Box,
  Skeleton
} from '@mui/material';
import { format } from 'date-fns';
import { appointmentService } from '@/services/api/appointment';

const UpcomingAppointments = () => {
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchAppointments();
  }, []);

  const fetchAppointments = async () => {
    try {
      const data = await appointmentService.getUpcomingAppointments();
      setAppointments(data);
    } catch (err) {
      setError('Failed to load appointments');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <Box>
        {[...Array(3)].map((_, i) => (
          <Skeleton key={i} height={60} sx={{ my: 1 }} />
        ))}
      </Box>
    );
  }

  if (error) {
    return (
      <Typography color="error">
        {error}
      </Typography>
    );
  }

  if (appointments.length === 0) {
    return (
      <Typography color="text.secondary">
        No upcoming appointments
      </Typography>
    );
  }

  return (
    <List disablePadding>
      {appointments.map((appointment, index) => (
        <Box key={appointment.id}>
          {index > 0 && <Divider />}
          <ListItem>
            <ListItemText
              primary={format(new Date(appointment.date), 'PPP')}
              secondary={
                <>
                  <Typography component="span" variant="body2">
                    {format(new Date(appointment.date), 'p')} - {appointment.service_name}
                  </Typography>
                  <br />
                  <Typography component="span" variant="body2" color="text.secondary">
                    with {appointment.practitioner_name}
                  </Typography>
                </>
              }
            />
          </ListItem>
        </Box>
      ))}
    </List>
  );
};

export default UpcomingAppointments;