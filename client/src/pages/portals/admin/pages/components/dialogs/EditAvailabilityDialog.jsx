import { useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import { 
  Dialog, 
  DialogTitle, 
  DialogContent, 
  DialogActions, 
  Button, 
  TextField, 
  Select, 
  MenuItem,
  FormControl,
  InputLabel,
  Alert
} from '@mui/material';

// edit availability dialog for admin portal
const EditAvailabilityDialog = ({ open, availability, onClose, onSave, services, practitioners }) => {
  const [formData, setFormData] = useState({
    practitioner_id: '',
    service_id: '',
    date: '',
    start_time: '',
    end_time: '',
    is_available: true
  });

  // set form data based on availability data
  useEffect(() => {
    if (availability) {
      setFormData({
        practitioner_id: availability.practitioner_id || '',
        service_id: availability.service_id || '',
        date: availability.date || '',
        start_time: availability.start_time || '',
        end_time: availability.end_time || '',
        is_available: availability.is_available !== undefined ? availability.is_available : true
      });
    } else {
      setFormData({
        practitioner_id: '',
        service_id: '',
        date: '',
        start_time: '',
        end_time: '',
        is_available: true
      });
    }
  }, [availability]);

  // handle change in form data
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  // handle change in availability status
  const handleStatusChange = (e) => {
    const { value } = e.target;
    setFormData(prev => ({
      ...prev,
      is_available: value === 'available'
    }));
  };

  // handle submit of form data
  const handleSubmit = () => {
    if (!availability) {
      console.error('No availability data to save.');
      <Alert severity="error">No availability data to save.</Alert>
      return;
    }

    // Validate that all required fields are filled
    const { practitioner_id, service_id, date, start_time, end_time } = formData;
    if (!practitioner_id || !service_id || !date || !start_time || !end_time) {
      console.error('Missing required fields in availability data.');
      <Alert severity="error">Missing required fields in availability data.</Alert>
      return;
    }

    onSave({
      ...availability,
      ...formData
    });
  };

  return (

    <Dialog open={open} onClose={onClose} fullWidth maxWidth="sm">
      <DialogTitle>Edit Availability</DialogTitle>
      <DialogContent>
        {/* practitioner selection */}
        <FormControl fullWidth sx={{ mt: 2 }}>
          <InputLabel>Practitioner</InputLabel>
          <Select
            name="practitioner_id"
            value={formData.practitioner_id}
            onChange={handleChange}
            label="Practitioner"
            required
          >
            {practitioners.length > 0 ? (
              practitioners.map((practitioner) => (
                <MenuItem 
                  key={practitioner.id} 
                  value={practitioner.id}
                >
                  {`${practitioner.first_name} ${practitioner.last_name}`}
                </MenuItem>
              ))
            ) : (
              <MenuItem value="" disabled>
                No Practitioners Available
              </MenuItem>
            )}
          </Select>
        </FormControl>

        {/* service selection */}
        <FormControl fullWidth sx={{ mt: 2 }}>
          <InputLabel>Service</InputLabel>
          <Select
            name="service_id"
            value={formData.service_id}
            onChange={handleChange}
            label="Service"
            required
          >
            {services.length > 0 ? (
              services.map((service) => (
                <MenuItem key={service.id} value={service.id}>
                  {service.name}
                </MenuItem>
              ))
            ) : (
              <MenuItem value="" disabled>
                No Services Available
              </MenuItem>
            )}
          </Select>
        </FormControl>

        {/* date selection */}
        <TextField
          margin="dense"
          label="Date"
          type="date"
          name="date"
          value={formData.date}
          onChange={handleChange}
          fullWidth
          required
          InputLabelProps={{
            shrink: true,
          }}
          sx={{ mt: 2 }}
        />

        {/* start time selection */}
        <TextField
          margin="dense"
          label="Start Time"
          type="time"
          name="start_time"
          value={formData.start_time}
          onChange={handleChange}
          fullWidth
          required
          InputLabelProps={{
            shrink: true,
          }}
          inputProps={{
            step: 300, // 5 min
          }}
          sx={{ mt: 2 }}
        />

        {/* end time selection */}
        <TextField
          margin="dense"
          label="End Time"
          type="time"
          name="end_time"
          value={formData.end_time}
          onChange={handleChange}
          fullWidth
          required
          InputLabelProps={{
            shrink: true,
          }}
          inputProps={{
            step: 300, // 5 min
          }}
          sx={{ mt: 2 }}
        />

        {/* status selection */}
        <FormControl fullWidth sx={{ mt: 2 }}>
          <InputLabel>Status</InputLabel>
          <Select
            name="is_available"
            value={formData.is_available ? 'available' : 'booked'}
            onChange={handleStatusChange}
            label="Status"
          >
            <MenuItem value="available">Available</MenuItem>
            <MenuItem value="booked">Booked</MenuItem>
          </Select>
        </FormControl>
      </DialogContent>

      {/* dialog actions */}
      <DialogActions>
        <Button onClick={onClose} color="secondary">Cancel</Button>
        <Button onClick={handleSubmit} variant="contained" color="primary">Save</Button>
      </DialogActions>
    </Dialog>
  );
};

EditAvailabilityDialog.propTypes = {
  open: PropTypes.bool.isRequired,
  availability: PropTypes.object,
  onClose: PropTypes.func.isRequired,
  onSave: PropTypes.func.isRequired,
  services: PropTypes.array.isRequired,
  practitioners: PropTypes.array.isRequired
};

export default EditAvailabilityDialog;
