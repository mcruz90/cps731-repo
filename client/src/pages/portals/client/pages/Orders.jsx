import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
 Box,
 Paper,
 Typography,
 Table,
 TableBody,
 TableCell,
 TableContainer,
 TableHead,
 TableRow,
 Chip,
 IconButton,
 Alert,
 CircularProgress
} from '@mui/material';
import VisibilityIcon from '@mui/icons-material/Visibility';
import PortalLayout from '@/components/Layout/PortalLayout';
import { orderService } from '@/services/api/order';
import { format } from 'date-fns';

const getStatusColor = (status) => {
 switch (status.toLowerCase()) {
   case 'processing':
     return 'warning';
   case 'paid':
     return 'success';
   case 'shipped':
     return 'info';
   case 'delivered':
     return 'success';
   case 'cancelled':
     return 'error';
   default:
     return 'default';
 }
};

const Orders = () => {
 const [orders, setOrders] = useState([]);
 const [loading, setLoading] = useState(true);
 const [error, setError] = useState(null);
 const navigate = useNavigate();
  useEffect(() => {
   const fetchOrders = async () => {
     try {
       const data = await orderService.getOrders();
       setOrders(data);
     } catch (err) {
       setError('Failed to load orders');
       console.error(err);
     } finally {
       setLoading(false);
     }
   };
    fetchOrders();
 }, []);
  const handleViewOrder = (orderId) => {
   navigate(`/client/orders/${orderId}`);
 };
  if (loading) {
   return (
     <PortalLayout>
       <Box display="flex" justifyContent="center" alignItems="center" minHeight="200px">
         <CircularProgress />
       </Box>
     </PortalLayout>
   );
 }
  return (
   <PortalLayout>
     <Typography variant="h4" gutterBottom>
       My Orders
     </Typography>
      {error && (
       <Alert severity="error" sx={{ mb: 2 }}>
         {error}
       </Alert>
     )}
      {orders.length === 0 ? (
       <Paper sx={{ p: 3, textAlign: 'center' }}>
         <Typography color="text.secondary">
           You haven&apos;t placed any orders yet.
         </Typography>
       </Paper>
     ) : (
       <TableContainer component={Paper}>
         <Table>
           <TableHead>
             <TableRow>
               <TableCell>Order #</TableCell>
               <TableCell>Date</TableCell>
               <TableCell>Total</TableCell>
               <TableCell>Status</TableCell>
               <TableCell>Items</TableCell>
               <TableCell align="right">Actions</TableCell>
             </TableRow>
           </TableHead>
           <TableBody>
             {orders.map((order) => (
               <TableRow key={order.id}>
                 <TableCell>#{order.id}</TableCell>
                 <TableCell>
                   {format(new Date(order.created_at), 'MMM dd, yyyy')}
                 </TableCell>
                 <TableCell>${order.total_amount.toFixed(2)}</TableCell>
                 <TableCell>
                   <Chip 
                     label={order.status}
                     color={getStatusColor(order.status)}
                     size="small"
                   />
                 </TableCell>
                 <TableCell>
                   {order.order_items?.length || 0} items
                 </TableCell>
                 <TableCell align="right">
                   <IconButton
                     onClick={() => handleViewOrder(order.id)}
                     color="primary"
                     size="small"
                   >
                     <VisibilityIcon />
                   </IconButton>
                 </TableCell>
               </TableRow>
             ))}
           </TableBody>
         </Table>
       </TableContainer>
     )}
   </PortalLayout>
 );
};
export default Orders;