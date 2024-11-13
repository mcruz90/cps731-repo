import { supabase } from './index';

export const financialService = {
  // Get transactions -- used to get the user's transactions
  getTransactions: async (userId) => {
      const { data, error } = await supabase
        .from('transactions')
        .select('*')
        .eq('user_id', userId)
        .order('date', { ascending: false });
      
    if (error) throw error;
    return data;  
  },

  // Create payment -- used to create a payment
  createPayment: async (paymentData) => {
    const { data, error } = await supabase
        .from('transactions')
        .insert([paymentData])
        .select()
        .single();
      
    if (error) throw error;
    return data;
  }
};