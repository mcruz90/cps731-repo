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
};