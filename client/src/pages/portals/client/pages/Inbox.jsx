import { useState } from "react";
import { Box, Typography, CircularProgress, Badge, Tabs, Tab, Paper, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, List, ListItem, ListItemText } from "@mui/material";

import { useAuth } from "@/hooks/useAuth";
import { useNavigate } from 'react-router-dom';
import ComposeMessage from './components/messaging/ComposeMessage';
import PortalLayout from "@/components/Layout/PortalLayout";
import { useMessaging } from '@/hooks/useMessaging';

const Inbox = () => {
  const [tabIndex, setTabIndex] = useState(0); 
  const { user } = useAuth();
  const navigate = useNavigate();

  const {
    allMessages: receivedMessages,
    sentMessages,
    loadingMessages,
    error,
    unreadMessagesCount,
  } = useMessaging(user?.id);

  const handleTabChange = (event, newValue) => {
    setTabIndex(newValue);
  };

  const renderMessages = (messages) => {
    if (!messages.length) {
      return (
        <Typography variant="h6" textAlign="center" sx={{ mt: 2 }}>
          No messages found.
        </Typography>
      );
    }

    return (
      <List>
        {messages.map((message) => (
          <ListItem
            key={message.id}
            button
            onClick={() => navigate(`/client/inbox/${message.id}`)}
            sx={{
              backgroundColor: message.isRead ? "inherit" : "rgba(0, 123, 255, 0.1)",
              mb: 1,
              borderRadius: 1,
            }}
          >
            <ListItemText
              primary={`From: ${message.senderName}`}
              secondary={
                message.content.length > 50 ? `${message.content.slice(0, 50)}...` : message.content
              }
            />
            <Typography variant="body2" color="textSecondary">
              {new Date(message.createdAt).toLocaleDateString()}
            </Typography>
            {!message.isRead && (
              <Badge variant="dot" color="primary" sx={{ ml: 2 }} />
            )}
          </ListItem>
        ))}
      </List>
    );
  };

  const renderSentMessages = (messages) => {
    if (!messages.length) {
      return (
        <Typography variant="h6" textAlign="center">
          No sent messages found.
        </Typography>
      );
    }

    return (
      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>To</TableCell>
              <TableCell>Content</TableCell>
              <TableCell align="right">Date</TableCell>
              <TableCell align="right">Status</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {messages.map((message) => (
              <TableRow key={message.id} onClick={() => navigate(`/client/inbox/${message.id}`)} sx={{ cursor: 'pointer' }}>
                <TableCell>{message.receiverName}</TableCell>
                <TableCell>{message.content.length > 50 ? `${message.content.slice(0, 50)}...` : message.content}</TableCell>
                <TableCell align="right">{new Date(message.createdAt).toLocaleDateString()}</TableCell>
                <TableCell align="right">{message.isRead ? 'Read' : 'Unread'}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
    );
  };

  if (loadingMessages) {
    return (
      <Box sx={{ display: "flex", justifyContent: "center", alignItems: "center", height: "100%" }}>
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
    <PortalLayout>
      <Paper elevation={3} sx={{ p: 3 }}>
        <Typography variant="h4" gutterBottom>
          Inbox
        </Typography>

        {/* Tabs for Inbox, Sent, and Compose Message */}
        <Tabs value={tabIndex} onChange={handleTabChange} centered>
          <Tab label={<Badge badgeContent={unreadMessagesCount} color="primary">Inbox</Badge>} />
          <Tab label="Sent" />
          <Tab label="Compose" />
        </Tabs>

        {/* Render based on selected tab */}
        {tabIndex === 0 && renderMessages(receivedMessages)}
        {tabIndex === 1 && renderSentMessages(sentMessages)}
        {tabIndex === 2 && <ComposeMessage onMessageSent={() => setTabIndex(0)} />}
      </Paper>
    </PortalLayout>
  );
};

export default Inbox;