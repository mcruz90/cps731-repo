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

      // Step 1: Process payment and create payment record
      const paymentResult = await PaymentGateway.processProductPayment({
        chargeId: payment.chargeId,
        amount: totalAmount,
        currency: 'CAD',
        billingDetails: payment.billingDetails,
      }, null); // Pass null for orderId since we don't have it yet

      if (!paymentResult.success) {
        throw new Error(`Payment failed: ${paymentResult.error}`);
      }

      console.log('Payment processed successfully.');

      // Step 2: Create the order in the database
      const { data: order, error: orderError } = await supabase
        .from('orders')
        .insert([{
          user_id: user.id,
          status: 'processing', // Ensure it's a valid status
          total_amount: totalAmount,
          shipping_address: shipping,
          payment_details: {
            card_holder: payment.billingDetails.name,
            billing_details: payment.billingDetails,
            transaction_id: paymentResult.payment.transaction_id,
          },
        }])
        .select()
        .single();

      if (orderError) throw orderError;

      console.log('Order created with ID:', order.id);

      // Step 3: Update the payment record with the order ID
      const { error: updatePaymentError } = await supabase
        .from('payments')
        .update({ order_id: order.id })
        .eq('id', paymentResult.payment.id);

      if (updatePaymentError) throw updatePaymentError;

      console.log('Payment record updated with order ID.');

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
        const newQuantity = item.products.quantity - item.quantity;
        if (newQuantity < 0) {
          throw new Error(`Insufficient inventory for product ID ${item.products.id}`);
        }

        const { error: updateError } = await supabase
          .from('products')
          .update({ quantity: newQuantity })
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