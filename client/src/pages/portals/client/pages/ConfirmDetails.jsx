// TODO: add notes functionality
// TODO: add currency formatting and conversion (specificy three currencies that are accepted)

import { useState } from 'react';
import PropTypes from 'prop-types';
import { 
  Box, 
  Paper,
  Typography,
  TextField,
  Button,
  Divider,
  List,
  ListItem,
  ListItemText,
  CircularProgress,
  Alert
} from '@mui/material';
import Grid from '@mui/material/Grid2';
import { format } from 'date-fns';

export default function ConfirmDetails({ 
  formData,
  onConfirm,
  loading,
  error 
}) {
  const [notes, setNotes] = useState(formData.notes || '');

  const handleSubmit = (e) => {
    e.preventDefault();
    onConfirm({ ...formData, notes });
  };

  // Helper function to format currency
  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-CA', {
      style: 'currency',
      currency: 'CAD'
    }).format(amount);
  };

  return (
    <Box component="form" onSubmit={handleSubmit}>
      <Typography variant="h6" gutterBottom>
        Confirm Booking Details
      </Typography>

      <Paper sx={{ p: 3, mb: 3 }}>
        <Grid container spacing={3}>
          {/* Service Details */}
          <Grid item xs={12}>
            <Typography variant="subtitle1" color="primary" gutterBottom>
              Service
            </Typography>
            <List dense>
              <ListItem>
                <ListItemText 
                  primary={formData.serviceName}
                  secondary={`Duration: ${formData.duration} minutes`}
                />
              </ListItem>
            </List>
          </Grid>

          <Grid item xs={12}>
            <Divider />
          </Grid>

          {/* Date and Time */}
          <Grid item xs={12} sm={6}>
            <Typography variant="subtitle1" color="primary" gutterBottom>
              Date & Time
            </Typography>
            <List dense>
              <ListItem>
                <ListItemText 
                  primary={formData.date ? format(formData.date, 'EEEE, MMMM d, yyyy') : 'Not selected'}
                  secondary={formData.time ? format(new Date(`2000-01-01T${formData.time}`), 'h:mm a') : 'Not selected'}
                />
              </ListItem>
            </List>
          </Grid>

          {/* Practitioner */}
          <Grid item xs={12} sm={6}>
            <Typography variant="subtitle1" color="primary" gutterBottom>
              Healthcare Provider
            </Typography>
            <List dense>
              <ListItem>
                <ListItemText 
                  primary={formData.practitionerName}
                />
              </ListItem>
            </List>
          </Grid>

          <Grid item xs={12}>
            <Divider />
          </Grid>

          {/* Notes */}
          <Grid item xs={12}>
            <Typography variant="subtitle1" color="primary" gutterBottom>
              Additional Notes
            </Typography>
            <TextField
              fullWidth
              multiline
              rows={4}
              placeholder="Add any special requests or notes for your appointment..."
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              variant="outlined"
            />
          </Grid>

          {error && (
            <Grid item xs={12}>
              <Alert severity="error">
                {error}
              </Alert>
            </Grid>
          )}
        </Grid>
      </Paper>

      {/* Booking Summary */}
      <Paper sx={{ p: 3, mb: 3, bgcolor: 'primary.light' }}>
        <Typography variant="subtitle1" color="primary.contrastText" gutterBottom>
          Booking Summary
        </Typography>
        <Grid container spacing={2}>
          <Grid item xs={12}>
            <Box sx={{ 
              display: 'flex', 
              justifyContent: 'space-between',
              color: 'primary.contrastText'
            }}>
              <Typography variant="body1">
                {formData.serviceName}
              </Typography>
              <Typography variant="body1">
                {formatCurrency(formData.price || 0)}
              </Typography>
            </Box>
          </Grid>
        </Grid>
      </Paper>

      {/* Submit Button */}
      <Box sx={{ display: 'flex', justifyContent: 'flex-end' }}>
        <Button
          type="submit"
          variant="contained"
          size="large"
          disabled={loading}
          sx={{ minWidth: 200 }}
        >
          {loading ? (
            <CircularProgress size={24} color="inherit" />
          ) : (
            'Confirm Booking'
          )}
        </Button>
      </Box>
    </Box>
  );
}

ConfirmDetails.propTypes = {
  formData: PropTypes.shape({
    serviceId: PropTypes.string.isRequired,
    serviceName: PropTypes.string.isRequired,
    date: PropTypes.instanceOf(Date),
    time: PropTypes.string,
    duration: PropTypes.number,
    price: PropTypes.number,
    practitionerId: PropTypes.string,
    practitionerName: PropTypes.string,
    notes: PropTypes.string
  }).isRequired,
  onConfirm: PropTypes.func.isRequired,
  loading: PropTypes.bool,
  error: PropTypes.string
};