import { supabase } from './index';

export const reportService = {

  // Appointment Reports
  async getAppointmentReports({ 
    startDate, 
    endDate, 
    groupBy = 'month', 
    status = null,
    practitionerId = null,
    serviceId = null 
  }) {
    try {
      let query = supabase
        .from('appointment_reports')
        .select('*');

      // Filtering
      if (startDate) query = query.gte(groupBy, startDate);
      if (endDate) query = query.lte(groupBy, endDate);
      if (status) query = query.eq('status', status);
      if (practitionerId) query = query.eq('practitioner_id', practitionerId);
      if (serviceId) query = query.eq('service_id', serviceId);

      const { data, error } = await query;
      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error fetching appointment reports:', error);
      throw error;
    }
  },

  // Availability Reports
  async getAvailabilityReports(practitionerId = null) {
    try {
      let query = supabase
        .from('availability_reports')
        .select('*');

      if (practitionerId) {
        query = query.eq('practitioner_id', practitionerId);
      }

      const { data, error } = await query;
      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error fetching availability reports:', error);
      throw error;
    }
  },

  // Service Analytics--what services are available and how many appointments are scheduled for each? need to figure this out...
  async getServiceAnalytics(serviceId = null) {
    try {
      let query = supabase
        .from('service_analytics')
        .select('*');

      if (serviceId) {
        query = query.eq('service_id', serviceId);
      }

      const { data, error } = await query;
      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error fetching service analytics:', error);
      throw error;
    }
  },

  // Dashboard Summary
  async getDashboardSummary() {
    try {
      const today = new Date().toISOString().split('T')[0];
      const { data, error } = await supabase
        .from('appointments')
        .select(`
          id,
          status,
          services (
            price
          )
        `)
        .eq('date', today);

      if (error) throw error;

      const summary = {
        todayAppointments: data.length,
        todayRevenue: data
          .filter(a => a.status === 'completed')
          .reduce((sum, a) => sum + a.services.price, 0),
        cancelledAppointments: data
          .filter(a => a.status === 'cancelled').length,
        potentialRevenueLoss: data
          .filter(a => a.status === 'cancelled')
          .reduce((sum, a) => sum + a.services.price, 0)
      };

      return summary;
    } catch (error) {
      console.error('Error fetching dashboard summary:', error);
      throw error;
    }
  }
};