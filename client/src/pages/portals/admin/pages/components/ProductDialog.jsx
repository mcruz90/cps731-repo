import { useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  Grid,
  Alert
} from '@mui/material';

function ProductDialog({ open, onClose, onSave, product, mode }) {
  const [editData, setEditData] = useState({
    name: '',
    description: '',
    price: '',
    quantity: '',
    supply_cost: '',
    profit_margin: ''
  });

  const [validationErrors, setValidationErrors] = useState({});
  const [error, setError] = useState(null);

  useEffect(() => {
    if (product && mode === 'edit') {
      setEditData({
        name: product.name || '',
        description: product.description || '',
        price: product.price?.toString() || '',
        quantity: product.quantity?.toString() || '',
        supply_cost: product.supply_cost?.toString() || '',
        profit_margin: product.profit_margin?.toString() || ''
      });
    } else {
        
      setEditData({
        name: '',
        description: '',
        price: '',
        quantity: '',
        supply_cost: '0',
        profit_margin: '100'
      });
    }
    setValidationErrors({});
    setError(null);
  }, [product, mode, open]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setEditData(prev => {
      const newData = {
        ...prev,
        [name]: value
      };

      // Automatically calculate profit margin when price or supply cost changes
      if (name === 'price' || name === 'supply_cost') {
        const price = parseFloat(name === 'price' ? value : prev.price) || 0;
        const supplyCost = parseFloat(name === 'supply_cost' ? value : prev.supply_cost) || 0;
        
        if (price > 0) {
          newData.profit_margin = ((price - supplyCost) / price * 100).toFixed(2);
        }
      }

      return newData;
    });
  };

  const validateForm = () => {
    const errors = {};
    
    // Required fields
    if (!editData.name?.trim()) errors.name = 'Name is required';
    if (!editData.price) errors.price = 'Price is required';
    if (!editData.quantity) errors.quantity = 'Quantity is required';

    // Numeric validation
    if (isNaN(Number(editData.price)) || Number(editData.price) < 0) {
      errors.price = 'Price must be a positive number';
    }
    if (isNaN(Number(editData.quantity)) || Number(editData.quantity) < 0) {
      errors.quantity = 'Quantity must be a positive number';
    }
    if (isNaN(Number(editData.supply_cost)) || Number(editData.supply_cost) < 0) {
      errors.supply_cost = 'Supply cost must be a positive number';
    }

    // Business logic validation
    if (Number(editData.supply_cost) > Number(editData.price)) {
      errors.supply_cost = 'Supply cost cannot be greater than price';
    }

    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSave = () => {
    try {
      if (validateForm()) {
        onSave({
          name: editData.name.trim(),
          description: editData.description.trim(),
          price: parseFloat(editData.price),
          quantity: parseInt(editData.quantity),
          supply_cost: editData.supply_cost,
          profit_margin: editData.profit_margin
        });
      }
    } catch (err) {
      setError(err.message);
    }
  };

  return (
    <Dialog 
      open={open} 
      onClose={onClose} 
      maxWidth="md" 
      fullWidth
      PaperProps={{
        sx: { maxHeight: '90vh' }
      }}
    >
      <DialogTitle>
        {mode === 'edit' ? 'Edit Product' : 'Add New Product'}
      </DialogTitle>
      <DialogContent>
        {error && (
          <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>
        )}
        <Grid container spacing={2} sx={{ mt: 1 }}>
          <Grid item xs={12}>
            <TextField
              fullWidth
              label="Name"
              name="name"
              value={editData.name}
              onChange={handleChange}
              error={!!validationErrors.name}
              helperText={validationErrors.name}
              required
            />
          </Grid>
          <Grid item xs={12}>
            <TextField
              fullWidth
              label="Description"
              name="description"
              value={editData.description}
              onChange={handleChange}
              multiline
              rows={3}
            />
          </Grid>
          <Grid item xs={12} sm={6}>
            <TextField
              fullWidth
              label="Price ($)"
              name="price"
              type="number"
              value={editData.price}
              onChange={handleChange}
              error={!!validationErrors.price}
              helperText={validationErrors.price}
              required
              inputProps={{ 
                step: "0.01",
                min: "0"
              }}
            />
          </Grid>
          <Grid item xs={12} sm={6}>
            <TextField
              fullWidth
              label="Quantity"
              name="quantity"
              type="number"
              value={editData.quantity}
              onChange={handleChange}
              error={!!validationErrors.quantity}
              helperText={validationErrors.quantity}
              required
              inputProps={{ 
                step: "1",
                min: "0"
              }}
            />
          </Grid>
          <Grid item xs={12} sm={6}>
            <TextField
              fullWidth
              label="Supply Cost ($)"
              name="supply_cost"
              type="number"
              value={editData.supply_cost}
              onChange={handleChange}
              error={!!validationErrors.supply_cost}
              helperText={validationErrors.supply_cost}
              inputProps={{ 
                step: "0.01",
                min: "0"
              }}
            />
          </Grid>
          <Grid item xs={12} sm={6}>
            <TextField
              fullWidth
              label="Profit Margin (%)"
              name="profit_margin"
              value={editData.profit_margin}
              InputProps={{
                readOnly: true
              }}
            />
          </Grid>
        </Grid>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Cancel</Button>
        <Button onClick={handleSave} variant="contained">
          {mode === 'edit' ? 'Save Changes' : 'Add Product'}
        </Button>
      </DialogActions>
    </Dialog>
  );
}

ProductDialog.propTypes = {
  open: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
  onSave: PropTypes.func.isRequired,
  product: PropTypes.shape({
    name: PropTypes.string,
    description: PropTypes.string,
    price: PropTypes.number,
    quantity: PropTypes.number,
    supply_cost: PropTypes.string,
    profit_margin: PropTypes.string
  }),
  mode: PropTypes.oneOf(['add', 'edit']).isRequired
};

export default ProductDialog;