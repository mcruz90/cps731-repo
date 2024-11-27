import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
 Box,
 Paper,
 Typography,
 Button,
 Divider,
 Grid,
 Alert,
 CircularProgress
} from '@mui/material';
import CheckCircleOutlineIcon from '@mui/icons-material/CheckCircleOutline';
import PortalLayout from '@/components/Layout/PortalLayout';
import { orderService } from '@/services/api/order';

const OrderConfirmation = () => {
 const [order, setOrder] = useState(null);
 const [loading, setLoading] = useState(true);
 const [error, setError] = useState(null);
 const navigate = useNavigate();
 
 // fetches the latest order from the database to display confirmation message
 useEffect(() => {
   const fetchLatestOrder = async () => {
     try {
       const orders = await orderService.getOrders();
       if (orders && orders.length > 0) {
         setOrder(orders[0]); 
       }
     } catch (err) {
       setError('Failed to load order details');
       console.error(err);
     } finally {
       setLoading(false);
     }
   };
   fetchLatestOrder();
 }, []);
  if (loading) {
   return (
     <PortalLayout>
       <Box display="flex" justifyContent="center" alignItems="center" minHeight="200px">
         <CircularProgress />
       </Box>
     </PortalLayout>
   );
 }
  if (error) {
   return (
     <PortalLayout>
       <Alert severity="error">{error}</Alert>
     </PortalLayout>
   );
 }

  return (
   <PortalLayout>
     <Paper sx={{ p: 4, maxWidth: 800, mx: 'auto' }}>
       <Box display="flex" flexDirection="column" alignItems="center" mb={4}>
         <CheckCircleOutlineIcon color="success" sx={{ fontSize: 60, mb: 2 }} />
         <Typography variant="h4" gutterBottom>
           Order Confirmed!
         </Typography>
         <Typography variant="subtitle1" color="text.secondary" align="center">
           Thank you for your order. We&apos;ll send you a confirmation email shortly.
         </Typography>
       </Box>
        {order && (
         <>
           <Divider sx={{ my: 3 }} />
           
           <Typography variant="h6" gutterBottom>
             Order Details
           </Typography>
           
           <Grid container spacing={2}>
             <Grid item xs={12} sm={6}>
               <Typography variant="subtitle2">Order Number</Typography>
               <Typography color="text.secondary" gutterBottom>
                 #{order.id}
               </Typography>
             </Grid>
             
             <Grid item xs={12} sm={6}>
               <Typography variant="subtitle2">Total Amount</Typography>
               <Typography color="text.secondary" gutterBottom>
                 ${order.total_amount.toFixed(2)}
               </Typography>
             </Grid>
              <Grid item xs={12}>
               <Typography variant="subtitle2">Shipping Address</Typography>
               <Typography color="text.secondary">
                 {order.shipping_address.firstName} {order.shipping_address.lastName}<br />
                 {order.shipping_address.address}<br />
                 {order.shipping_address.city}, {order.shipping_address.province} {order.shipping_address.postalCode}
               </Typography>
             </Grid>
           </Grid>
            <Box mt={4}>
             <Typography variant="h6" gutterBottom>
               Order Items
             </Typography>
             {order.order_items?.map((item) => (
               <Box key={item.id} py={1}>
                 <Typography>
                   {item.products.name} x {item.quantity}
                 </Typography>
                 <Typography color="text.secondary">
                   ${(item.price * item.quantity).toFixed(2)}
                 </Typography>
               </Box>
             ))}
           </Box>
         </>
       )}
        <Box mt={4} display="flex" justifyContent="space-between">
         <Button
           variant="outlined"
           onClick={() => navigate('/client/orders')}
         >
           View All Orders
         </Button>
         <Button
           variant="contained"
           onClick={() => navigate('/client/products')}
         >
           Continue Shopping
         </Button>
       </Box>
     </Paper>
   </PortalLayout>
 );
};
export default OrderConfirmation;