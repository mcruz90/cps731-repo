// DateTimeSelection.jsx

import { useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import {
  Box,
  Paper,
  Typography,
  Button,
  CircularProgress,
  Alert,
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
  serviceId,
}) {
  const [availableTimes, setAvailableTimes] = useState([]);
  const [availableDates, setAvailableDates] = useState([]);
  const [availabilityByDate, setAvailabilityByDate] = useState({});
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!serviceId) return;

    const fetchAvailableDates = async () => {
      try {
        setLoading(true);
        const startDate = new Date();
        const endDate = addDays(new Date(), 60);

        const response = await BookingService.getServiceAvailabilityForDateRange(
          serviceId,
          startDate,
          endDate
        );

        if (response.success) {
          const dates = response.availableDates.map((dateStr) => parseISO(dateStr));
          setAvailableDates(dates);
          setAvailabilityByDate(response.availabilityByDate);
        } else {
          setError(response.error || 'No availability data returned');
        }
      } catch (err) {
        console.error('Error fetching available dates:', err);
        setError('Failed to load available dates');
      } finally {
        setLoading(false);
      }
    };

    fetchAvailableDates();
  }, [serviceId]);

  useEffect(() => {
    if (!selectedDate) {
      setAvailableTimes([]);
      return;
    }
  
    const formattedDate = format(selectedDate, 'yyyy-MM-dd');
    const timesForDate = availabilityByDate[formattedDate] || [];
    setAvailableTimes(timesForDate);
  }, [selectedDate, availabilityByDate]);
  const handleDateSelect = (newDate) => {
    console.log('Date selected:', newDate);
    onDateTimeSelect(newDate, null, null, null);
  };

  const handleTimeSelect = (timeSlot) => {
    console.log('Time slot selected:', timeSlot);
    onDateTimeSelect(
      selectedDate,
      timeSlot.startTime,
      timeSlot.practitionerId,
      timeSlot.practitionerName
    );
  };

  // Function to disable dates without availability
  const disableUnavailableDates = (date) => {
    const formattedDate = format(date, 'yyyy-MM-dd');
    return !availableDates.some(
      (availableDate) => format(availableDate, 'yyyy-MM-dd') === formattedDate
    );
  };

  return (
    <LocalizationProvider dateAdapter={AdapterDateFns}>
      {loading && (
        <Box sx={{ display: 'flex', justifyContent: 'center', my: 4 }}>
          <CircularProgress />
        </Box>
      )}
      {error && <Alert severity="error">{error}</Alert>}
      {!loading && !error && (
        <Grid container spacing={4}>
          <Grid item xs={12} md={6}>
            <Paper elevation={0} sx={{ p: 2 }}>
              <DateCalendar
                value={selectedDate}
                onChange={handleDateSelect}
                minDate={new Date()}
                maxDate={addDays(new Date(), 60)}
                shouldDisableDate={disableUnavailableDates}
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
                  <Box
                    sx={{
                      display: 'grid',
                      gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))',
                      gap: 1,
                    }}
                  >
                    {availableTimes.length > 0 ? (
                      availableTimes.map((timeSlot) => (
                        <Button
                          key={`${timeSlot.practitionerId}-${timeSlot.startTime}-${timeSlot.slotId}`}
                          variant={
                            selectedTime === timeSlot.startTime
                              ? 'contained'
                              : 'outlined'
                          }
                          onClick={() => handleTimeSelect(timeSlot)}
                          sx={{
                            justifyContent: 'flex-start',
                            textAlign: 'left',
                            p: 1.5,
                            height: 'auto',
                            whiteSpace: 'normal',
                          }}
                        >
                          <Box>
                            <Typography variant="button" display="block">
                              {format(
                                new Date(`2000-01-01T${timeSlot.startTime}`),
                                'h:mm a'
                              )}
                            </Typography>
                            {timeSlot.practitionerName && (
                              <Typography
                                variant="caption"
                                display="block"
                                color="text.secondary"
                                sx={{ mt: 0.5 }}
                              >
                                with {timeSlot.practitionerName}
                              </Typography>
                            )}
                          </Box>
                        </Button>
                      ))
                    ) : (
                      <Typography color="text.secondary">
                        No available times for this date
                      </Typography>
                    )}
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
      )}
    </LocalizationProvider>
  );
}

DateTimeSelection.propTypes = {
  onDateTimeSelect: PropTypes.func.isRequired,
  selectedDate: PropTypes.instanceOf(Date),
  selectedTime: PropTypes.string,
  serviceId: PropTypes.string.isRequired,
};
