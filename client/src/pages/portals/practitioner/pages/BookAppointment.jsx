import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/services/api';
import { useAuth } from '@/hooks/useAuth';
import { TextField, Button, Box, Typography } from '@mui/material';

const BookAppointment = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    clientId: '',
    date: '',
    time: '',
    duration: '',
    notes: '',
    serviceId: '',
    availabilityId: ''
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prevData => ({ ...prevData, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const { data, error } = await supabase
        .from('appointments')
        .insert([{
          ...formData,
          practitioner_id: user.id,
          status: 'pending',
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        }]);

      if (error) throw error;
      navigate('/practitioner/schedule');
    } catch (error) {
      setError('Failed to book appointment');
      console.error('Error booking appointment:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box component="form" onSubmit={handleSubmit} sx={{ mt: 3 }}>
      <Typography variant="h4" component="h1" gutterBottom>
        Book Appointment
      </Typography>
      {error && <Typography color="error">{error}</Typography>}
      <TextField
        label="Client ID"
        name="clientId"
        value={formData.clientId}
        onChange={handleChange}
        fullWidth
        margin="normal"
      />
      <TextField
        label="Date"
        name="date"
        type="date"
        value={formData.date}
        onChange={handleChange}
        fullWidth
        margin="normal"
        InputLabelProps={{ shrink: true }}
      />
      <TextField
        label="Time"
        name="time"
        type="time"
        value={formData.time}
        onChange={handleChange}
        fullWidth
        margin="normal"
        InputLabelProps={{ shrink: true }}
      />
      <TextField
        label="Duration"
        name="duration"
        value={formData.duration}
        onChange={handleChange}
        fullWidth
        margin="normal"
      />
      <TextField
        label="Notes"
        name="notes"
        value={formData.notes}
        onChange={handleChange}
        fullWidth
        margin="normal"
      />
      <TextField
        label="Service ID"
        name="serviceId"
        value={formData.serviceId}
        onChange={handleChange}
        fullWidth
        margin="normal"
      />
      <TextField
        label="Availability ID"
        name="availabilityId"
        value={formData.availabilityId}
        onChange={handleChange}
        fullWidth
        margin="normal"
      />
      <Button
        type="submit"
        variant="contained"
        color="primary"
        disabled={loading}
        sx={{ mt: 2 }}
      >
        {loading ? 'Booking...' : 'Book Appointment'}
      </Button>
    </Box>
  );
};

export default BookAppointment;