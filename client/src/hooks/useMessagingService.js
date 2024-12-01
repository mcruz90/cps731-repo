import { useEffect, useState, useCallback } from 'react';
import { MessagingService } from '@/services/api/messagingService';

// provides messaging service functionality
export const useMessagingService = (userId, role) => {
  const [receivedMessages, setReceivedMessages] = useState([]);
  const [sentMessages, setSentMessages] = useState([]);
  const [loadingReceived, setLoadingReceived] = useState(false);
  const [loadingSent, setLoadingSent] = useState(false);
  const [errorReceived, setErrorReceived] = useState(null);
  const [errorSent, setErrorSent] = useState(null);
  const [recipients, setRecipients] = useState([]);
  const [loadingRecipients, setLoadingRecipients] = useState(false);
  const [errorRecipients, setErrorRecipients] = useState(null);

 
   const fetchMessages = useCallback(async () => {
    if (!userId) return;

    // Fetch Received Messages
    try {
      setLoadingReceived(true);
      const received = await MessagingService.fetchReceivedMessages(userId);
        if (received.success) {
        const mappedReceived = received.messages.map((msg) => ({
          ...msg,
          senderName: `${msg.sender.first_name} ${msg.sender.last_name}`,
          receiverName: `${msg.receiver.first_name} ${msg.receiver.last_name}`,
        }));
        setReceivedMessages(mappedReceived);
        setErrorReceived(null);
      } else {
        setErrorReceived(received.error);
      }
    } catch (error) {
      setErrorReceived(error.message || 'Failed to fetch received messages.');
    } finally {
      setLoadingReceived(false);
    }

    // Fetch Sent Messages
    try {
      setLoadingSent(true);
      const sent = await MessagingService.fetchSentMessages(userId);
      if (sent.success) {
        const mappedSent = sent.messages.map((msg) => ({
          ...msg,
          senderName: `${msg.sender.first_name} ${msg.sender.last_name}`,
          receiverName: `${msg.receiver.first_name} ${msg.receiver.last_name}`,
        }));
        setSentMessages(mappedSent);
        setErrorSent(null);
      } else {
        setErrorSent(sent.error);
      }
    } catch (error) {
      setErrorSent(error.message || 'Failed to fetch sent messages.');
    } finally {
      setLoadingSent(false);
    }
  }, [userId]);

  
  // practitioner side.
  const fetchRecipients = useCallback(async () => {
    if (role !== 'practitioner' || !userId) return;

    try {
      setLoadingRecipients(true);
      const response = await MessagingService.fetchRecipients(userId);
      if (response.success) {
        setRecipients(response.recipients || []);
        setErrorRecipients(null);
      } else {
        setErrorRecipients(response.error);
      }
    } catch (error) {
      setErrorRecipients(error.message || 'Failed to fetch recipients.');
    } finally {
      setLoadingRecipients(false);
    }
  }, [userId, role]);

  useEffect(() => {
    if (userId) {
      fetchMessages();
      fetchRecipients();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [userId, role]);

  return {
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
  };
};