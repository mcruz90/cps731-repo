import { supabase } from './index';

export const appointmentService = {
  
  // get all appointments
  getAll: async () => {
    const { data, error } = await supabase.from('appointments').select('*');
    if (error) throw error;
    return data;
  },

  // get upcoming appointments
  getUpcoming: async () => {
    const { data, error } = await supabase.from('appointments').select('*').eq('status', 'upcoming');
    if (error) throw error;
    return data;
  },

  // create an appointment
  create: async (appointment) => {
    const { data, error } = await supabase.from('appointments').insert(appointment).select();
    if (error) throw error;
    return data;
  },

  // update an appointment
  update: async (id, updates) => {
    const { data, error } = await supabase.from('appointments').update(updates).eq('id', id).select();
    if (error) throw error;
    return data;
  },

  // cancel an appointment
  cancel: async (id) => {
    const { data, error } = await supabase
        .from('appointments')
        .update({ status: 'cancelled' })
        .eq('id', id)
        .select()
        .single();
      
    if (error) throw error;
    return data;
  }
};