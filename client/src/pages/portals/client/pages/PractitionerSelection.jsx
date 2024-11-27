// todo: need to get practitioner role and description from backend
import { useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import { 
  Box, 
  Typography,
  Grid,
  Card,
  CardContent,
  CardActionArea,
  Avatar,
  CircularProgress,
  Chip,
  Divider
} from '@mui/material';
import { BookingService } from '@/services/api/booking';

export default function PractitionerSelection({ 
  serviceId, 
  selectedPractitionerId,
  selectedDate,
  selectedTime,
  onPractitionerSelect 
}) {
  const [practitioners, setPractitioners] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchPractitioners = async () => {
      if (!serviceId || !selectedDate || !selectedTime) return;
      
      setLoading(true);
      try {
        // fetches the practitioners from the database
        const { practitioners } = await BookingService.getServicePractitioners(serviceId);
        
        // filters the practitioners based on availability
        const availablePractitioners = [];
        for (const practitioner of practitioners) {
          const availability = await BookingService.getServiceAvailability(
            serviceId,
            selectedDate,
            practitioner.id
          );
          
          if (availability.success && 
              availability.availableTimes.some(slot => slot.startTime === selectedTime)) {
            availablePractitioners.push(practitioner);
          }
        }
        
        //console.log('Available practitioners:', availablePractitioners);
        setPractitioners(availablePractitioners);
      } catch (err) {
        console.error('Error fetching practitioners:', err);
        setError('Failed to load practitioners');
      } finally {
        setLoading(false);
      }
    };

    fetchPractitioners();
  }, [serviceId, selectedDate, selectedTime]);

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', p: 3 }}>
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return (
      <Typography color="error" sx={{ p: 2 }}>
        {error}
      </Typography>
    );
  }

  if (practitioners.length === 0) {
    return (
      <Typography color="text.secondary" sx={{ p: 2 }}>
        No practitioners available for this service.
      </Typography>
    );
  }

  return (
    <Box>
      <Typography variant="h6" gutterBottom>
        Select a provider
      </Typography>
      <Typography color="text.secondary" paragraph>
        {selectedDate ? (
          `Available providers for ${selectedDate.toLocaleDateString()}`
        ) : (
          'Please select a date to see available providers'
        )}
      </Typography>
      
      <Grid container spacing={3}>
        {practitioners.map((practitioner) => (
          <Grid item xs={12} sm={6} key={practitioner.id}>
            <Card 
              variant="outlined"
              sx={{
                border: selectedPractitionerId === practitioner.id ? 
                  '2px solid' : '1px solid',
                borderColor: selectedPractitionerId === practitioner.id ? 
                  'primary.main' : 'divider',
                transition: 'all 0.2s ease-in-out',
                '&:hover': {
                  borderColor: 'primary.main',
                  boxShadow: 1
                }
              }}
            >
              <CardActionArea onClick={() => onPractitionerSelect(practitioner)}>
                <CardContent>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2 }}>
                    <Avatar 
                      sx={{ 
                        width: 64, 
                        height: 64,
                        bgcolor: selectedPractitionerId === practitioner.id ? 
                          'primary.main' : 'grey.400'
                      }}
                    >
                      {practitioner.name.charAt(0)}
                    </Avatar>
                    <Box>
                      <Typography variant="h6" gutterBottom>
                        {practitioner.name}
                      </Typography>
                      <Chip 
                        label={practitioner.role || 'Healthcare Provider'} 
                        size="small"
                        color={selectedPractitionerId === practitioner.id ? 'primary' : 'default'}
                      />
                    </Box>
                  </Box>
                  
                  <Divider sx={{ my: 1 }} />
                  
                  <Typography variant="body2" color="text.secondary">
                    Specializes in nutrition counseling and dietary planning
                  </Typography>
                </CardContent>
              </CardActionArea>
            </Card>
          </Grid>
        ))}
      </Grid>
    </Box>
  );
}

PractitionerSelection.propTypes = {
  serviceId: PropTypes.string.isRequired,
  selectedPractitionerId: PropTypes.string,
  selectedDate: PropTypes.instanceOf(Date),
  selectedTime: PropTypes.string,
  onPractitionerSelect: PropTypes.func.isRequired
};