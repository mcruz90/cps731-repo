import { useState, useEffect } from 'react';
import { 
  Typography,
  Box,
  CircularProgress,
  Alert,
  Paper,
  TableContainer,
  Table,
  TableHead,
  TableRow,
  TableCell,
  TableBody,
  TablePagination,
  IconButton,
  Button,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  TextField as SearchField,
  InputAdornment,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
} from '@mui/material';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import AddIcon from '@mui/icons-material/Add';
import { adminService } from '@/services/api/admin';
import ProductDialog from './components/ProductDialog';
import SearchIcon from '@mui/icons-material/Search';
import SortIcon from '@mui/icons-material/Sort';

const Products = () => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [addDialogOpen, setAddDialogOpen] = useState(false);
  const [filters, setFilters] = useState({
    search: '',
    sortBy: 'name',
    sortOrder: 'asc'
  });
  const [filteredProducts, setFilteredProducts] = useState([]);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [productToDelete, setProductToDelete] = useState(null);

  useEffect(() => {
    fetchProducts();
  }, []);

  useEffect(() => {
    let result = [...products];

    if (filters.search) {
      const searchTerm = filters.search.toLowerCase();
      result = result.filter(product => 
        product.name.toLowerCase().includes(searchTerm) ||
        product.description.toLowerCase().includes(searchTerm)
      );
    }

    result.sort((a, b) => {
      let comparison = 0;
      switch (filters.sortBy) {
        case 'name':
          comparison = a.name.localeCompare(b.name);
          break;
        case 'price':
          comparison = a.price - b.price;
          break;
        case 'quantity':
          comparison = a.quantity - b.quantity;
          break;
        case 'profit':
          comparison = Number(a.profit_margin) - Number(b.profit_margin);
          break;
        default:
          comparison = 0;
      }
      return filters.sortOrder === 'asc' ? comparison : -comparison;
    });

    setFilteredProducts(result);
    setPage(0);
  }, [products, filters]);

  const fetchProducts = async () => {
    try {
      const data = await adminService.getAllProducts();
      setProducts(data);
      setError(null);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleEditClick = (product) => {
    setSelectedProduct(product);
    setEditDialogOpen(true);
  };

  const handleAddClick = () => {
    setAddDialogOpen(true);
  };

  const handleSaveEdit = async (editedData) => {
    try {
      await adminService.updateProduct(selectedProduct.id, editedData);
      await fetchProducts();
      setEditDialogOpen(false);
      setSelectedProduct(null);
    } catch (err) {
      setError(err.message);
    }
  };

  const handleAddProduct = async (productData) => {
    try {
      await adminService.createProduct(productData);
      await fetchProducts();
      setAddDialogOpen(false);
    } catch (err) {
      setError(err.message);
    }
  };

  const handleFilterChange = (event) => {
    const { name, value } = event.target;
    setFilters(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleDeleteClick = (product) => {
    setProductToDelete(product);
    setDeleteDialogOpen(true);
  };

  const handleConfirmDelete = async () => {
    try {
      await adminService.deleteProduct(productToDelete.id);
      await fetchProducts();
      setDeleteDialogOpen(false);
      setProductToDelete(null);
    } catch (err) {
      setError(err.message);
    }
  };

  if (loading) return <CircularProgress />;
  if (error) return <Alert severity="error">{error}</Alert>;

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
        <Typography variant="h5">Products Management</Typography>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={handleAddClick}
        >
          Add Product
        </Button>
      </Box>

      <Box sx={{ mb: 3, display: 'flex', gap: 2 }}>
        <SearchField
          name="search"
          value={filters.search}
          onChange={handleFilterChange}
          placeholder="Search products..."
          size="small"
          sx={{ width: 300 }}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <SearchIcon />
              </InputAdornment>
            ),
          }}
        />
        <FormControl size="small" sx={{ minWidth: 120 }}>
          <InputLabel>Sort By</InputLabel>
          <Select
            name="sortBy"
            value={filters.sortBy}
            onChange={handleFilterChange}
            label="Sort By"
            startAdornment={
              <InputAdornment position="start">
                <SortIcon />
              </InputAdornment>
            }
          >
            <MenuItem value="name">Name</MenuItem>
            <MenuItem value="price">Price</MenuItem>
            <MenuItem value="quantity">Quantity</MenuItem>
            <MenuItem value="profit">Profit Margin</MenuItem>
          </Select>
        </FormControl>
        <FormControl size="small" sx={{ minWidth: 120 }}>
          <InputLabel>Order</InputLabel>
          <Select
            name="sortOrder"
            value={filters.sortOrder}
            onChange={handleFilterChange}
            label="Order"
          >
            <MenuItem value="asc">Ascending</MenuItem>
            <MenuItem value="desc">Descending</MenuItem>
          </Select>
        </FormControl>
      </Box>

      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Name</TableCell>
              <TableCell>Description</TableCell>
              <TableCell align="right">Price ($)</TableCell>
              <TableCell align="right">Quantity</TableCell>
              <TableCell align="right">Supply Cost ($)</TableCell>
              <TableCell align="right">Profit Margin (%)</TableCell>
              <TableCell>Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {filteredProducts
              .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
              .map((product) => (
                <TableRow key={product.id}>
                  <TableCell>{product.name}</TableCell>
                  <TableCell>{product.description}</TableCell>
                  <TableCell align="right">{product.price.toFixed(2)}</TableCell>
                  <TableCell align="right">{product.quantity}</TableCell>
                  <TableCell align="right">{Number(product.supply_cost).toFixed(2)}</TableCell>
                  <TableCell align="right">{Number(product.profit_margin).toFixed(2)}</TableCell>
                  <TableCell>
                    <IconButton onClick={() => handleEditClick(product)}>
                      <EditIcon />
                    </IconButton>
                    <IconButton 
                      color="error" 
                      onClick={() => handleDeleteClick(product)}
                    >
                      <DeleteIcon />
                    </IconButton>
                  </TableCell>
                </TableRow>
              ))}
          </TableBody>
        </Table>
        <TablePagination
          rowsPerPageOptions={[5, 10, 25]}
          component="div"
          count={filteredProducts.length}
          rowsPerPage={rowsPerPage}
          page={page}
          onPageChange={(e, newPage) => setPage(newPage)}
          onRowsPerPageChange={(e) => {
            setRowsPerPage(parseInt(e.target.value, 10));
            setPage(0);
          }}
        />
      </TableContainer>

      <ProductDialog
        open={editDialogOpen}
        onClose={() => setEditDialogOpen(false)}
        onSave={handleSaveEdit}
        product={selectedProduct}
        mode="edit"
      />

      <ProductDialog
        open={addDialogOpen}
        onClose={() => setAddDialogOpen(false)}
        onSave={handleAddProduct}
        mode="add"
      />

      <Dialog
        open={deleteDialogOpen}
        onClose={() => setDeleteDialogOpen(false)}
      >
        <DialogTitle>Confirm Delete</DialogTitle>
        <DialogContent>
          <Typography>
            Are you sure you want to delete &quot;{productToDelete?.name}&quot;? This action cannot be undone.
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDeleteDialogOpen(false)}>Cancel</Button>
          <Button 
            onClick={handleConfirmDelete} 
            color="error" 
            variant="contained"
          >
            Delete
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default Products;