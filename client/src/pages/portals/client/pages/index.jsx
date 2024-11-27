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

export default function ClientPortal() {
  const navLinks = [
    { to: '/client', label: 'Dashboard' },
    { to: '/client/profile', label: 'Profile' },
    { to: '/client/appointments', label: 'Appointments' },
    { to: '/client/cart', label: 'Cart' },
    { to: '/client/products', label: 'Products' },
    { to: '/client/orders', label: 'Orders' }
  ];

  return (
    <>
      <PortalNav links={navLinks} />
      
      <Routes>
        <Route path="/" element={<Dashboard />} />
        <Route path="/profile" element={<Profile />} />
        <Route path="/appointments" element={<Appointments />} />
        <Route path="appointments/book" element={<BookAppointment />} />
        <Route path="/cart" element={<Cart />} />
        <Route path="/products" element={<ProductCatalog />} />
        <Route path="/checkout" element={<Checkout />} />
        <Route path="/orders" element={<Orders />} />
        <Route path="/orders/confirmation" element={<OrderConfirmation />} />
      </Routes>
    </>
  );
}