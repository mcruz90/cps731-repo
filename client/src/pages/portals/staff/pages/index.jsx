import { Routes, Route } from 'react-router-dom';
import Dashboard from './Dashboard';
import Inventory from './Inventory';
import PortalNav from '@/components/Layout/PortalNav';
// Ishaan
/*
  implement inventoryservice to:
    get items from database
    add/remove items from database (productID, name, description, quantity, price)
  
  Create component that displays products and their attributes

  

*/

export default function StaffPortal() {
  
  return (
    <>

      <PortalNav links={[
        { to: '/staff/dashboard', label: 'Dashboard' },
        { to: '/staff/inventory', label: 'Inventory' }
      ]} />

      <Routes>
        <Route path="/" element={<Dashboard />} />
        <Route path="/inventory" element={<Inventory />} />
        <Route path="/dashboard" element={<Dashboard />} />
      </Routes>
    </>

    
  );
}