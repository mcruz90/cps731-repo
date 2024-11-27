import { supabase } from './index';
import { PaymentGateway } from './payment';


// defines all services related to product ordering
// Available methods:
// createOrder, - creates a new order (params: items (Array), shipping (Object), payment (Object))
// getOrders, - gets all orders for the authenticated user (params: none)
// getOrderById, - gets a single order by id for the authenticated user (params: orderId (UUID))
// updateOrderStatus, - updates the status of an order (params: orderId (UUID), status (String))

export const orderService = {

  // createOrder is called once all details from order process workflow in UI has been collected
  async createOrder({ items, shipping, payment }) {
    try {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) throw new Error('No authenticated user');

        console.log('Shipping data received:', shipping);

        // Calculate total amount
        const totalAmount = items.reduce((sum, item) => 
            sum + item.quantity * item.products.price, 
            0
        ).toFixed(2);

        // Step 1: Start database transaction
        const { data: order, error: orderError } = await supabase
            .from('orders')
            .insert([{
                user_id: user.id,
                status: 'processing', // Ensure it's a valid status
                total_amount: totalAmount,
                shipping_address: shipping,
                payment_details: {}, // Placeholder for payment details
            }])
            .select()
            .single();

        if (orderError) throw orderError;

        console.log('Order created with ID:', order.id);

        // Step 2: Process payment
        const paymentResponse = await PaymentGateway.processProductPayment({
            paymentMethodId: payment.paymentMethodId,
            amount: totalAmount,
            currency: 'cad',
        }, order.id);

        if (!paymentResponse.success) {
            throw new Error(`Payment failed: ${paymentResponse.error}`);
        }

        console.log('Payment processed successfully.');

        // Step 3: Update order with payment details
        const { error: updateOrderError } = await supabase
            .from('orders')
            .update({
                payment_details: {
                    card_holder: payment.cardName,
                    billing_details: payment.billingDetails,
                    transaction_id: paymentResponse.payment.transaction_id,
                },
            })
            .eq('id', order.id);

        if (updateOrderError) throw updateOrderError;

        console.log('Order updated with payment details.');

        // Step 4: Insert order items
        const orderItems = items.map(item => ({
            order_id: order.id,
            product_id: item.products.id,
            quantity: item.quantity,
            price: Number(item.products.price).toFixed(2),
        }));

        const { error: itemsError } = await supabase
            .from('order_items')
            .insert(orderItems);

        if (itemsError) throw itemsError;

        console.log('Order items added.');

        // Step 5: Update product inventory
        for (const item of items) {
            const { error: updateError } = await supabase
                .from('products')
                .update({
                    quantity: item.products.quantity - item.quantity,
                })
                .eq('id', item.products.id);

            if (updateError) throw updateError;
        }

        console.log('Inventory updated.');

        // Step 6: Clear the cart
        const { error: cartError } = await supabase
            .from('cart_items')
            .delete()
            .eq('user_id', user.id);

        if (cartError) throw cartError;

        console.log('Cart cleared successfully.');

        return order;
    } catch (error) {
        console.error('Order creation failed:', error);
        throw new Error('Failed to create order. Please try again.');
    }
  },

  
  // Get all orders for authenticated user
  async getOrders() {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('No authenticated user');

    const { data, error } = await supabase
      .from('orders')
      .select(`
        *,
        order_items (
          *,
          products (*)
        )
      `)
      .eq('user_id', user.id)
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data;
  },

  // Get a single order by id for authenticated user
  async getOrderById(orderId) {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('No authenticated user');

    const { data, error } = await supabase
      .from('orders')
      .select(`
        *,
        order_items (
          *,
          products (*)
        )
      `)
      .eq('id', orderId)
      .eq('user_id', user.id)
      .single();

    if (error) throw error;
    return data;
  },

  // Update order status depending on the actions or workflow in UI
  // e.g. cancel, return, refund, etc.
  async updateOrderStatus(orderId, status) {
    const { error } = await supabase
      .from('orders')
      .update({ 
        status,
        updated_at: new Date().toISOString()
      })
      .eq('id', orderId);

    if (error) throw error;
  }
};