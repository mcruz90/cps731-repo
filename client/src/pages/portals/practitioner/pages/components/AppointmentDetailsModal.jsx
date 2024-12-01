import PropTypes from 'prop-types';
import Modal from '@mui/material/Modal';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import Button from '@mui/material/Button';
import Divider from '@mui/material/Divider';

const AppointmentDetailsModal = ({ open, onClose, appointment, onEdit, onDelete }) => {
  const getTotalCount = () => {
    return appointment.clientCount || 0;
  };

  

  return (
    <Modal open={open} onClose={onClose}>
      <Box
        sx={{
          position: 'absolute',
          top: '50%',
          left: '50%',
          transform: 'translate(-50%, -50%)',
          width: 400,
          bgcolor: 'background.paper',
          boxShadow: 24,
          p: 4,
          borderRadius: 2,
        }}
      >
        <Typography variant="h6" component="h2">
          Appointment Details
        </Typography>
        <Divider sx={{ my: 2 }} />
        <Typography variant="body1">
          <strong>Service:</strong> {appointment.serviceName}
        </Typography>
        <Typography variant="body1">
          <strong>Start Time:</strong> {appointment.time}
        </Typography>
        <Typography variant="body1">
          <strong>Duration:</strong> {appointment.duration} minutes
        </Typography>
        <Typography sx={{ mt: 1 }}>
          <strong>Total Confirmed Appointments for This Service and Slot:</strong> {getTotalCount()}
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

AppointmentDetailsModal.propTypes = {
  open: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
  appointment: PropTypes.shape({
    id: PropTypes.string.isRequired,
    serviceName: PropTypes.string,
    time: PropTypes.string,
    clientName: PropTypes.string,
    clientEmail: PropTypes.string,
    service_id: PropTypes.string.isRequired,
    availability_id: PropTypes.string.isRequired,
    clientCount: PropTypes.number,
    duration: PropTypes.number,
  }).isRequired,
  onEdit: PropTypes.func.isRequired,
  onDelete: PropTypes.func.isRequired,
};

export default AppointmentDetailsModal;