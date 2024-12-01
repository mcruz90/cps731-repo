import { useState, useEffect } from 'react';
import {
  TextField,
  Button,
  MenuItem,
  Typography,
  CircularProgress,
} from '@mui/material';
import PropTypes from 'prop-types';
import { MessagingService } from '@/services/api/messagingService';  
import { useAuth } from '@/hooks/useAuth'; 

const ComposeMessage = ({ recipients, onMessageSent, defaultRecipient }) => {
  const { user } = useAuth();

  const [receiverId, setReceiverId] = useState('');
  const [messageContent, setMessageContent] = useState('');
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);

  
  useEffect(() => {
    if (defaultRecipient) {
      setReceiverId(defaultRecipient.id);
    }
  }, [defaultRecipient]);

  const handleSend = async () => {
  
    
    if (!receiverId || !messageContent.trim()) {
      setError('Please select a recipient and enter a message.');
      return;
    }

    setLoading(true);
    setError(null);

    
    const messageData = {
      sender_id: user?.id, 
      receiver_id: receiverId,
      content: messageContent.trim(),
      appointment_id: null, 
    };

    try {
      const response = await MessagingService.sendMessage(messageData);

      if (response.success) {
       
        onMessageSent();
        
        setReceiverId('');
        setMessageContent('');
      } else {
        setError(response.error || 'Failed to send message.');
      }
    } catch (err) {
      setError(err.message || 'An unexpected error occurred.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      {/* Recipient Selection */}
      <TextField
            select
            label="Recipient"
            value={receiverId}
            onChange={(e) => setReceiverId(e.target.value)}
            fullWidth
            margin="normal"
            required
            disabled={!!defaultRecipient}
            >
            {recipients.map((recipient) => (
                <MenuItem key={recipient.id} value={recipient.id}>
                {recipient.first_name} {recipient.last_name}
                </MenuItem>
            ))}
            </TextField>

      {/* Message Content */}
      <TextField
        label="Your Message"
        value={messageContent}
        onChange={(e) => setMessageContent(e.target.value)}
        fullWidth
        multiline
        rows={4}
        margin="normal"
        required
      />

      {/* Error Message */}
      {error && (
        <Typography color="error" variant="body2" sx={{ mt: 1 }}>
          {error}
        </Typography>
      )}

      {/* Send Button */}
      <Button
        variant="contained"
        color="primary"
        onClick={handleSend}
        disabled={loading}
        fullWidth
        sx={{ mt: 2 }}
      >
        {loading ? <CircularProgress size={24} /> : 'Send Message'}
      </Button>
    </div>
  );
};

ComposeMessage.propTypes = {
  recipients: PropTypes.arrayOf(
    PropTypes.shape({
      id: PropTypes.string.isRequired,
      first_name: PropTypes.string.isRequired,
      last_name: PropTypes.string.isRequired,
    })
  ).isRequired,
  onMessageSent: PropTypes.func.isRequired,
  defaultRecipient: PropTypes.shape({
    id: PropTypes.string.isRequired,
    first_name: PropTypes.string.isRequired,
    last_name: PropTypes.string.isRequired,
  }),
};

export default ComposeMessage; 