import { useState, useEffect, useCallback } from 'react';
import { 
  TableContainer,
  Table,
  TableHead,
  TableRow,
  TableCell,
  Typography, 
  Card, 
  CardContent,
  Button,
  Box,
  Chip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions
} from '@mui/material';
import Grid from '@mui/material/Grid2';
import { useNavigate } from 'react-router-dom';
import PortalLayout from '@/components/Layout/PortalLayout';
import { inventoryService } from '@/services/api/inventory';
import { useAuth } from '@/hooks/useAuth';
import Appointments from '../../client/pages/Appointments';
import EditInventoryItem from './EditInventoryItem';

const Inventory = () => {
  
  
  const [inventory, setInventory] = useState([])
  const [loading, setLoading] = useState(true);
  const [editingItem, setEditingItem] = useState(null);  

  const { user } = useAuth();
  const navigate = useNavigate();

  const fetchProducts = useCallback(async () => {
    if (!user) return;
  
    try {
      const data = await inventoryService.retrieveInventory();
      setInventory(data);
    } catch (error) {
      console.error('Error retrieving inventory:', error);
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    fetchProducts();
  }, [fetchProducts]);

  console.log(inventory[0]);
  
  return (
    <PortalLayout>
      <Typography variant="h4" component="h1" gutterBottom>
        Inventory
      </Typography>
  
      {editingItem ? (
        <EditInventoryItem
          item={editingItem}
          onSave={(updatedItem) => {
            setInventory((prev) =>
              prev.map((item) =>
                item.id === editingItem.id ? { ...item, ...updatedItem } : item
              )
            );
            setEditingItem(null);
          }}
          onCancel={() => setEditingItem(null)} 
        />
      ) : (
        <TableContainer>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell><strong>Name</strong></TableCell>
                <TableCell><strong>Description</strong></TableCell>
                <TableCell><strong>Price</strong></TableCell>
                <TableCell><strong>Quantity</strong></TableCell>
                <TableCell><strong>Actions</strong></TableCell>
              </TableRow>
            </TableHead>
            {inventory.map((product) => (
              <TableRow key={product.id}>
                <TableCell>{product.name}</TableCell>
                <TableCell>{product.description}</TableCell>
                <TableCell>{product.price}</TableCell>
                <TableCell>{product.quantity}</TableCell>
                <TableCell>
                  <Button variant="outlined" onClick={() => setEditingItem(product)}>
                    Edit
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </Table>
        </TableContainer>
      )}
    </PortalLayout>
  ); 
};

export default Inventory