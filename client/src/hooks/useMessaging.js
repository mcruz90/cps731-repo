import { useEffect, useState, useCallback } from 'react';
import { MessagingService } from '@/services/api/messages';
import { BookingService } from '@/services/api/booking';

export const useMessaging = (userId) => {
  const [unreadMessages, setUnreadMessages] = useState([]);
  const [receivedMessages, setReceivedMessages] = useState([]);
  const [sentMessages, setSentMessages] = useState([]);
  const [messageDetails, setMessageDetails] = useState(null);
  const [practitioners, setPractitioners] = useState([]);
  const [appointments, setAppointments] = useState([]);
  const [loadingMessages, setLoadingMessages] = useState(true);
  const [loadingDetails, setLoadingDetails] = useState(false);
  const [loadingPractitioners, setLoadingPractitioners] = useState(true);
  const [loadingAppointments, setLoadingAppointments] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);

  // Define fetchMessages using useCallback so it can be used in useEffect and other functions
  const fetchMessages = useCallback(async () => {
    if (!userId) return;

    try {
      setLoadingMessages(true);

      const [receivedResponse, unreadResponse, sentResponse] = await Promise.all([
        MessagingService.fetchInboxMessages(userId),
        MessagingService.fetchUnreadMessages(userId),
        MessagingService.fetchSentMessages(userId),
      ]);

      if (!receivedResponse.success) {
        throw new Error(receivedResponse.error);
      }

      if (!unreadResponse.success) {
        throw new Error(unreadResponse.error);
      }

      if (!sentResponse.success) {
        throw new Error(sentResponse.error);
      }

      setReceivedMessages(receivedResponse.messages || []);
      setUnreadMessages(unreadResponse.messages || []);
      setSentMessages(sentResponse.messages || []);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoadingMessages(false);
    }
  }, [userId]);

  // Fetch all received and unread messages
  useEffect(() => {
    fetchMessages();
  }, [fetchMessages]);

  // Fetch message details
  const fetchMessageDetails = async (messageId) => {
    try {
      setLoadingDetails(true);
      const response = await MessagingService.fetchMessageDetails(messageId);
      if (response.success) {
        setMessageDetails(response.message);
      } else {
        throw new Error(response.error);
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setLoadingDetails(false);
    }
  };

  // Send a new message
  const sendMessage = async ({ sender_id, receiver_id, content, appointment_id }) => {
    try {
      setLoadingMessages(true);
      const response = await MessagingService.sendMessage({
        sender_id,
        receiver_id,
        content,
        appointment_id: appointment_id || null,
      });

      if (response.success) {
        setSuccess('Message sent successfully!');
        // Refresh messages
        await fetchMessages();
      } else {
        throw new Error(response.error);
      }
    } catch (err) {
      setError(`Failed to send message: ${err.message}`);
    } finally {
      setLoadingMessages(false);
    }
  };

  // Fetch practitioners
  const fetchPractitioners = async () => {
    try {
      setLoadingPractitioners(true);
      const response = await MessagingService.fetchPractitioners(userId);
      if (response.success) {
        setPractitioners(response.practitioners);
      } else {
        throw new Error(response.error);
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setLoadingPractitioners(false);
    }
  };

  // Fetch appointments for a practitioner
  const fetchAppointments = async (practitionerId) => {
    try {
      setLoadingAppointments(true);
      const response = await BookingService.getClientPractitionerAppointments(userId, practitionerId);
      if (response.success) {
        setAppointments(response.appointments);
      } else {
        throw new Error(response.error);
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setLoadingAppointments(false);
    }
  };

  return {
    allMessages: receivedMessages,
    unreadMessages,
    unreadMessagesCount: unreadMessages.length,
    sentMessages,
    messageDetails,
    practitioners,
    appointments,
    loadingMessages,
    loadingDetails,
    loadingPractitioners,
    loadingAppointments,
    error,
    success,
    fetchMessageDetails,
    sendMessage,
    fetchPractitioners,
    fetchAppointments,
    setError,
    setSuccess,
  };
};
