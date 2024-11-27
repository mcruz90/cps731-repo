import { useState, useEffect, useCallback } from 'react';
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
  TableBody,
  Snackbar,
  Alert
} from '@mui/material';
import PortalLayout from '@/components/Layout/PortalLayout';
import { inventoryService } from '@/services/api/inventory';
import { useAuth } from '@/hooks/useAuth';
import EditInventoryItem from './EditInventoryItem';

const Inventory = () => {
  const [inventory, setInventory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editingItem, setEditingItem] = useState(null);
  
  // Snackbar state
  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState('');
  const [snackbarSeverity, setSnackbarSeverity] = useState('success');

  const { user } = useAuth();

  const fetchProducts = useCallback(async () => {
    if (!user) return;
  
    try {
      const data = await inventoryService.retrieveInventory();
      setInventory(data);
    } catch (error) {
      console.error('Error retrieving inventory:', error);
      // Show error snackbar if fetching inventory fails
      showSnackbar('Failed to retrieve inventory.', 'error');
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    fetchProducts();
  }, [fetchProducts]);

  console.log(inventory[0]);
  
  const handleSave = (updatedItem) => {
    setInventory((prev) =>
      prev.map((item) =>
        item.id === editingItem.id ? { ...item, ...updatedItem } : item
      )
    );
    setEditingItem(null);
    // Show success snackbar
    showSnackbar('Inventory item updated successfully!', 'success');
  };

  const handleCancel = () => {
    setEditingItem(null);
  };

  // Function to show snackbar with message and severity
  const showSnackbar = (message, severity = 'success') => {
    setSnackbarMessage(message);
    setSnackbarSeverity(severity);
    setSnackbarOpen(true);
  };

  // Function to handle snackbar close
  const handleSnackbarClose = (event, reason) => {
    if (reason === 'clickaway') {
      return;
    }
    setSnackbarOpen(false);
  };

  return (
    loading ? (
      <CircularProgress />
    ) : (
      <PortalLayout>
        <Typography variant="h4" component="h1" gutterBottom>
          Inventory
        </Typography>
    
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
                    <Button variant="outlined" onClick={() => setEditingItem(product)}>
                      Edit
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>

        {/* Edit Dialog */}
        <Dialog
          open={Boolean(editingItem)}
          onClose={handleCancel}
          fullWidth
          maxWidth="sm"
          aria-labelledby="edit-inventory-item-dialog"
        >
          <DialogTitle id="edit-inventory-item-dialog">Edit Inventory Item</DialogTitle>
          <DialogContent>
            {editingItem && (
              <EditInventoryItem
                item={editingItem}
                onSave={handleSave}
                onCancel={handleCancel}
                showSnackbar={showSnackbar}
              />
            )}
          </DialogContent>
        </Dialog>

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
    )
  ); 
};

export default Inventory;