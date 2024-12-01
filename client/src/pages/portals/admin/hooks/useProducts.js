import { useState, useEffect } from 'react';
import { adminService } from '@/services/api/admin';

// custom hook available only to admin pages to fetch and filter products from the database
// streamlines the process of fetching and filtering products so Products.js isn't cluttered
const useProducts = () => {
  const [products, setProducts] = useState([]);
  const [filteredProducts, setFilteredProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [filters, setFilters] = useState({
    search: '',
    sortBy: 'name',
    sortOrder: 'asc',
  });

  // fetches the products from the database
  useEffect(() => {
    fetchProducts();
  }, []);

  // filters the products based on the search, sortBy, and sortOrder
  useEffect(() => {
    let result = [...products];

    if (filters.search) {
      const searchTerm = filters.search.toLowerCase();
      result = result.filter(
        (product) =>
          product.name.toLowerCase().includes(searchTerm) ||
          product.description.toLowerCase().includes(searchTerm)
      );
    }

    // sorts the products based on the sortBy and sortOrder
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

  // fetches the products from the database
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

  // handles the change in the filters
  const handleFilterChange = (event) => {
    const { name, value } = event.target;
    setFilters((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  // handles the change in the page
  const handleChangePage = (event, newPage) => {
    setPage(newPage);
  };

  // handles the change in the rows per page
  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  const updateProduct = async (id, updateData) => {
    try {
      await adminService.updateProduct(id, updateData);
      await fetchProducts();
    } catch (err) {
      setError(err.message);
      throw err; 
    }
  };

  const createProduct = async (productData) => {
    try {
      await adminService.createProduct(productData);
      await fetchProducts();
    } catch (err) {
      setError(err.message);
      throw err;
    }
  };

  const deleteProduct = async (id) => {
    try {
      await adminService.deleteProduct(id);
      await fetchProducts();
    } catch (err) {
      setError(err.message);
      throw err;
    }
  };

  return {
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
    fetchProducts,
  };
};

export default useProducts;