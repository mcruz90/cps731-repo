import { useEffect, useState } from "react";
import { Box, Typography, TextField, Button, Select, MenuItem, Snackbar, Alert, FormControl, InputLabel, CircularProgress, Paper } from "@mui/material";
import { useAuth } from "@/hooks/useAuth";
import PropTypes from 'prop-types';
import { useMessaging } from '@/hooks/useMessaging';

const ComposeMessage = ({ onMessageSent }) => {
  const [recipient, setRecipient] = useState("");
  const [selectedAppointment, setSelectedAppointment] = useState("");
  const [messageContent, setMessageContent] = useState("");

  const { user } = useAuth();

  const {
    practitioners,
    appointments,
    loadingPractitioners,
    loadingAppointments,
    error,
    success,
    fetchPractitioners,
    fetchAppointments,
    sendMessage,
    setError,
    setSuccess,
  } = useMessaging(user?.id);

  useEffect(() => {
    if (user?.id) {
      fetchPractitioners();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user]);

  // Handle change in recipient
  const handleRecipientChange = (practitionerId) => {
    setRecipient(practitionerId);
    setSelectedAppointment("");
    if (practitionerId) {
      fetchAppointments(practitionerId);
    }
  };

  // Handle submit of form data
  const handleSubmit = async () => {
    if (!recipient || !messageContent.trim()) {
      setError("Please fill in all required fields.");
      return;
    }

    await sendMessage({
      sender_id: user.id,
      receiver_id: recipient,
      content: messageContent,
      appointment_id: selectedAppointment || null,
    });

    if (onMessageSent && !error) {
      onMessageSent();
    }
  };

  // loading spinner for practitioners or appointments
  if (loadingPractitioners || loadingAppointments) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100%' }}>
        <CircularProgress />
      </Box>
    );
  }


  // compose message form
  return (
    <Paper elevation={3} sx={{ maxWidth: 600, mx: "auto", p: 3 }}>
      <Typography variant="h4" gutterBottom>Compose Message</Typography>
      {/* Select Practitioner */}
      <Box sx={{ mb: 2 }}>
        <FormControl fullWidth>
          <InputLabel>To</InputLabel>
          <Select
            value={recipient}
            onChange={(e) => handleRecipientChange(e.target.value)}
            fullWidth
          >
            <MenuItem value="">Select Practitioner</MenuItem>
            {practitioners.map((practitioner) => (
              <MenuItem key={practitioner.id} value={practitioner.id}>
                {practitioner.name}
              </MenuItem>
            ))}
          </Select>
        </FormControl>
      </Box>
      {/* Select Appointment */}
      {recipient && (
        <Box sx={{ mb: 2 }}>
          <FormControl fullWidth>
            <InputLabel>Associate Appointment (Optional)</InputLabel>
            <Select
              value={selectedAppointment}
              onChange={(e) => setSelectedAppointment(e.target.value)}
              fullWidth
            >
              <MenuItem value="">None</MenuItem>
              {appointments.map((appointment) => (
                <MenuItem key={appointment.id} value={appointment.id}>
                  {`Date: ${appointment.date}, Time: ${appointment.time}, Status: ${appointment.status}`}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        </Box>
      )}
      {/* Message Content */}
      <Box sx={{ mb: 2 }}>
        <TextField
          value={messageContent}
          onChange={(e) => setMessageContent(e.target.value)}
          fullWidth
          multiline
          rows={4}
          placeholder="Write your message..."
        />
      </Box>
      {/* Submit Button */}
      <Button
        variant="contained"
        color="primary"
        onClick={handleSubmit}
        disabled={loadingPractitioners || loadingAppointments}
        fullWidth
      >
        {loadingPractitioners || loadingAppointments ? "Sending..." : "Send"}
      </Button>
      {/* Snackbar Notifications */}
      <Snackbar open={!!error} autoHideDuration={6000} onClose={() => setError("")}>
        <Alert onClose={() => setError("")} severity="error" sx={{ width: "100%" }}>{error}</Alert>
      </Snackbar>
      <Snackbar open={!!success} autoHideDuration={6000} onClose={() => setSuccess("")}>
        <Alert onClose={() => setSuccess("")} severity="success" sx={{ width: "100%" }}>{success}</Alert>
      </Snackbar>
    </Paper>
  );
};

ComposeMessage.propTypes = {
  onMessageSent: PropTypes.func,
};

export default ComposeMessage;

