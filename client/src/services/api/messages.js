import {supabase} from "./index"


// MESSAGING SERVICE
// methods available:
// fetchInboxMessages(userId): Fetch messages where receiver_id = userId.
// fetchPractitioners(clientId): Fetch practitioners who have had appointments with the client.
// sendMessage(senderId, receiverId, content): Insert a new message.
// fetchMessageDetails(messageId): Fetch a specific message by id.
// markAsRead(messageId): Update is_read = true for a message.
// deleteMessage(messageId): Update is_deleted = true for a message.
// fetchSentMessages(userId): Fetch messages sent by the user.
// fetchUnreadMessages(userId): Fetch the number of unread messages for a user.
//--------------------------------

export const MessagingService = {

    // fetches messages from the inbox of the user
    async fetchInboxMessages(userId) {
        try {
          const { data, error } = await supabase
            .from('messages')
            .select(`
              id,
              sender_id,
              receiver_id,
              content,
              created_at,
              is_read,
              profiles:sender_id (
                first_name,
                last_name
              )
            `)
            .eq('receiver_id', userId)
            .eq('is_deleted', false)
            .order('created_at', { ascending: false });
    
          if (error) throw error;
    
          const messages = data.map((msg) => ({
            id: msg.id,
            senderId: msg.sender_id,
            senderName: `${msg.profiles.first_name} ${msg.profiles.last_name}`,
            content: msg.content,
            createdAt: msg.created_at,
            isRead: msg.is_read,
          }));
    
          return { success: true, messages };
        } catch (error) {
          console.error('Error fetching inbox messages:', error);
          return { success: false, error: error.message };
        }
      },

    // fetches practitioners who have appointments with the client
    async fetchPractitioners(clientId) {
        try {
          const { data, error } = await supabase
            .from('appointments')
            .select(`
              practitioner_id,
              profiles:practitioner_id (
                id,
                first_name,
                last_name
              )
            `)
            .eq('client_id', clientId)
            .order('date', { ascending: false });
    
          if (error) throw error;
    
          const uniquePractitioners = new Map();
          data.forEach((appointment) => {
            const practitioner = appointment.profiles;
            uniquePractitioners.set(practitioner.id, {
              id: practitioner.id,
              name: `${practitioner.first_name} ${practitioner.last_name}`,
            });
          });
    
          return { success: true, practitioners: Array.from(uniquePractitioners.values()) };
        } catch (error) {
          console.error('Error fetching practitioners:', error);
          return { success: false, error: error.message };
        }
    },

    // sends a message to a practitioner
    async sendMessage({ sender_id, receiver_id, content, appointment_id = null }) {
      try {
        // Ensure all fields are valid UUIDs or null! ids are UUIDs in supabase!
        if (!sender_id || !receiver_id || !content) {
          throw new Error("Missing required fields: sender_id, receiver_id, or content.");
        }
    
        const messagePayload = {
          sender_id,
          receiver_id,
          content,
          appointment_id: appointment_id || null,
        };
    
        console.log("Payload sent to Supabase:", messagePayload);
    
        const { data, error } = await supabase
          .from("messages")
          .insert([messagePayload])
          .select();
    
        if (error) {
          console.error("Error inserting message:", error);
          throw error;
        }
    
        return {
          success: true,
          message: data,
        };
      } catch (error) {
        console.error("Error sending message:", error);
        return {
          success: false,
          error: error.message,
        };
      }
    },
      
    // get the contents of a message
    async fetchMessageDetails(messageId) {
      try {
          const { data: messageData, error: messageError } = await supabase
              .from('messages')
              .select(`
                  id,
                  sender_id,
                  receiver_id,
                  content,
                  created_at,
                  is_read,
                  appointment_id,
                  sender:sender_id (
                      first_name,
                      last_name
                  ),
                  receiver:receiver_id (
                      first_name,
                      last_name
                  )
              `)
              .eq('id', messageId)
              .single();
  
            if (messageError) throw messageError;
  
          let appointmentDetails = null;
          if (messageData.appointment_id) {
              const { data: appointmentData, error: appointmentError } = await supabase
                  .from('appointments')
                  .select(`
                      id,
                      date,
                      time,
                      status,
                      client_id,
                      practitioner_id,
                      profiles:practitioner_id (
                          first_name,
                          last_name
                      )
                  `)
                  .eq('id', messageData.appointment_id)
                  .single();
  
              if (appointmentError) throw appointmentError;
              appointmentDetails = appointmentData;
          }
  
          const message = {
              id: messageData.id,
              senderId: messageData.sender_id,
              receiverId: messageData.receiver_id,
              senderName: `${messageData.sender.first_name} ${messageData.sender.last_name}`,
              receiverName: `${messageData.receiver.first_name} ${messageData.receiver.last_name}`,
              content: messageData.content,
              createdAt: messageData.created_at,
              isRead: messageData.is_read,
              appointmentId: messageData.appointment_id,
              appointmentDetails: appointmentDetails,
          };
  
          return { success: true, message };
      } catch (error) {
          console.error('Error fetching message details:', error);
          return { success: false, error: error.message };
      }
    },
    
    // marks a message as read
    async markAsRead(messageId) {
        try {
          const { data, error } = await supabase
            .from('messages')
            .update({ is_read: true })
            .eq('id', messageId)
            .select()
            .single();
    
          if (error) throw error;
    
          return { success: true, message: data };
        } catch (error) {
          console.error('Error marking message as read:', error);
          return { success: false, error: error.message };
        }
      },

    // deletes a message
    async deleteMessage(messageId) {
        try {
          const { data, error } = await supabase
            .from('messages')
            .update({ is_deleted: true })
            .eq('id', messageId)
            .select()
            .single();
    
          if (error) throw error;
    
          return { success: true, message: data };
        } catch (error) {
          console.error('Error deleting message:', error);
          return { success: false, error: error.message };
        }
    },

    // fetches messages sent by the user
    // TODO: properly change the unread/read status. this isn't working right now.
    async fetchSentMessages(userId) {
      try {
        const { data, error } = await supabase
          .from("messages")
          .select(
            `
            id,
            content,
            is_read,
            created_at,
            receiver_id,
            profiles!receiver_id (first_name, last_name)
            `
          )
          .eq("sender_id", userId)
          .order("created_at", { ascending: false });
    
        if (error) throw error;
    
        const messages = data.map((message) => ({
          id: message.id,
          content: message.content,
          isRead: message.is_read,
          createdAt: message.created_at,
          receiverName: `${message.profiles.first_name} ${message.profiles.last_name}`,
        }));
    
        return {
          success: true,
          messages,
        };
      } catch (error) {
        console.error("Error fetching sent messages:", error);
        return {
          success: false,
          error: error.message,
        };
      }
    },

    // get unread messages
    async fetchUnreadMessages(userId) {
      try {
        const { count, error } = await supabase
          .from('messages')
          .select('id', { count: 'exact' })
          .eq('receiver_id', userId)
          .eq('is_read', false);
    
        if (error) throw error;
    
        return {
          success: true,
          unreadCount: count,
        };
      } catch (error) {
        console.error('Error fetching unread messages:', error);
        return {
          success: false,
          error: error.message,
        };
      }
    }
    
}
