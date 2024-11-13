import { Routes, Route } from 'react-router-dom';
import Dashboard from './Dashboard';
import Users from './Users';
import Settings from './Settings';

export default function AdminPortal() {
  return (
    <Routes>
      <Route path="/" element={<Dashboard />} />
      <Route path="/users" element={<Users />} />
      <Route path="/settings" element={<Settings />} />
    </Routes>
  );
}