import { supabase } from './index';

export const SchedulerSystem = {
    async checkAvailability(practitionerId, date, time) {
      try {
        // Check if the time slot is available
        const { data, error } = await supabase
          .from('appointments')
          .select('id')
          .eq('practitioner_id', practitionerId)
          .eq('appointment_date', date)
          .eq('start_time', time);
  
        if (error) throw error;
        
        // Returns true if time slot is available
        return data.length === 0; 
      } catch (error) {
        console.error('Error checking availability:', error);
        throw new Error(`Failed to check availability: ${error.message}`);
      }
    }

  };