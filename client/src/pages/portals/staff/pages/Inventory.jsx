import { useState, useEffect, useCallback } from "react";
import {
  TableContainer,
  Table,
  TableHead,
  TableRow,
  TableCell,
  Typography,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Box,
} from "@mui/material";
import Grid from "@mui/material/Grid2";
import { useNavigate } from "react-router-dom";
import PortalLayout from "@/components/Layout/PortalLayout";
import { inventoryService } from "@/services/api/inventory";
import { useAuth } from "@/hooks/useAuth";
import Appointments from "../../client/pages/Appointments";
import EditInventoryItem from "./EditInventoryItem";

const Inventory = () => {
  const [inventory, setInventory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editingItem, setEditingItem] = useState(null);
  const [addDialogOpen, setAddDialogOpen] = useState(false);

  const [newItem, setNewItem] = useState({
    name: "",
    description: "",
    price: "",
    quantity: "",
  });

  const { user } = useAuth();
  const navigate = useNavigate();

  const fetchProducts = useCallback(async () => {
    if (!user) return;

    try {
      const data = await inventoryService.retrieveInventory();
      setInventory(data);
    } catch (error) {
      console.error("Error retrieving inventory:", error);
    } finally {
      setLoading(false);
    }
  }, [user]);

  const handleAddItem = async () => {
    try {
      const addedItem = await inventoryService.addInventoryItem(newItem);
      setInventory((prev) => [...prev, addedItem]);
      setAddDialogOpen(false);
      setNewItem({ name: "", description: "", price: "", quantity: "" });
    } catch (error) {
      console.error("Error adding inventory item:", error);
    }
  };


  useEffect(() => {
    fetchProducts();
  }, [fetchProducts]);

  console.log(inventory[0]);

  return (
    <PortalLayout>
      <Typography variant='h4' component='h1' gutterBottom>
        Inventory
      </Typography>

      <Button variant="contained" onClick={() => setAddDialogOpen(true)}>Add New Item</Button>



      <Dialog open={addDialogOpen} onClose={() => setAddDialogOpen(false)}>
        <DialogTitle>Add New Inventory Item</DialogTitle>
        <DialogContent>
          <Box display="flex" flexDirection="column" gap={2}>
            <TextField
              label="Name"
              value={newItem.name}
              onChange={(e) => setNewItem({ ...newItem, name: e.target.value })}
            />
            <TextField
              label="Description"
              value={newItem.description}
              onChange={(e) =>
                setNewItem({ ...newItem, description: e.target.value })
              }
            />
            <TextField
              label="Price"
              type="number"
              value={newItem.price}
              onChange={(e) =>
                setNewItem({ ...newItem, price: e.target.value })
              }
            />
            <TextField
              label="Quantity"
              type="number"
              value={newItem.quantity}
              onChange={(e) =>
                setNewItem({ ...newItem, quantity: e.target.value })
              }
            />
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setAddDialogOpen(false)}>Cancel</Button>
          <Button variant="contained" onClick={handleAddItem}>
            Add Item
          </Button>
        </DialogActions>
      </Dialog>

      

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
                <TableCell>
                  <strong>Name</strong>
                </TableCell>
                <TableCell>
                  <strong>Description</strong>
                </TableCell>
                <TableCell>
                  <strong>Price</strong>
                </TableCell>
                <TableCell>
                  <strong>Quantity</strong>
                </TableCell>
                <TableCell>
                  <strong>Actions</strong>
                </TableCell>
              </TableRow>
            </TableHead>
            {inventory.map((product) => (
              <TableRow key={product.id}>
                <TableCell>{product.name}</TableCell>
                <TableCell>{product.description}</TableCell>
                <TableCell>{product.price}</TableCell>
                <TableCell>{product.quantity}</TableCell>
                <TableCell>
                  <Button
                    variant='outlined'
                    onClick={() => setEditingItem(product)}>
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

export default Inventory;
