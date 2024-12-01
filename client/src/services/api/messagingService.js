import { supabase } from './index';

// available methods:
// fetchReceivedMessages
// fetchSentMessages
// sendMessage
// fetchRecipients

export const MessagingService = {
  

  async fetchReceivedMessages(userId) {
    const { data, error } = await supabase
      .from('messages')
      .select(`
        id,
        sender_id,
        receiver_id,
        content,
        created_at,
        is_deleted,
        is_read,
        appointment_id,
        sender:messages_sender_fk(first_name, last_name),
        receiver:messages_receiver_fk(first_name, last_name)
      `)
      .eq('receiver_id', userId)
      .order('created_at', { ascending: false });

    if (error) return { success: false, error: error.message };
    return { success: true, messages: data };
  },

  async fetchSentMessages(userId) {
    const { data, error } = await supabase
      .from('messages')
      .select(`
        id,
        sender_id,
        receiver_id,
        content,
        created_at,
        is_deleted,
        is_read,
        appointment_id,
        sender:messages_sender_fk(first_name, last_name),
        receiver:messages_receiver_fk(first_name, last_name)
      `)
      .eq('sender_id', userId)
      .order('created_at', { ascending: false });

    if (error) return { success: false, error: error.message };
    return { success: true, messages: data };
  },

  async sendMessage(messageData) {
    const { sender_id, receiver_id, content, appointment_id } = messageData;
    const { data, error } = await supabase
      .from('messages')
      .insert([
        {
          sender_id,
          receiver_id,
          content,
          appointment_id,
        },
      ])
      .select();

    if (error) return { success: false, error: error.message };
    return { success: true, message: data[0] };
  },

  async fetchRecipients(practitionerId) {
    
    const { data: appointmentsData, error: appointmentsError } = await supabase
      .from('appointments')
      .select('client_id')
      .eq('practitioner_id', practitionerId)
      .not('client_id', 'is', null);

    if (appointmentsError) {
      return { success: false, error: appointmentsError.message };
    }

    const uniqueClientIds = [...new Set(appointmentsData.map(appointment => appointment.client_id))];

    if (uniqueClientIds.length === 0) {
      
      return { success: true, recipients: [] };
    }

    // woops, first_name and last_name. not firstName and lastName.
    const { data: profilesData, error: profilesError } = await supabase
      .from('profiles')
      .select('id, first_name, last_name') 
      .in('id', uniqueClientIds)
      .order('first_name', { ascending: true });

    if (profilesError) {
      return { success: false, error: profilesError.message };
    }

    return { success: true, recipients: profilesData };
  },
};