import { supabase } from './index';

// defines all services related to financial transactions
// maybe need to conslidate this with reporting service???

export const financialService = {
  // Get transactions -- used to get the user's transactions (params: userId (UUID))
  getTransactions: async (userId) => {
      const { data, error } = await supabase
        .from('transactions')
        .select('*')
        .eq('user_id', userId)
        .order('date', { ascending: false });
      
    if (error) throw error;
    return data;  
  },

};