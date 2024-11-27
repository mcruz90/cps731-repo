import { supabase } from './index';

export const inventoryService = {
  
  
  // get items from inventory
  retrieveInventory: async () => {
    const {data, error} = await supabase.from("products").select('*')
    if(error) throw error;
    return data
  },

  // Update itams in inventory
  updateItem: async (id, updates) => {
    const {data, error} = await supabase
      .from('products')
      .update(updates)
      .eq('id', id);
      
    if (error) throw error;
    return data;
  },

  addInventoryItem: async (item) => {
    const { data, error } = await supabase.from("products").insert(item).select();
    if (error) throw error;
    return data[0];
  },

};