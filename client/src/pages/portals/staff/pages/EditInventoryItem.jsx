import { useState } from 'react';
import PropTypes from 'prop-types';
import { TextField, Button, Table, TableBody, TableCell, TableContainer, TableRow, Paper, CircularProgress, Typography } from '@mui/material';
import { inventoryService } from '@/services/api/inventory';

const EditInventoryItem = ({ item, onSave, onCancel, showSnackbar }) => {
  const [formData, setFormData] = useState({
    name: item.name || '',
    description: item.description || '',
    price: item.price || '',
    quantity: item.quantity || '',
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSave = async () => {
    setLoading(true);
    setError(null);
    try {
      await inventoryService.updateItem(item.id, formData);
      onSave(formData);
      showSnackbar('Inventory item updated successfully!', 'success');
    } catch (error) {
      console.error('Error updating item:', error);
      setError('Failed to update item. Please try again.');
      showSnackbar('Failed to update item. Please try again.', 'error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <TableContainer component={Paper}>
      <Table>
        <TableBody>
          <TableRow>
            <TableCell>
              <TextField
                label="Name"
                name="name"
                value={formData.name}
                onChange={handleChange}
                fullWidth
                disabled={loading}
              />
            </TableCell>
          </TableRow>
          <TableRow>
            <TableCell>
                <TextField
                  label="Price"
                  name="price"
                  type="number"
                  value={formData.price}
                  fullWidth
                  disabled
                />
              </TableCell>
          </TableRow>
          <TableRow>
            <TableCell>
              <TextField
                label="Description"
                name="description"
                value={formData.description}
                onChange={handleChange}
                fullWidth
                multiline
                rows={3}
                disabled={loading}
              />
            </TableCell>
          </TableRow>
          <TableRow>
            <TableCell>
              <TextField
                label="Quantity"
                name="quantity"
                type="number"
                value={formData.quantity}
                onChange={(e) => {
                  const value = Math.max(0, parseInt(e.target.value, 10) || 0);
                  setFormData({ ...formData, quantity: value });
                }}
                fullWidth
                disabled={loading}
                inputProps={{ min: 0, step: '1' }}
              />
            </TableCell>
          </TableRow>
          {error && (
            <TableRow>
              <TableCell>
                <Typography color="error">{error}</Typography>
              </TableCell>
            </TableRow>
          )}
          <TableRow>
            <TableCell>
              <Button
                variant="contained"
                color="primary"
                onClick={handleSave}
                style={{ marginRight: '8px' }}
                disabled={loading}
              >
                {loading ? <CircularProgress size={24} /> : 'Save'}
              </Button>
              <Button
                variant="outlined"
                color="secondary"
                onClick={onCancel}
                disabled={loading}
              >
                Cancel
              </Button>
            </TableCell>
          </TableRow>
        </TableBody>
      </Table>
    </TableContainer>
  );
};

EditInventoryItem.propTypes = {
  item: PropTypes.object.isRequired,
  onSave: PropTypes.func.isRequired,
  onCancel: PropTypes.func.isRequired,
  showSnackbar: PropTypes.func.isRequired,
};

export default EditInventoryItem;
