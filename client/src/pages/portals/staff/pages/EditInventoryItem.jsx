import React, { useState } from 'react';
import { TextField, Button, Box } from '@mui/material';
import { inventoryService } from '@/services/api/inventory';

const EditInventoryItem = ({ item, onSave, onCancel }) => {
  const [formData, setFormData] = useState({
    name: item.name || '',
    description: item.description || '',
    price: item.price || '',
    quantity: item.quantity || '',
  });

  const handleChange = (field) => (event) => {
    setFormData({ ...formData, [field]: event.target.value });
  };

  const handleSave = async () => {
    try {
      await inventoryService.updateItem(item.id, formData);
      onSave(formData);
    } catch (error) {
      console.error('Error updating item:', error);
    }
  };

  return (
    <Box component="form" sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
      <TextField
        label="Name"
        value={formData.name}
        onChange={handleChange('name')}
        fullWidth
      />
      <TextField
        label="Description"
        value={formData.description}
        onChange={handleChange('description')}
        fullWidth
        multiline
        rows={3}
      />
      <TextField
        label="Price"
        type="number"
        value={formData.price}
        onChange={handleChange('price')}
        fullWidth
      />
      <TextField
        label="Quantity"
        type="number"
        value={formData.quantity}
        onChange={handleChange('quantity')}
        fullWidth
      />
      <Box sx={{ display: 'flex', gap: 2, mt: 2 }}>
        <Button variant="contained" color="primary" onClick={handleSave}>
          Save
        </Button>
        <Button variant="outlined" onClick={onCancel}>
          Cancel
        </Button>
      </Box>
    </Box>
  );
};

export default EditInventoryItem;
