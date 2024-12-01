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
import { useMessagingService } from '@/hooks/useMessagingService';
import PortalLayout from '@/components/Layout/PortalLayout';
import ViewMessageDetails from './components/messaging/ViewMessageDetails';
import ComposeMessage from './components/messaging/ComposeMessage';

const PractitionerInbox = () => {
  const { user } = useAuth();
  
  const {
    receivedMessages,
    sentMessages,
    loadingReceived,
    loadingSent,
    errorReceived,
    errorSent,
    recipients,
    loadingRecipients,
    errorRecipients,
    fetchMessages,
  } = useMessagingService(user?.id, 'practitioner');

  const [selectedMessage, setSelectedMessage] = useState(null);
  const [isComposeOpen, setIsComposeOpen] = useState(false);

  useEffect(() => {
    if (user?.id) {
      fetchMessages();
    }
  }, [user, fetchMessages]);

  const handleViewMessage = (message) => {
    setSelectedMessage(message);
  };

  const handleCloseMessageDetails = () => {
    setSelectedMessage(null);
  };

  const handleOpenCompose = () => {
    setIsComposeOpen(true);
  };

  const handleCloseCompose = () => {
    setIsComposeOpen(false);
    fetchMessages();
  };

  return (
    <PortalLayout>
      <Box sx={{ padding: 4 }}>
        <Typography variant="h4" gutterBottom>
          Inbox
        </Typography>

        {/* Loading and Error States */}
        {loadingReceived || loadingSent || loadingRecipients ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
            <CircularProgress />
          </Box>
        ) : (
          <>
            {/* Error Alerts */}
            {(errorReceived || errorSent || errorRecipients) && (
              <Box sx={{ mb: 2 }}>
                {errorReceived && <Alert severity="error">{errorReceived}</Alert>}
                {errorSent && <Alert severity="error">{errorSent}</Alert>}
                {errorRecipients && <Alert severity="error">{errorRecipients}</Alert>}
              </Box>
            )}

            {/* Received Messages */}
            <Typography variant="h6">Received Messages</Typography>
            {receivedMessages.length > 0 ? (
              <List>
                {receivedMessages.map((message) => (
                  <ListItem 
                    button 
                    key={message.id} 
                    onClick={() => handleViewMessage(message)}
                    sx={{ cursor: 'pointer' }}
                  >
                    <ListItemText 
                      primary={message.content.substring(0, 50)} // Preview content
                      secondary={`From: ${message.senderName}`} 
                    />
                  </ListItem>
                ))}
              </List>
            ) : (
              <Typography>No received messages.</Typography>
            )}

            <Divider sx={{ my: 2 }} />

            {/* Sent Messages */}
            <Typography variant="h6">Sent Messages</Typography>
            {sentMessages.length > 0 ? (
              <List>
                {sentMessages.map((message) => (
                  <ListItem 
                    button 
                    key={message.id} 
                    onClick={() => handleViewMessage(message)}
                    sx={{ cursor: 'pointer' }}
                  >
                    <ListItemText 
                      primary={message.content.substring(0, 50)} // Preview content
                      secondary={`To: ${message.receiverName}`} 
                    />
                  </ListItem>
                ))}
              </List>
            ) : (
              <Typography>No sent messages.</Typography>
            )}

            {/* Compose Message Button */}
            <Button variant="contained" color="primary" onClick={handleOpenCompose} sx={{ mt: 2 }}>
              Compose Message
            </Button>

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
                  <ViewMessageDetails 
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
               <ComposeMessage recipients={recipients} onMessageSent={handleCloseCompose} />
             </DialogContent>
             <DialogActions>
               <Button onClick={handleCloseCompose} color="primary">
                 Cancel
               </Button>
             </DialogActions>
           </Dialog>
          </>
        )}
      </Box>
    </PortalLayout>
  );
};

export default PractitionerInbox;