import { supabase } from './index';

// defines all services related to payment processing
// Available methods:
// processPayment, - processes a payment for an appointment (params: paymentData (Object), appointmentId (UUID))
// processProductPayment, - processes a payment for a product (params: paymentData (Object), orderId (UUID))

export const PaymentGateway = {

    // processPayment is called when a client makes a payment for an appointment
    async processPayment(paymentData, appointmentId) {
        try {
          console.log('Processing payment:', paymentData);
      
          // Validate required fields
          if (!paymentData.chargeId || !paymentData.amount || !paymentData.clientId || !appointmentId) {
            throw new Error('Missing required payment data');
          }
      
          // Create payment record with appointment_id and explicitly NULL order_id
          const { data: paymentRecord, error: dbError } = await supabase
            .from('payments')
            .insert([{
              amount: paymentData.amount,
              currency: paymentData.currency || 'CAD',
              status: 'completed',
              payment_method: 'stripe',
              transaction_id: paymentData.chargeId,
              client_id: paymentData.clientId,
              appointment_id: appointmentId,
              order_id: null,
            }])
            .select()
            .single();
      
          if (dbError) {
            console.error('Database error:', dbError);
            throw dbError;
          }
      
          console.log('Payment record created:', paymentRecord);
      
          return {
            success: true,
            payment: paymentRecord,
          };
        } catch (error) {
          console.error('Payment error:', error);
          return {
            success: false,
            error: error.message,
          };
        }
      },      

    // processProductPayment is called when a client makes a payment for a product
    async processProductPayment(paymentData, orderId) {
        try {
          const { data: { user } } = await supabase.auth.getUser();
          if (!user) throw new Error('No authenticated user');
      
          console.log('Processing product payment:', paymentData);
      
          // Validate required fields or else stripe rejects payment
          if (!paymentData.chargeId || !paymentData.amount) {
            throw new Error('Missing required payment data.');
          }
      
          const { data: existingPayment, error: fetchError } = await supabase
            .from('payments')
            .select('*')
            .eq('transaction_id', paymentData.chargeId)
            .single();
      
          if (fetchError && fetchError.code !== 'PGRST116') {
            
            console.error('Error fetching existing payment:', fetchError);
            throw fetchError;
          }
      
          if (existingPayment) {
            console.log('Duplicate payment detected, skipping creation.');
            return { success: true, payment: existingPayment };
          }
      
          
          const { data: paymentRecord, error: dbError } = await supabase
            .from('payments')
            .insert([{
              amount: paymentData.amount,
              currency: paymentData.currency || 'CAD',
              status: 'completed',
              payment_method: 'stripe',
              transaction_id: paymentData.chargeId, 
              client_id: user.id,
              order_id: orderId,
              appointment_id: null,
            }])
            .select()
            .single();
      
          if (dbError) {
            console.error('Database error:', dbError);
            throw dbError;
          }
      
          console.log('Payment record created:', paymentRecord);
      
          return { success: true, payment: paymentRecord };
        } catch (error) {
          console.error('Payment error:', error);
          return { success: false, error: error.message };
        }
      },
      
    
   // refunds an appointment payment
    async refundAppointmentPayment(appointmentId) {
        try {
          // Get the user's session to retrieve the JWT token for edge functions to properly work
          // wasn't working though, token keep being interpreted as invalid, so redeploy edge functions with jwt requirement off.
          const { data: { session }, error } = await supabase.auth.getSession();
          
          if (error) {
            throw new Error('Failed to get user session');
          }
      
          const accessToken = session?.access_token;
      
          if (!accessToken) {
            throw new Error('User is not authenticated');
          }
      
          const response = await fetch(`${import.meta.env.VITE_SUPABASE_FUNCTIONS_URL}/process-refund`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${accessToken}`,
            },
            body: JSON.stringify({ appointment_id: appointmentId }),
          });
      
          const data = await response.json();
      
          if (!response.ok) {
            console.error('Response not OK:', response);
            throw new Error(data.error || 'Failed to process refund');
          }
      
          return {
            success: true,
            refund: data.refund,
          };
        } catch (error) {
          console.error('Error processing refund:', error);
          return {
            success: false,
            error: error.message,
          };
        }
      },
      
};