import { useEffect, useState } from 'react';
import {
  Typography,
  List,
  ListItem,
  ListItemText,
  CircularProgress,
  Alert,
  Box,
  Button,
  Divider,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
} from '@mui/material';
import { useAuth } from '@/hooks/useAuth';
import { useMessaging } from '@/hooks/useMessaging';
import PortalLayout from '@/components/Layout/PortalLayout';
import MessageDetails from './components/messaging/MessageDetails';
import ComposeMessage from './components/messaging/ComposeMessage';

const Inbox = () => {
  const { user } = useAuth();
  
  const {
    receivedMessages,
    sentMessages,
    loadingReceived,
    loadingSent,
    errorReceived,
    errorSent,
    fetchMessages,
  } = useMessaging(user?.id);

  const [selectedMessage, setSelectedMessage] = useState(null);
  const [isComposeOpen, setIsComposeOpen] = useState(false);

  useEffect(() => {
    if (user?.id) {
      fetchMessages();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user]);

  const handleOpenCompose = () => {
    setIsComposeOpen(true);
  };

  const handleCloseCompose = () => {
    setIsComposeOpen(false);
  };

  const handleViewMessage = (message) => {
    setSelectedMessage(message);
  };

  const handleCloseMessageDetails = () => {
    setSelectedMessage(null);
  };

  return (
    <PortalLayout>
      <Typography variant="h4" component="h1" gutterBottom>
        Inbox
      </Typography>
      <Box display="flex" justifyContent="flex-end" mb={2}>
        <Button variant="contained" color="primary" onClick={handleOpenCompose}>
          Compose Message
        </Button>
      </Box>
      {(loadingReceived || loadingSent) ? (
        <CircularProgress />
      ) : (errorReceived || errorSent) ? (
        <Alert severity="error">{errorReceived || errorSent}</Alert>
      ) : (
        <List>
          <Typography variant="h6">Received Messages</Typography>
          {receivedMessages.map((message) => (
            <ListItem 
              button 
              key={message.id} 
              onClick={() => handleViewMessage(message)}
              sx={{ cursor: 'pointer' }}
            >
              <ListItemText 
                primary={message.content} 
                secondary={`From: ${message.senderName}`} 
              />
            </ListItem>
          ))}
          <Divider />
          <Typography variant="h6">Sent Messages</Typography>
          {sentMessages.map((message) => (
            <ListItem button key={message.id} onClick={() => handleViewMessage(message)}>
              <ListItemText primary={message.content} secondary={`To: ${message.receiverName}`} />
            </ListItem>
          ))}
        </List>
      )}

      {/* Message Details Dialog */}
      <Dialog
        open={Boolean(selectedMessage)}
        onClose={handleCloseMessageDetails}
        fullWidth
        maxWidth="md"
      >
        <DialogTitle>Message Details</DialogTitle>
        <DialogContent>
          {selectedMessage && (
            <MessageDetails 
              message={selectedMessage} 
              onClose={handleCloseMessageDetails} 
            />
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseMessageDetails} color="primary">
            Close
          </Button>
        </DialogActions>
      </Dialog>

      {/* Compose Message Dialog */}
      <Dialog open={isComposeOpen} onClose={handleCloseCompose} fullWidth maxWidth="sm">
        <DialogTitle>Compose Message</DialogTitle>
        <DialogContent>
          <ComposeMessage onMessageSent={handleCloseCompose} />
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseCompose} color="primary">
            Cancel
          </Button>
        </DialogActions>
      </Dialog>
    </PortalLayout>
  );
};

export default Inbox;