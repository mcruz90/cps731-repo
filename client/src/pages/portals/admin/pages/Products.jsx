import { useState } from 'react';
import {
  Box,
  CircularProgress,
  Alert,
  Snackbar,
} from '@mui/material';
import ProductsHeader from './components/ProductsHeader';
import ProductsFilters from './components/ProductsFilters';
import ProductsTable from './components/ProductsTable';
import ProductDialog from './components/dialogs/ProductDialog';
import DeleteConfirmationDialog from './components/dialogs/DeleteConfirmationDialog';
import useProducts from '../hooks/useProducts'

const Products = () => {
  const {
    filteredProducts,
    loading,
    error,
    page,
    rowsPerPage,
    filters,
    handleFilterChange,
    handleChangePage,
    handleChangeRowsPerPage,
    updateProduct,
    createProduct,
    deleteProduct,
  } = useProducts();

  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [addDialogOpen, setAddDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [productToDelete, setProductToDelete] = useState(null);
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: '',
    severity: 'error',
  });

  const handleEditClick = (product) => {
    setSelectedProduct(product);
    setEditDialogOpen(true);
  };

  const handleAddClick = () => {
    setAddDialogOpen(true);
  };

  const handleSaveEdit = async (editedData) => {
    try {
      await updateProduct(selectedProduct.id, editedData);
      setEditDialogOpen(false);
      setSelectedProduct(null);
      setSnackbar({
        open: true,
        message: 'Product updated successfully!',
        severity: 'success',
      });
    } catch (err) {
      console.error('Error updating product:', err);
      setSnackbar({
        open: true,
        message: 'Error updating product.',
        severity: 'error',
      });
    }
  };

  const handleAddProduct = async (productData) => {
    try {
      await createProduct(productData);
      setAddDialogOpen(false);
      setSnackbar({
        open: true,
        message: 'Product created successfully!',
        severity: 'success',
      });
    } catch (err) {
      console.error('Error creating product:', err);
      setSnackbar({
        open: true,
        message: 'Error creating product.',
        severity: 'error',
      });
    }
  };

  const handleDeleteClick = (product) => {
    setProductToDelete(product);
    setDeleteDialogOpen(true);
  };

  const handleConfirmDelete = async () => {
    try {
      await deleteProduct(productToDelete.id);
      setDeleteDialogOpen(false);
      setProductToDelete(null);
      setSnackbar({
        open: true,
        message: 'Product deleted successfully!',
        severity: 'success',
      });
    } catch (err) {
      console.error('Error deleting product:', err);
      setSnackbar({
        open: true,
        message: 'Error deleting product.',
        severity: 'error',
      });
    }
  };

  if (loading) return <CircularProgress />;
  if (error) return <Alert severity="error">{error}</Alert>;

  return (
    <Box sx={{ p: 3 }}>
      <ProductsHeader onAddClick={handleAddClick} />

      <ProductsFilters filters={filters} onFilterChange={handleFilterChange} />

      <ProductsTable
        products={filteredProducts}
        page={page}
        rowsPerPage={rowsPerPage}
        handleChangePage={handleChangePage}
        handleChangeRowsPerPage={handleChangeRowsPerPage}
        onEdit={handleEditClick}
        onDelete={handleDeleteClick}
      />

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

      <DeleteConfirmationDialog
        open={deleteDialogOpen}
        onClose={() => setDeleteDialogOpen(false)}
        onConfirm={handleConfirmDelete}
        productName={productToDelete?.name}
      />

      <Snackbar
        open={snackbar.open}
        autoHideDuration={6000}
        onClose={() => setSnackbar({ ...snackbar, open: false })}
      >
        <Alert
          onClose={() => setSnackbar({ ...snackbar, open: false })}
          severity={snackbar.severity}
          sx={{ width: '100%' }}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default Products;