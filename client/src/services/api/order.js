import { supabase } from './index';

export const orderService = {
  async createOrder({ items, shipping, payment }) {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('No authenticated user');

      // Start a Supabase transaction
      const { data: order, error: orderError } = await supabase
        .from('orders')
        .insert([
          {
            user_id: user.id,
            status: 'pending',
            total_amount: items.reduce((sum, item) => sum + (item.quantity * item.products.price), 0),
            shipping_address: shipping,
            payment_details: {
              last_four: payment.cardNumber.slice(-4),
              card_holder: payment.cardName,
              expiry_date: payment.expiryDate
            }
          }
        ])
        .select()
        .single();

      if (orderError) throw orderError;

      // Create order items
      const orderItems = items.map(item => ({
        order_id: order.id,
        product_id: parseInt(item.products.id),
        quantity: item.quantity,
        price: item.products.price
      }));

      const { error: itemsError } = await supabase
        .from('order_items')
        .insert(orderItems);

      if (itemsError) throw itemsError;

      // Update product quantities
      for (const item of items) {
        const { error: updateError } = await supabase
          .from('products')
          .update({ 
            quantity: supabase.raw(`quantity - ${item.quantity}`)
          })
          .eq('id', parseInt(item.products.id)); 

        if (updateError) throw updateError;
      }

      return order;
    } catch (error) {
      console.error('Error creating order:', error);
      throw new Error('Failed to create order. Please try again.');
    }
  },

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
  }
};