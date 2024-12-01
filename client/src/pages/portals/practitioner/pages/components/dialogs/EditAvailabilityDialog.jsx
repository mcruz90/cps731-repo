import { useState, useEffect } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  MenuItem,
  Grid,
} from '@mui/material';
import { DatePicker } from '@mui/x-date-pickers/DatePicker'
import { TimePicker } from '@mui/x-date-pickers/TimePicker'
import PropTypes from 'prop-types';

const EditAvailabilityDialog = ({ open, onClose, onSave, slot, services }) => {
  const [date, setDate] = useState(null);
  const [startTime, setStartTime] = useState(null);
  const [endTime, setEndTime] = useState(null);
  const [serviceId, setServiceId] = useState('');

  useEffect(() => {
    if (slot) {
      setDate(new Date(slot.start));
      setStartTime(new Date(slot.start));
      setEndTime(new Date(slot.end));
      setServiceId(slot.serviceId || '');
    }
  }, [slot]);

  const handleSave = () => {
    if (date && startTime && endTime && serviceId) {
      const updatedSlot = {
        id: slot.id,
        service_id: serviceId,
        date: date.toISOString().split('T')[0],
        start_time: startTime.toISOString().split('T')[1].substr(0, 5),
        end_time: endTime.toISOString().split('T')[1].substr(0, 5),
        is_available: slot.is_available,
      };
      onSave(updatedSlot);
    }
  };

  return (
    <Dialog open={open} onClose={onClose} fullWidth>
      <DialogTitle>Edit Availability</DialogTitle>
      <DialogContent>
        <Grid container spacing={2} sx={{ mt: 1 }}>
          <Grid item xs={12}>
            <DatePicker
              label="Date"
              value={date}
              onChange={(newValue) => setDate(newValue)}
              renderInput={(params) => <TextField fullWidth {...params} />}
            />
          </Grid>
          <Grid item xs={6}>
            <TimePicker
              label="Start Time"
              value={startTime}
              onChange={(newValue) => setStartTime(newValue)}
              renderInput={(params) => <TextField fullWidth {...params} />}
            />
          </Grid>
          <Grid item xs={6}>
            <TimePicker
              label="End Time"
              value={endTime}
              onChange={(newValue) => setEndTime(newValue)}
              renderInput={(params) => <TextField fullWidth {...params} />}
            />
          </Grid>
          <Grid item xs={12}>
            <TextField
              select
              label="Service"
              value={serviceId}
              onChange={(e) => setServiceId(e.target.value)}
              fullWidth
              error={!services.find((service) => service.id === serviceId) && serviceId !== ''}
              helperText={
                !services.find((service) => service.id === serviceId) && serviceId !== ''
                  ? 'Please select a valid service'
                  : ''
              }
            >
              {services.map((service) => (
                <MenuItem key={service.id} value={service.id}>
                  {service.name}
                </MenuItem>
              ))}
            </TextField>
          </Grid>
        </Grid>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose} color="secondary">
          Cancel
        </Button>
        <Button
          onClick={handleSave}
          variant="contained"
          disabled={!date || !startTime || !endTime || !serviceId}
        >
          Save
        </Button>
      </DialogActions>
    </Dialog>
  );
};

EditAvailabilityDialog.propTypes = {
  open: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
  onSave: PropTypes.func.isRequired,
  slot: PropTypes.object.isRequired,
  services: PropTypes.array.isRequired,
};

export default EditAvailabilityDialog; 

