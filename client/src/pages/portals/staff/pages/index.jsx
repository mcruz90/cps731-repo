import { Routes, Route, Link } from 'react-router-dom';
import Dashboard from './Dashboard';
import Inventory from './Inventory';

// Ishaan
/*
  implement inventoryservice to:
    get items from database
    add/remove items from database (productID, name, description, quantity, price)
  
  Create component that displays products and their attributes

  

*/

export default function StaffPortal() {
  
  return (
    <div>
      <h1>Staff portal</h1>

      <nav>
        <Link to="inventory">Inventory</Link>
      </nav>

      <Routes>
        <Route path="/" element={<Inventory />} />
        <Route path="/inventory" element={<Inventory />} />
      </Routes>
    </div>

    
  );
}