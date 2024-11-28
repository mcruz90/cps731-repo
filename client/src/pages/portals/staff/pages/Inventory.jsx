import { useState, useEffect, useCallback } from "react";
import {
  TableContainer,
  Table,
  TableHead,
  TableRow,
  TableCell,
  Typography, 
  Button,
  CircularProgress,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TableBody,
  Snackbar,
  Alert,
  Box,
  TextField
} from '@mui/material';
import PortalLayout from '@/components/Layout/PortalLayout';
import { inventoryService } from '@/services/api/inventory';
import { useAuth } from '@/hooks/useAuth';
import EditInventoryItem from './EditInventoryItem';

const Inventory = () => {
  const [inventory, setInventory] = useState([]);
  const [loading, setLoading] = useState(true);

  // Snackbar state
  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState('');
  const [snackbarSeverity, setSnackbarSeverity] = useState('success');

  const [editingItem, setEditingItem] = useState(null);
  const [addDialogOpen, setAddDialogOpen] = useState(false);

  const [newItem, setNewItem] = useState({
    name: "",
    description: "",
    price: "",
    quantity: "",
  });

  const { user } = useAuth();

  const fetchProducts = useCallback(async () => {
    if (!user) return;

    try {
      const data = await inventoryService.retrieveInventory();
      setInventory(data);
    } catch (error) {
      console.error("Error retrieving inventory:", error);
      // Show error snackbar if fetching inventory fails
      showSnackbar('Failed to retrieve inventory.', 'error');
    } finally {
      setLoading(false);
    }
  }, [user]);

  const handleAddItem = async () => {
    try {
      const addedItem = await inventoryService.addInventoryItem(newItem);
      setInventory((prev) => [...prev, addedItem]);
      setAddDialogOpen(false);
      setNewItem({ name: "", description: "", price: "", quantity: "" });
      showSnackbar('Item added successfully.', 'success');
    } catch (error) {
      console.error("Error adding inventory item:", error);
      showSnackbar('Failed to add item.', 'error');
    }
  };

  // Define handleSave and handleCancel
  const handleSave = async (updatedItem) => {
    try {
      const savedItem = await inventoryService.updateInventoryItem(updatedItem);
      setInventory((prev) =>
        prev.map((item) =>
          item.id === savedItem.id ? savedItem : item
        )
      );
      setEditingItem(null);
      showSnackbar('Item updated successfully.', 'success');
    } catch (error) {
      console.error("Error updating inventory item:", error);
      showSnackbar('Failed to update item.', 'error');
    }
  };

  const handleCancel = () => {
    setEditingItem(null);
  };

  const showSnackbar = (message, severity) => {
    setSnackbarMessage(message);
    setSnackbarSeverity(severity);
    setSnackbarOpen(true);
  };

  const handleSnackbarClose = () => {
    setSnackbarOpen(false);
  };

  useEffect(() => {
    fetchProducts();
  }, [fetchProducts]);

  if (loading) {
    return (
      <PortalLayout>
        <Box display="flex" justifyContent="center" alignItems="center" height="100%">
          <CircularProgress />
        </Box>
      </PortalLayout>
    );
  }

  return (
    <PortalLayout>
      <Typography variant='h4' component='h1' gutterBottom>
        Inventory
      </Typography>

      <Button variant="contained" onClick={() => setAddDialogOpen(true)}>Add New Item</Button>

      <Dialog open={addDialogOpen} onClose={() => setAddDialogOpen(false)}>
        <DialogTitle>Add New Inventory Item</DialogTitle>
        <DialogContent>
          <Box display="flex" flexDirection="column" gap={2} mt={1}>
            <TextField
              label="Name"
              value={newItem.name}
              onChange={(e) => setNewItem({ ...newItem, name: e.target.value })}
              fullWidth
            />
            <TextField
              label="Description"
              value={newItem.description}
              onChange={(e) =>
                setNewItem({ ...newItem, description: e.target.value })
              }
              fullWidth
            />
            <TextField
              label="Price"
              type="number"
              value={newItem.price}
              onChange={(e) =>
                setNewItem({ ...newItem, price: e.target.value })
              }
              fullWidth
            />
            <TextField
              label="Quantity"
              type="number"
              value={newItem.quantity}
              onChange={(e) =>
                setNewItem({ ...newItem, quantity: e.target.value })
              }
              fullWidth
            />
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setAddDialogOpen(false)}>Cancel</Button>
          <Button variant="contained" onClick={handleAddItem}>
            Add Item
          </Button>
        </DialogActions>
      </Dialog>

      {editingItem && (
        <Dialog
          open={Boolean(editingItem)}
          onClose={handleCancel}
          fullWidth
          maxWidth="sm"
          aria-labelledby="edit-inventory-item-dialog"
        >
          <DialogTitle id="edit-inventory-item-dialog">Edit Inventory Item</DialogTitle>
          <DialogContent>
            <EditInventoryItem
              item={editingItem}
              onSave={handleSave}
              onCancel={handleCancel}
              showSnackbar={showSnackbar}
            />
          </DialogContent>
        </Dialog>
      )}

      <TableContainer>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell><strong>Name</strong></TableCell>
              <TableCell><strong>Description</strong></TableCell>
              <TableCell><strong>Price</strong></TableCell>
              <TableCell><strong>Quantity</strong></TableCell>
              <TableCell><strong>Actions</strong></TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {inventory.map((product) => (
              <TableRow key={product.id}>
                <TableCell>{product.name}</TableCell>
                <TableCell>{product.description}</TableCell>
                <TableCell>${Number(product.price).toFixed(2)}</TableCell>
                <TableCell>{product.quantity}</TableCell>
                <TableCell>
                  <Button
                    variant='outlined'
                    onClick={() => setEditingItem(product)}
                  >
                    Edit
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>

      {/* Snackbar for success and error messages */}
      <Snackbar
        open={snackbarOpen}
        autoHideDuration={6000}
        onClose={handleSnackbarClose}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
      >
        <Alert onClose={handleSnackbarClose} severity={snackbarSeverity} sx={{ width: '100%' }}>
          {snackbarMessage}
        </Alert>
      </Snackbar>

    </PortalLayout>
  );
};

export default Inventory;
