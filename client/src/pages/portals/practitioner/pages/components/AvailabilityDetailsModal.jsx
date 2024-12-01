import PropTypes from 'prop-types';
import Modal from '@mui/material/Modal';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import Button from '@mui/material/Button';
import Divider from '@mui/material/Divider';

const AvailabilityDetailsModal = ({ open, onClose, availability, onEdit, onDelete }) => {
  if (!availability) return null;

  const style = {
    position: 'absolute',
    top: '50%',
    left: '50%',
    transform: 'translate(-50%, -50%)',
    width: 400,
    bgcolor: 'background.paper',
    borderRadius: 2,
    boxShadow: 24,
    p: 4,
  };

  const formatTime = (time) => {
    if (!time) return 'N/A';
    const [hour, minute] = time.split(':');
    const date = new Date();
    date.setHours(hour, minute);
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  return (
    <Modal open={open} onClose={onClose}>
      <Box sx={style}>
        <Typography variant="h6" component="h2" gutterBottom>
          Availability Details
        </Typography>
        <Divider />
        <Typography sx={{ mt: 2 }}>
          <strong>Service Name:</strong> {availability.name || 'N/A'}
        </Typography>
        <Typography sx={{ mt: 1 }}>
          <strong>Date:</strong> {availability.date || 'N/A'}
        </Typography>
        <Typography sx={{ mt: 1 }}>
          <strong>Start Time:</strong> {formatTime(availability.start_time)}
        </Typography>
        <Typography sx={{ mt: 1 }}>
          <strong>Duration:</strong> {availability.duration !== undefined ? `${availability.duration} minutes` : 'N/A'}
        </Typography>
        <Box mt={3} display="flex" justifyContent="flex-end">
          <Button variant="outlined" color="primary" onClick={onEdit} sx={{ mr: 2 }}>
            Edit
          </Button>
          <Button variant="contained" color="secondary" onClick={onDelete}>
            Delete
          </Button>
        </Box>
      </Box>
    </Modal>
  );
};

AvailabilityDetailsModal.propTypes = {
  open: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
  availability: PropTypes.shape({
    id: PropTypes.string.isRequired,
    name: PropTypes.string,
    date: PropTypes.string.isRequired,
    start_time: PropTypes.string.isRequired,
    duration: PropTypes.number,
    service_id: PropTypes.string,
  }).isRequired,
  onEdit: PropTypes.func.isRequired,
  onDelete: PropTypes.func.isRequired,
};

export default AvailabilityDetailsModal; 