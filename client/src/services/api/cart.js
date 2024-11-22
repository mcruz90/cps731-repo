import { supabase } from './index';

export const cartService = {
  async getCartItems() {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('Not authenticated');

    const { data, error } = await supabase
      .from('cart_items')
      .select(`
        *,
        products (
          id,
          name,
          price,
          quantity
        )
      `)
      .eq('user_id', user.id);

    if (error) throw error;
    return data;
  },

  async addToCart(productId, quantity, price) {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('Not authenticated');

    const { error } = await supabase
      .from('cart_items')
      .upsert({
        user_id: user.id,
        product_id: productId,
        quantity,
        price
      }, {
        onConflict: 'user_id, product_id',
        ignoreDuplicates: false
      });

    if (error) throw error;
  },

  async updateCartItem(cartItemId, quantity) {
    const { error } = await supabase
      .from('cart_items')
      .update({ quantity })
      .eq('id', cartItemId);

    if (error) throw error;
  },

  async removeFromCart(cartItemId) {
    const { error } = await supabase
      .from('cart_items')
      .delete()
      .eq('id', cartItemId);

    if (error) throw error;
  },

  async getCartCount() {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return 0;

    const { data, error } = await supabase
      .from('cart_items')
      .select('quantity')
      .eq('user_id', user.id);

    if (error) throw error;
    return data.reduce((sum, item) => sum + item.quantity, 0);
  },

  subscribeToCartChanges(callback) {
    const channel = supabase
      .channel('cart_changes')
      .on('postgres_changes', 
        { event: '*', schema: 'public', table: 'cart_items' }, 
        callback
      )
      .subscribe();

    return () => supabase.removeChannel(channel);
  }
};