import { Routes, Route } from 'react-router-dom';
import PortalNav from '@/components/Layout/PortalNav';
import Dashboard from './Dashboard';
import Profile from './Profile';
import Appointments from './Appointments';
import BookAppointment from './BookAppointment';
import Cart from './Cart';
import Checkout from './Checkout';
import ProductCatalog from './ProductCatalog';
import Orders from './Orders';
import OrderConfirmation from './components/OrderConfirmation';
import Inbox from './Inbox';
import MessageDetails from './components/messaging/MessageDetails';
import ComposeMessage from './components/messaging/ComposeMessage';

export default function ClientPortal() {
  const navLinks = [
    { to: '/client', label: 'Dashboard' },
    { to: '/client/profile', label: 'Profile' },
    { to: '/client/appointments', label: 'Appointments' },
    { to: '/client/cart', label: 'Cart' },
    { to: '/client/products', label: 'Products' },
    { to: '/client/orders', label: 'Orders' },
    { to: '/client/inbox', label: 'Inbox' }
  ];

  return (
    <>
      <PortalNav links={navLinks} />
      
      <Routes>
        <Route path="/" element={<Dashboard />} />
        <Route path="/profile" element={<Profile />} />

        {/* Appointments */}
        <Route path="/appointments" element={<Appointments />} />
        <Route path="appointments/book" element={<BookAppointment />} />

        {/* Product ordering related routes */}
        <Route path="/cart" element={<Cart />} />
        <Route path="/products" element={<ProductCatalog />} />
        <Route path="/checkout" element={<Checkout />} />
        <Route path="/orders" element={<Orders />} />
        
        {/* Need to implement :orderId here */}
        
        <Route path="/orders/confirmation" element={<OrderConfirmation />} />

        {/* Messaging-related routes */}
        <Route path="/inbox" element={<Inbox />} />
        <Route path="/inbox/:messageId" element={<MessageDetails />} />
        <Route path="/inbox/compose" element={<ComposeMessage />} />
      </Routes>
    </>
  );
}