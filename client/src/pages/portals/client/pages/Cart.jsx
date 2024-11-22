import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Box,
  Typography,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  IconButton,
  Button,
  TextField,
  Alert,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  DialogContentText,
} from '@mui/material';
import DeleteIcon from '@mui/icons-material/Delete';
import ShoppingCartCheckoutIcon from '@mui/icons-material/ShoppingCartCheckout';
import PortalLayout from '@/components/Layout/PortalLayout';
import { cartService } from '@/services/api/cart';

const Cart = () => {
  const [cartItems, setCartItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [successMessage, setSuccessMessage] = useState('');
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [itemToDelete, setItemToDelete] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    fetchCartItems();
    const unsubscribe = cartService.subscribeToCartChanges(() => fetchCartItems());
    return () => unsubscribe();
  }, []);

  const fetchCartItems = async () => {
    try {
      const data = await cartService.getCartItems();
      setCartItems(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleQuantityChange = async (cartItem, newQuantity) => {
    try {
      const quantity = Math.max(1, Math.min(99, Number(newQuantity)));
      if (quantity > cartItem.products.quantity) {
        throw new Error('Requested quantity exceeds available stock');
      }

      await cartService.updateCartItem(cartItem.id, quantity);
      await fetchCartItems();
      setSuccessMessage('Cart updated successfully');
      setTimeout(() => setSuccessMessage(''), 3000);
    } catch (err) {
      setError(err.message);
      setTimeout(() => setError(null), 3000);
    }
  };

  const handleDeleteClick = (item) => {
    setItemToDelete(item);
    setDeleteDialogOpen(true);
  };

  const handleDeleteConfirm = async () => {
    if (!itemToDelete) return;

    try {
      await cartService.removeFromCart(itemToDelete.id);
      await fetchCartItems();
      setSuccessMessage('Item removed from cart');
      setTimeout(() => setSuccessMessage(''), 3000);
    } catch (err) {
      setError(err.message);
      setTimeout(() => setError(null), 3000);
    } finally {
      setDeleteDialogOpen(false);
      setItemToDelete(null);
    }
  };

  const handleDeleteCancel = () => {
    setDeleteDialogOpen(false);
    setItemToDelete(null);
  };

  const calculateTotal = () => {
    return cartItems.reduce((sum, item) => {
      return sum + (item.quantity * item.products.price);
    }, 0);
  };

  if (loading) return <PortalLayout>Loading cart...</PortalLayout>;

  return (
    <PortalLayout>
      <Typography variant="h4" component="h1" gutterBottom>
        Shopping Cart
      </Typography>

      {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
      {successMessage && <Alert severity="success" sx={{ mb: 2 }}>{successMessage}</Alert>}

      {cartItems.length === 0 ? (
        <Paper sx={{ p: 3, textAlign: 'center' }}>
          <Typography variant="h6" gutterBottom>
            Your cart is empty
          </Typography>
          <Button 
            variant="contained" 
            onClick={() => navigate('/client/products')}
            sx={{ mt: 2 }}
          >
            Continue Shopping
          </Button>
        </Paper>
      ) : (
        <Box>
          <TableContainer component={Paper}>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Product</TableCell>
                  <TableCell align="right">Price</TableCell>
                  <TableCell align="right">Quantity</TableCell>
                  <TableCell align="right">Subtotal</TableCell>
                  <TableCell width={50}></TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {cartItems.map((item) => (
                  <TableRow key={item.id}>
                    <TableCell>{item.products.name}</TableCell>
                    <TableCell align="right">
                      ${Number(item.products.price).toFixed(2)}
                    </TableCell>
                    <TableCell align="right">
                      <TextField
                        type="number"
                        value={item.quantity}
                        onChange={(e) => handleQuantityChange(item, e.target.value)}
                        inputProps={{ 
                          min: 1, 
                          max: Math.min(99, item.products.quantity),
                          style: { textAlign: 'right' }
                        }}
                        size="small"
                        sx={{ width: 80 }}
                      />
                    </TableCell>
                    <TableCell align="right">
                      ${(item.quantity * item.products.price).toFixed(2)}
                    </TableCell>
                    <TableCell align="center">
                      <IconButton 
                        onClick={() => handleDeleteClick(item)}
                        color="error"
                        size="small"
                      >
                        <DeleteIcon />
                      </IconButton>
                    </TableCell>
                  </TableRow>
                ))}
                <TableRow>
                  <TableCell colSpan={2} />
                  <TableCell align="right">
                    <Typography variant="subtitle1" fontWeight="bold">
                      Total:
                    </Typography>
                  </TableCell>
                  <TableCell align="right">
                    <Typography variant="subtitle1" fontWeight="bold">
                      ${calculateTotal().toFixed(2)}
                    </Typography>
                  </TableCell>
                  <TableCell />
                </TableRow>
              </TableBody>
            </Table>
          </TableContainer>

          <Box sx={{ 
            mt: 3, 
            display: 'flex', 
            justifyContent: 'space-between', 
            alignItems: 'center' 
          }}>
            <Button
              variant="outlined"
              onClick={() => navigate('/client/products')}
            >
              Continue Shopping
            </Button>
            
            <Button
              variant="contained"
              color="primary"
              size="large"
              startIcon={<ShoppingCartCheckoutIcon />}
              onClick={() => navigate('/client/checkout')}
            >
              Proceed to Checkout
            </Button>
          </Box>
        </Box>
      )}

      <Dialog
        open={deleteDialogOpen}
        onClose={handleDeleteCancel}
        aria-labelledby="delete-dialog-title"
        aria-describedby="delete-dialog-description"
      >
        <DialogTitle id="delete-dialog-title">
          Remove Item from Cart
        </DialogTitle>
        <DialogContent>
          <DialogContentText id="delete-dialog-description">
            Are you sure you want to remove &quot;{itemToDelete?.products.name}&quot; from your cart?
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleDeleteCancel} color="primary">
            Cancel
          </Button>
          <Button onClick={handleDeleteConfirm} color="error" autoFocus>
            Remove
          </Button>
        </DialogActions>
      </Dialog>
    </PortalLayout>
  );
};

export default Cart;