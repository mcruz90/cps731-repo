import { Routes, Route } from 'react-router-dom';
import PortalNav from '@/components/Layout/PortalNav';
import Dashboard from './Dashboard';
import AddUsers from './AddUsers';
import Profile from './Profile';
import Users from './Users';
import Products from './Products';
import Reports from './Reports';
import TestUserCreator from './components/TestUserCreator';

const AdminPortal = () => {
  const navLinks = [
    { to: '/admin', label: 'Dashboard' },
    { to: '/admin/products', label: 'Products' },
    { to: '/admin/profile', label: 'Profile' },
    { to: '/admin/users', label: 'Users' },
    // { to: '/admin/add-users', label: 'Add Users' }, disable for now... send-email edge functions not working properly
    { to: '/admin/test-user-creator', label: 'Add Users' },
  ];

  return (
    <>
      <PortalNav links={navLinks} />
      
      <Routes>
        <Route index element={<Dashboard />} />
        <Route path="add-users" element={<AddUsers />} />
        <Route path="profile" element={<Profile />} />
        <Route path="users" element={<Users />} />
        <Route path="products" element={<Products />} />
        <Route path="reports" element={<Reports />} />
        <Route path="test-user-creator" element={<TestUserCreator />} />
      </Routes>
    </>
  );
};

export default AdminPortal;