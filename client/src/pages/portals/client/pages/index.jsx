// TODO: need to add search bar so user can easily search for services, practitioners, etc
// TODO: add calendar component
// TODO: add notifications component
import { Routes, Route, Link } from 'react-router-dom';
import Dashboard from './Dashboard';
import Profile from './Profile';
import Appointments from './Appointments';
import BookAppointment from './BookAppointment';
import Cart from './Cart';
import Checkout from './Checkout';
import ProductCatalog from './ProductCatalog';

export default function ClientPortal() {
  console.log('ClientPortal rendering, current path:', window.location.pathname);
  
  return (
    <div>
      
      {/* Navigation */}
      <nav style={{ marginBottom: '20px', display: 'flex', gap: '20px', padding: '10px' }}>
        <Link to="/client">Dashboard</Link>
        <Link to="/client/profile">Profile</Link>
        <Link to="/client/appointments">Appointments</Link>
        <Link to="/client/cart">Cart</Link>
        <Link to="/client/products">Products</Link>
        <Link to="/client/checkout">Checkout</Link>
      </nav>

      {/* Nested Routes */}
      <Routes>
        <Route path="/" element={<Dashboard />} />
        <Route path="/profile" element={<Profile />} />
        <Route path="/appointments" element={<Appointments />} />
        <Route path="appointments/book" element={<BookAppointment />} />
        <Route path="/cart" element={<Cart />} />
        <Route path="/products" element={<ProductCatalog />} />
        <Route path="/checkout" element={<Checkout />} />
      </Routes>
    </div>
  );
}