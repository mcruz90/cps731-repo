import { supabase } from './index';

// defines all services related to the cart
// Available methods:
// getCartItems, - fetches the cart items (params: none)
// addToCart, - adds an item to the cart (params: productId (UUID), quantity (Number), price (Number))
// updateCartItem, - updates the quantity of an item in the cart (params: cartItemId (UUID), quantity (Number))
// removeFromCart, - removes an item from the cart (params: cartItemId (UUID))
// getUniqueCartCount, - gets the unique cart count (params: none)
// subscribeToCartChanges, - subscribes to cart changes (params: callback function)
// clearCart, - clears the cart (params: none)

export const cartService = {

  // Get cart items
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

  // Add to cart
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

  // Update cart item quantity
  async updateCartItem(cartItemId, quantity) {
    const { error } = await supabase
      .from('cart_items')
      .update({ quantity })
      .eq('id', cartItemId);

    if (error) throw error;
  },

  // Remove item from cart
  async removeFromCart(cartItemId) {
    const { error } = await supabase
      .from('cart_items')
      .delete()
      .eq('id', cartItemId);

    if (error) throw error;
  },

  // Get Unique Cart Count
  async getUniqueCartCount() {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return 0;

    const { count, error } = await supabase
      .from('cart_items')
      .select('id', { count: 'exact', head: true })
      .eq('user_id', user.id);

    if (error) throw error;
    return count;
  },

  // Subscribe to cart changes so cart button can update badge count using supabase's channel API
  subscribeToCartChanges(callback) {
    const channel = supabase
      .channel('cart_changes')
      .on(
        'postgres_changes',
        { event: ['INSERT', 'UPDATE', 'DELETE'], schema: 'public', table: 'cart_items' },
        payload => {
          
          const { user_id } = payload.new || payload.old || {};
          supabase.auth.getUser().then(({ data: { user } }) => {
            if (user && user.id === user_id) {
              callback(payload);
            }
          });
        }
      )
      .subscribe();

    return () => supabase.removeChannel(channel);
  },

  // Clear cart for authenticated user once the order is complete
  async clearCart() {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('No authenticated user');

    const { error } = await supabase
      .from('cart_items')
      .delete()
      .eq('user_id', user.id);

    if (error) throw error;
  }
};