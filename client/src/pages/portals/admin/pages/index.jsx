import { Routes, Route, Link } from 'react-router-dom';
import Dashboard from './Dashboard';
import AddUsers from './AddUsers';
import Profile from './Profile';
import Users from './Users';
import Products from './Products';
import Reports from './Reports';

const AdminPortal = () => {
  return (
    <>
      <nav style={{ marginBottom: '20px' }}>
        <Link to="" style={{ marginRight: '20px' }}>Dashboard</Link>
        <Link to="products" style={{ marginRight: '20px' }}>Products</Link>
        <Link to="profile" style={{ marginRight: '20px' }}>Profile</Link>
        <Link to="users" style={{ marginRight: '20px' }}>Users</Link>
        <Link to="add-users" style={{ marginRight: '20px' }}>Add Users</Link>
      </nav>

      <Routes>
        <Route index element={<Dashboard />} />
        <Route path="add-users" element={<AddUsers />} />
        <Route path="profile" element={<Profile />} />
        <Route path="users" element={<Users />} />
        <Route path="products" element={<Products />} />
        <Route path="reports" element={<Reports />} />
      </Routes>
    </>
  );
};

export default AdminPortal;