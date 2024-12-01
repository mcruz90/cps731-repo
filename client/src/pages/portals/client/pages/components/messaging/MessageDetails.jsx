import { useParams, useNavigate } from 'react-router-dom';
import { useEffect } from 'react';
import { Box, Typography, CircularProgress, Paper, Button, Divider } from '@mui/material';
import Grid from '@mui/material/Grid2';
import { useMessaging } from '@/hooks/useMessaging';

const MessageDetails = () => {
  const { messageId } = useParams();
  const navigate = useNavigate();
  
  const {
    messageDetails: message,
    loadingDetails,
    error,
    fetchMessageDetails,
  } = useMessaging();

  useEffect(() => {
    if (messageId) {
      fetchMessageDetails(messageId);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [messageId]);

  // Display a loading indicator while fetching the message details
  if (loadingDetails) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100%' }}>
        <CircularProgress />
      </Box>
    );
  }

  // Display an error message if the message is not found
  if (error) {
    return <Typography variant="h6" color="error" textAlign="center">{error}</Typography>;
  }

  if (!message) {
    return <Typography variant="h6" color="error" textAlign="center">Message not found</Typography>;
  }

  return (
    <Paper elevation={3} sx={{ p: 3, borderRadius: 2, maxWidth: '800px', mx: 'auto' }}>
      {/* Back button to navigate back to the previous page */}
      <Button variant="outlined" onClick={() => navigate(-1)} sx={{ mb: 2 }}>
        Back
      </Button>

      {/* Display the message details */}
      <Typography variant="h4" gutterBottom>Message Details</Typography>
      <Grid container spacing={2} flexDirection={{ xs: 'column', md: 'row' }}>
        <Grid item xs={12} md={6} flexDirection="row">
          <Box sx={{ p: 2, mb: 2, border: '1px solid #ccc', borderRadius: 2, backgroundColor: '#f9f9f9' }}>
            
            {/* sender and receiver details */}
            <Grid container spacing={2} flexDirection="column" width="100%">
              <Grid item xs={12} md={6}>
                <Typography variant="body1" fontWeight="bold">From:</Typography>
                <Typography variant="body2" sx={{ mb: 1 }}>{message.senderName}</Typography>
              </Grid>
              <Grid item xs={12} md={6}>
                <Typography variant="body1" fontWeight="bold">To:</Typography>
                <Typography variant="body2" sx={{ mb: 1 }}>{message.receiverName}</Typography>
              </Grid>
            </Grid>
            <Divider sx={{ mb: 1 }} />

            {/* message sent on */}
            <Typography variant="body1" fontWeight="bold">Message sent on:</Typography>
            <Typography variant="body2">{new Date(message.createdAt).toLocaleString()}</Typography>
          </Box>
          <Box sx={{ p: 2, border: '1px solid #ccc', borderRadius: 2, backgroundColor: '#e3f2fd', minHeight: '200px', overflowY: 'auto' }}>
            <Typography variant="h6" fontWeight="bold">Message content:</Typography>
            <Typography variant="body1" sx={{ mb: 1 }}>{message.content}</Typography>
          </Box>
        </Grid>

        {/* Display the related appointment details if available */}
        {message.appointmentDetails && (
          <Grid item xs={12}>
            <Box sx={{ p: 2, border: '1px solid #ccc', borderRadius: 2 }}>
              <Typography variant="h6" fontWeight="bold">Related Appointment:</Typography>
              <Typography variant="body1">Appointment ID: {message.appointmentDetails.id}</Typography>
              <Typography variant="body1">Date: {message.appointmentDetails.date}</Typography>
              <Typography variant="body1">Time: {message.appointmentDetails.time}</Typography>
              <Typography variant="body1">Status: {message.appointmentDetails.status}</Typography>
              <Typography variant="body1">Practitioner: {`${message.appointmentDetails.profiles.first_name} ${message.appointmentDetails.profiles.last_name}`}</Typography>
            </Box>
          </Grid>
        )}
      </Grid>
    </Paper>
  );
};

export default MessageDetails;
