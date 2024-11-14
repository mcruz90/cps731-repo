import { useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import { 
  Grid, 
  Card, 
  CardContent, 
  CardActionArea,
  Typography, 
  Skeleton,
  Box
} from '@mui/material';
import { supabase } from '@/services/api';

export default function ServiceSelection({ onServiceSelect, onComplete }) {
  const [services, setServices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchServices = async () => {
      try {
        const { data, error } = await supabase
          .from('services')
          .select('*')
          .eq('active', true)
          .order('name');

        if (error) throw error;
        setServices(data);
      } catch (err) {
        console.error('Error fetching services:', err);
        setError('Failed to load services. Please try again later.');
      } finally {
        setLoading(false);
      }
    };

    fetchServices();
  }, []);

  const handleServiceClick = (service) => {
    console.log('Service clicked in ServiceSelection:', service);
    onServiceSelect(service);
    onComplete();
  };

  if (loading) {
    return (
      <Grid container spacing={3}>
        {[1, 2, 3, 4].map((n) => (
          <Grid key={n} item xs={12} sm={6} md={4}>
            <Skeleton variant="rectangular" height={200} />
          </Grid>
        ))}
      </Grid>
    );
  }

  if (error) {
    return (
      <Typography color="error" align="center">
        {error}
      </Typography>
    );
  }

  return (
    <Grid container spacing={3}>
      {services.map((service) => (
        <Grid key={service.id} item xs={12} sm={6} md={4}>
          <Card 
            sx={{ 
              height: '100%',
              transition: 'transform 0.2s',
              '&:hover': {
                transform: 'translateY(-4px)'
              }
            }}
          >
            <CardActionArea 
              onClick={() => handleServiceClick(service)}
              sx={{ height: '100%' }}
            >
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  {service.name}
                </Typography>
                <Typography color="text.secondary" paragraph>
                  {service.description}
                </Typography>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <Typography variant="h6" color="primary">
                    ${service.price}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    {service.duration} minutes
                  </Typography>
                </Box>
              </CardContent>
            </CardActionArea>
          </Card>
        </Grid>
      ))}
    </Grid>
  );
}

ServiceSelection.propTypes = {
  onServiceSelect: PropTypes.func.isRequired,
  onComplete: PropTypes.func.isRequired
};