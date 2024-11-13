// TODO: improve UX on calendar by only highlighting days with availability

import { useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import { 
  Box, 
  Paper,
  Typography,
  Button,
  CircularProgress
} from '@mui/material';
import Grid from '@mui/material/Grid2';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { LocalizationProvider, DateCalendar } from '@mui/x-date-pickers';
import { format, addDays, parseISO } from 'date-fns';
import { BookingService } from '@/services/api/booking';


export default function DateTimeSelection({ 
  onDateTimeSelect, 
  selectedDate,
  selectedTime,
  serviceId 
}) {
  const [availableTimes, setAvailableTimes] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [practitioner, setPractitioner] = useState(null);

  // Debug mount and props
  useEffect(() => {
    console.log('DateTimeSelection mounted with props:', {
      selectedDate,
      selectedTime,
      serviceId
    });
  }, [selectedDate, selectedTime, serviceId]);

  // Fetch practitioner and availability
  useEffect(() => {
    if (!serviceId) return;

    const fetchData = async () => {
      setLoading(true);
      try {
        console.log('Fetching data for serviceId:', serviceId);
        const response = await BookingService.getServiceAvailability(serviceId);
        console.log('BookingService response:', response);
        
        if (response.practitioner) {
          setPractitioner(response.practitioner);
          // some hardcoded values for testing
          setAvailableTimes(['10:00', '14:00']);
        }
      } catch (err) {
        console.error('Error:', err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [serviceId]);

  const handleDateSelect = (newDate) => {
    console.log('Date selected:', newDate);
    onDateTimeSelect(newDate, null, practitioner?.id, practitioner?.name);
  };

  const handleTimeSelect = (time) => {
    console.log('Time selected:', time);
    onDateTimeSelect(selectedDate, time, practitioner?.id, practitioner?.name);
  };

  if (loading) {
    return <CircularProgress />;
  }

  if (error) {
    return <Typography color="error">{error}</Typography>;
  }

  return (
    <LocalizationProvider dateAdapter={AdapterDateFns}>
      <Grid container spacing={4}>
        <Grid item xs={12} md={6}>
          <Paper elevation={0} sx={{ p: 2 }}>
            <DateCalendar
              value={selectedDate}
              onChange={handleDateSelect}
              minDate={new Date()}
              maxDate={addDays(new Date(), 60)}
            />
          </Paper>
        </Grid>
        
        <Grid item xs={12} md={6}>
          <Paper elevation={0} sx={{ p: 2 }}>
            {selectedDate ? (
              <>
                <Typography variant="h6" gutterBottom>
                  Available Times for {format(selectedDate, 'EEEE, MMMM d')}
                </Typography>
                <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(100px, 1fr))', gap: 1 }}>
                  {availableTimes.map((time) => (
                    <Button
                      key={time}
                      variant={selectedTime === time ? "contained" : "outlined"}
                      onClick={() => handleTimeSelect(time)}
                    >
                      {format(parseISO(`2000-01-01T${time}`), 'h:mm a')}
                    </Button>
                  ))}
                </Box>
              </>
            ) : (
              <Typography color="text.secondary">
                Please select a date to see available times
              </Typography>
            )}
          </Paper>
        </Grid>
      </Grid>
    </LocalizationProvider>
  );
}

DateTimeSelection.propTypes = {
  onDateTimeSelect: PropTypes.func.isRequired,
  selectedDate: PropTypes.instanceOf(Date),
  selectedTime: PropTypes.string,
  serviceId: PropTypes.string.isRequired
};