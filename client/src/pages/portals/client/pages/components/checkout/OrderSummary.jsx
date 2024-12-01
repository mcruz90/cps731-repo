import {
  Box,
  Typography,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Grid,
  Alert,
  List,
  ListItem,
  ListItemText,
} from '@mui/material';
import PropTypes from 'prop-types';

const OrderSummary = ({ cartItems = [], shippingData = {}, paymentData = {} }) => {
  const getMissingInformation = () => {
    const missing = [];

    if (!cartItems?.length) {
      missing.push('Cart items are missing');
    }

    if (!shippingData || !Object.keys(shippingData).length) {
      missing.push('Shipping information is missing');
    }

    if (!paymentData || !Object.keys(paymentData).length) {
      missing.push('Payment information is missing');
    }

    return missing;
  };

  const calculateSubtotal = () => {
    return cartItems.reduce((sum, item) => {
      const price = Number(item?.products?.price || 0);
      const quantity = Number(item?.quantity || 0);
      return sum + (price * quantity);
    }, 0);
  };

  // HARDCODE FOR NOW. NEED TO SET UP TAX STUFF.
  const calculateTax = () => {
    return calculateSubtotal() * 0.13;
  };

  const calculateTotal = () => {
    return calculateSubtotal() + calculateTax();
  };

  const missingInfo = getMissingInformation();
  if (missingInfo.length > 0) {
    return (
      <Alert severity="error">
        Missing required information:
        <List dense>
          {missingInfo.map((info, index) => (
            <ListItem key={index}>
              <ListItemText primary={`• ${info}`} />
            </ListItem>
          ))}
        </List>
      </Alert>
    );
  }

  return (
    <Box>
      <Typography variant="h6" gutterBottom>
        Order Review
      </Typography>

      {/* Items Summary */}
      <TableContainer component={Paper} sx={{ mb: 3 }}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Product</TableCell>
              <TableCell align="right">Quantity</TableCell>
              <TableCell align="right">Price</TableCell>
              <TableCell align="right">Subtotal</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {cartItems.map((item) => (
              <TableRow key={item?.id}>
                <TableCell>{item?.products?.name || 'Unknown Product'}</TableCell>
                <TableCell align="right">{item?.quantity || 0}</TableCell>
                <TableCell align="right">
                  ${Number(item?.products?.price || 0).toFixed(2)}
                </TableCell>
                <TableCell align="right">
                  ${((item?.quantity || 0) * Number(item?.products?.price || 0)).toFixed(2)}
                </TableCell>
              </TableRow>
            ))}
            <TableRow>
              <TableCell colSpan={3} align="right">Subtotal</TableCell>
              <TableCell align="right">${calculateSubtotal().toFixed(2)}</TableCell>
            </TableRow>
            <TableRow>
              <TableCell colSpan={3} align="right">Tax (13%)</TableCell>
              <TableCell align="right">${calculateTax().toFixed(2)}</TableCell>
            </TableRow>
            <TableRow>
              <TableCell colSpan={3} align="right">
                <Typography variant="subtitle1" fontWeight="bold">Total</Typography>
              </TableCell>
              <TableCell align="right">
                <Typography variant="subtitle1" fontWeight="bold">
                  ${calculateTotal().toFixed(2)}
                </Typography>
              </TableCell>
            </TableRow>
          </TableBody>
        </Table>
      </TableContainer>

      <Grid container spacing={3}>
        {/* Shipping Information */}
        <Grid item xs={12} md={6}>
          <Paper sx={{ p: 2 }}>
            <Typography variant="h6" gutterBottom>
              Shipping Address
            </Typography>
            <Typography>
              {shippingData.firstName} {shippingData.lastName}
            </Typography>
            <Typography color="text.secondary">
              {shippingData.address}<br />
              {shippingData.city}, {shippingData.province} {shippingData.postalCode}<br />
              Phone: {shippingData.phone}
            </Typography>
          </Paper>
        </Grid>

        {/* Payment Information */}
        <Grid item xs={12} md={6}>
          <Paper sx={{ p: 2 }}>
            <Typography variant="h6" gutterBottom>
              Payment Method
            </Typography>
            <Typography>
              {paymentData.cardName}
            </Typography>
            <Typography color="text.secondary">
              Card ending in {paymentData.cardNumber?.slice(-4)}<br />
              Expires: {paymentData.expiryDate}
            </Typography>
          </Paper>
        </Grid>
      </Grid>
    </Box>
  );
};

OrderSummary.propTypes = {
  cartItems: PropTypes.array.isRequired,
  shippingData: PropTypes.object.isRequired,
  paymentData: PropTypes.object.isRequired
};

export default OrderSummary;
