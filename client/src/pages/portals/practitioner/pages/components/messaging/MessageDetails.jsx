import {
  Typography,
  Box,
  Paper,
  Divider,
  Button,
} from '@mui/material';
import PropTypes from 'prop-types';

const MessageDetails = ({ message, onClose }) => {
  if (!message) return null;

  return (
    <Paper elevation={3} sx={{ padding: 3 }}>
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
        <Typography variant="h6">Message Details</Typography>
        <Button variant="contained" color="secondary" onClick={onClose}>
          Close
        </Button>
      </Box>
      <Divider />
      <Box mt={2}>
        <Typography variant="subtitle1" gutterBottom>
          From: {message.senderName}
        </Typography>
        <Typography variant="subtitle1" gutterBottom>
          To: {message.receiverName}
        </Typography>
        {message.appointmentId && (
          <Typography variant="subtitle1" gutterBottom>
            Appointment ID: {message.appointmentId}
          </Typography>
        )}
        <Typography variant="body1" mt={2}>
          {message.content}
        </Typography>
      </Box>
    </Paper>
  );
};

MessageDetails.propTypes = {
  message: PropTypes.shape({
    id: PropTypes.string.isRequired,
    senderName: PropTypes.string.isRequired,
    receiverName: PropTypes.string.isRequired,
    content: PropTypes.string.isRequired,
    appointmentId: PropTypes.string,
  }),
  onClose: PropTypes.func.isRequired,
};

export default MessageDetails;