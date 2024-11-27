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
    } catch (err) {
      console.error('Error updating product:', err);
      <Snackbar open={true} message="Error updating product" />
    }
  };

  const handleAddProduct = async (productData) => {
    try {
      await createProduct(productData);
      setAddDialogOpen(false);
    } catch (err) {
      console.error('Error creating product:', err);
      <Snackbar open={true} message="Error creating product" />
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
    } catch (err) {
      console.error('Error deleting product:', err);
      <Snackbar open={true} message="Error deleting product" />
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
    </Box>
  );
};

export default Products;