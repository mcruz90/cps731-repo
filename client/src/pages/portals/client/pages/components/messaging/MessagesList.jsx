import { Typography, CircularProgress, Box, Button } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import { useMessaging } from '@/hooks/useMessaging';
import PropTypes from 'prop-types';
const MessagesList = ({ userId }) => {
  const { unreadMessagesCount, loadingMessages, error } = useMessaging(userId);
  const navigate = useNavigate();

  if (loadingMessages) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return (
      <Typography variant="h6" color="error" textAlign="center">
        {error}
      </Typography>
    );
  }

  return (
    <Box>
      <Typography variant="h6">Messages</Typography>
      {unreadMessagesCount > 0 ? (
        <Typography>You have {unreadMessagesCount} unread messages.</Typography>
      ) : (
        <Typography>You have no unread messages.</Typography>
      )}
      <Button
        variant="contained"
        sx={{ mt: 2 }}
        onClick={() => navigate('/client/inbox')}
      >
        Go to Inbox
      </Button>
    </Box>
  );
};

export default MessagesList;

MessagesList.propTypes = {
  userId: PropTypes.string.isRequired,
};

