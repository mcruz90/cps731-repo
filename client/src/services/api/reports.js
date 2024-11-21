import { supabase } from './index';

export const reportService = {

  // Dashboard Summary - updated to show weekly metrics
  async getDashboardSummary() {
    try {
      // Get start of current week
      const now = new Date();
      const startOfWeek = new Date(now.setDate(now.getDate() - now.getDay()));
      startOfWeek.setHours(0, 0, 0, 0);

      const { data, error } = await supabase
        .from('appointments')
        .select(`
          id,
          status,
          services (
            price
          )
        `)
        .gte('date', startOfWeek.toISOString().split('T')[0]);

      if (error) throw error;

      const summary = {
        weeklyAppointments: data.length,
        weeklyRevenue: data
          .filter(a => a.status === 'completed')
          .reduce((sum, a) => sum + (a.services?.price || 0), 0),
        weeklyCancellations: data
          .filter(a => a.status === 'cancelled').length,
        weeklyRevenueLoss: data
          .filter(a => a.status === 'cancelled')
          .reduce((sum, a) => sum + (a.services?.price || 0), 0)
      };

      return summary;
    } catch (error) {
      console.error('Error fetching dashboard summary:', error);
      throw error;
    }
  },

  // Appointment Reports - updated to include statistics and revenue analysis
  async getAppointmentReports(reportType, { 
    startDate, 
    endDate, 
    groupBy = 'month', 
    practitionerId = null,
    serviceId = null 
  } = {}) {
    try {
      let query = supabase
        .from('appointments')
        .select(`
          id,
          status,
          date,
          service_id,
          services!inner (
            id,
            name,
            price
          ),
          practitioner_id,
          profiles!practitioner_id (
            id,
            first_name,
            last_name
          )
        `);

      // Apply filters if provided
      if (startDate) query = query.gte('date', startDate);
      if (endDate) query = query.lte('date', endDate);
      if (practitionerId) query = query.eq('practitioner_id', practitionerId);
      if (serviceId) query = query.eq('service_id', serviceId);

      const { data, error } = await query;
      if (error) throw error;

      let statistics = {};
      let revenueByPeriod = {};

      switch (reportType) {
        // Appointment Statistics
        case 0: {
          statistics = data.reduce((acc, appointment) => {
            const serviceType = appointment.services?.name || 'Unknown';
            
            if (!acc[serviceType]) {
              acc[serviceType] = {
                serviceType,
                totalAppointments: 0,
                completed: 0,
                cancelled: 0,
                revenue: 0,
                appointments: [] 
              };
            }

            acc[serviceType].totalAppointments++;
            acc[serviceType].appointments.push(appointment);
            
            if (appointment.status === 'completed') {
              acc[serviceType].completed++;
              acc[serviceType].revenue += appointment.services?.price || 0;
            } else if (appointment.status === 'cancelled') {
              acc[serviceType].cancelled++;
            }

            return acc;
          }, {});

          return {
            statistics: Object.values(statistics)
          };
        }
        // Revenue Analysis
        case 1: {
          revenueByPeriod = data.reduce((acc, appointment) => {
            
            // Ensure we have a valid date string
            if (!appointment.date) {
              console.warn('Missing date for appointment:', appointment);
              return acc;
            }

            // Format the period more safely
            let period;
            try {
              const date = new Date(appointment.date);
              period = groupBy === 'month' 
                ? `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`
                : `${date.getFullYear()}`;
            } catch (err) {
              console.error('Error parsing date:', appointment.date, err);
              return acc;
            }

            // Initialize period if it doesn't exist
            if (!acc[period]) {
              acc[period] = {
                period,
                revenue: 0,
                appointments: 0,
                averageRevenue: 0
              };
            }

            // Only count completed appointments
            if (appointment.status === 'completed' && appointment.services?.price) {
              acc[period].revenue += Number(appointment.services.price);
              acc[period].appointments++;
              acc[period].averageRevenue = acc[period].revenue / acc[period].appointments;
            }

            return acc;
          }, {});

          const sortedRevenue = Object.values(revenueByPeriod)
            .sort((a, b) => b.period.localeCompare(a.period));

          return {
            revenue: sortedRevenue
          };
        }

        default:
          throw new Error('Invalid report type');
      }
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

  async getFilteredReports({
    startDate,
    endDate,
    practitionerId,
    serviceId,
    status
  }) {
    try {
      let query = supabase
        .from('appointments')
        .select(`
          id,
          date,
          time,
          status,
          services (
            id,
            name,
            price
          ),
          practitioner:profiles!practitioner_id (
            first_name,
            last_name
          ),
          client:profiles!client_id (
            first_name,
            last_name
          )
        `);

      // Convert dates to ISO string format if they exist
      if (startDate) {
        const formattedStartDate = new Date(startDate).toISOString().split('T')[0];
        query = query.gte('date', formattedStartDate);
      }
      
      if (endDate) {
        const formattedEndDate = new Date(endDate).toISOString().split('T')[0];
        query = query.lte('date', formattedEndDate);
      }

      if (practitionerId) query = query.eq('practitioner_id', practitionerId);
      if (serviceId) query = query.eq('service_id', serviceId);
      if (status) query = query.eq('status', status);

      const { data, error } = await query;
      if (error) throw error;

      return data;
    } catch (error) {
      console.error('Error fetching filtered reports:', error);
      throw error;
    }
  },

  async getPractitioners() {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('id, first_name, last_name')
        .eq('role', 'practitioner');

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error fetching practitioners:', error);
      throw error;
    }
  },

  async getServices() {
    try {
      const { data, error } = await supabase
        .from('services')
        .select('id, name')
        .eq('active', true);

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error fetching services:', error);
      throw error;
    }
  }
};