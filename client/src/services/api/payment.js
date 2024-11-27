<<<<<<< HEAD
// PROPER WORKFLOW AND NAMING BASED ON INTEGRATION DIAGRAMS AND DOMAIN MODEL
// export const PaymentGateway = {
//    startPayment,
//    processPayment
//}

import { supabase } from './index';

export const PaymentGateway = {
    async processPayment(paymentData) {
        try {
            const { data, error} = await supabase.functions.invoke('process-payment', {
                body: paymentData
            });

            if (error) {
                throw error;
        }

        const { data: paymentRecord, error: dbError } = await supabase
            .from('payments')
            .insert([{
                amount: paymentData.amount,
                currency: paymentData.currency,
                status: 'completed',
                payment_method: paymentData.paymentMethod,
                transaction_id: data.transaction_id
            }])
            .select()
            .single();

        if (dbError) {
            throw dbError;
        }

        return {
            success: true,
            paymentId: paymentRecord.id,
            transactionId: data.transactionId
        };
    } catch (error) {
        console.error('Error processing payment:', error);
        return {
            success: false,
            error: error.message
        };
    }
}
=======
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
            if (!paymentData.paymentMethodId || !paymentData.amount || !paymentData.clientId || !appointmentId) {
                throw new Error('Missing required payment data');
            }

            // Create payment record with appointment_id and explicitly NULL order_id
            const { data: paymentRecord, error: dbError } = await supabase
                .from('payments')
                .insert([{
                    amount: paymentData.amount,
                    currency: paymentData.currency || 'cad',
                    status: 'completed',
                    payment_method: 'stripe',
                    transaction_id: paymentData.paymentMethodId,
                    client_id: paymentData.clientId,
                    appointment_id: appointmentId,
                    order_id: null
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
                payment: paymentRecord
            };
        } catch (error) {
            console.error('Payment error:', error);
            return {
                success: false,
                error: error.message
            };
        }
    },

    // processProductPayment is called when a client makes a payment for a product
    async processProductPayment(paymentData, orderId) {
        try {
            const { data: { user } } = await supabase.auth.getUser();
            if (!user) throw new Error('No authenticated user');

            console.log('Processing product payment:', paymentData);

            // Validate required fields
            if (!paymentData.paymentMethodId || !paymentData.amount || !orderId) {
                throw new Error('Missing required payment data or orderId.');
            }

            // Step 1: Check for existing payment
            const { data: existingPayment, error: fetchError } = await supabase
                .from('payments')
                .select('*')
                .eq('transaction_id', paymentData.paymentMethodId)
                .single();

            if (fetchError && fetchError.code !== 'PGRST116') {
                // Ignore "not found" errors
                console.error('Error fetching existing payment:', fetchError);
                throw fetchError;
            }

            if (existingPayment) {
                console.log('Duplicate payment detected, skipping creation.');
                return { success: true, payment: existingPayment };
            }

            // Step 2: Create payment record
            const { data: paymentRecord, error: dbError } = await supabase
                .from('payments')
                .insert([{
                    amount: paymentData.amount,
                    currency: paymentData.currency || 'cad',
                    status: 'completed',
                    payment_method: 'stripe',
                    transaction_id: paymentData.paymentMethodId,
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
    

>>>>>>> supabase-send-email
};