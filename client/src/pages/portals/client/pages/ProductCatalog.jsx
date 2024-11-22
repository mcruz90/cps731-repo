import { useState, useEffect, useCallback } from 'react';
import {
  Grid,
  Card,
  CardContent,
  CardActions,
  Typography,
  Button,
  TextField,
  Box,
  Chip,
  Alert,
  InputAdornment,
  Slider,
  Paper
} from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import ShoppingCartIcon from '@mui/icons-material/ShoppingCart';
import PortalLayout from '@/components/Layout/PortalLayout';
import { inventoryService } from '@/services/api/inventory';
import { cartService } from '@/services/api/cart';

const ProductCatalog = () => {
  const [products, setProducts] = useState([]);
  const [filteredProducts, setFilteredProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [quantities, setQuantities] = useState({});
  const [successMessage, setSuccessMessage] = useState('');
  
  // Search and filter states
  const [searchQuery, setSearchQuery] = useState('');
  const [priceRange, setPriceRange] = useState([0, 1000]);
  const [maxPrice, setMaxPrice] = useState(1000);

  useEffect(() => {
    fetchProducts();
  }, []);

  const filterProducts = useCallback(() => {
    const filtered = products.filter(product => {
      const matchesSearch = product.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          product.description.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesPrice = product.price >= priceRange[0] && product.price <= priceRange[1];
      return matchesSearch && matchesPrice;
    });
    setFilteredProducts(filtered);
  }, [products, searchQuery, priceRange]);

  useEffect(() => {
    filterProducts();
  }, [filterProducts]);

  const fetchProducts = async () => {
    try {
      const data = await inventoryService.retrieveInventory();
      setProducts(data);
      
      // Set initial max price based on highest product price
      const highestPrice = Math.max(...data.map(product => product.price));
      setMaxPrice(Math.ceil(highestPrice));
      setPriceRange([0, Math.ceil(highestPrice)]);
      
      const initialQuantities = {};
      data.forEach(product => {
        initialQuantities[product.id] = 1;
      });
      setQuantities(initialQuantities);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleQuantityChange = (productId, value) => {
    const newValue = Math.max(1, Math.min(99, Number(value)));
    setQuantities(prev => ({
      ...prev,
      [productId]: newValue
    }));
  };

  const handleAddToCart = async (product) => {
    try {
      if (quantities[product.id] > product.quantity) {
        throw new Error('Requested quantity exceeds available stock');
      }

      await cartService.addToCart(
        product.id,
        quantities[product.id],
        product.price
      );

      setSuccessMessage('Added to cart successfully');
      setTimeout(() => setSuccessMessage(''), 3000);
    } catch (err) {
      setError(err.message);
      setTimeout(() => setError(null), 3000);
    }
  };

  if (loading) return <Box>Loading products...</Box>;

  return (
    <PortalLayout>
      <Typography variant="h4" component="h1" gutterBottom>
        Products
      </Typography>

      {/* Search and Filter Section */}
      <Paper sx={{ p: 2, mb: 3 }}>
        <Grid container spacing={3} alignItems="center">
          <Grid item xs={12} md={6}>
            <TextField
              fullWidth
              label="Search products"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <SearchIcon />
                  </InputAdornment>
                ),
              }}
            />
          </Grid>
          <Grid item xs={12} md={6}>
            <Typography gutterBottom>Price Range: ${priceRange[0]} - ${priceRange[1]}</Typography>
            <Slider
              value={priceRange}
              onChange={(_, newValue) => setPriceRange(newValue)}
              valueLabelDisplay="auto"
              min={0}
              max={maxPrice}
              sx={{ width: '100%' }}
            />
          </Grid>
        </Grid>
      </Paper>

      <Box>
        {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
        {successMessage && <Alert severity="success" sx={{ mb: 2 }}>{successMessage}</Alert>}
        
        {filteredProducts.length === 0 ? (
          <Alert severity="info">No products match your search criteria</Alert>
        ) : (
          <Grid container spacing={3}>
            {filteredProducts.map((product) => (
              <Grid item xs={12} sm={6} md={4} key={product.id}>
                <Card>
                  <CardContent>
                    <Typography variant="h6" gutterBottom>
                      {product.name}
                    </Typography>
                    <Typography variant="body2" color="text.secondary" gutterBottom>
                      {product.description}
                    </Typography>
                    <Box display="flex" justifyContent="space-between" alignItems="center" mt={2}>
                      <Typography variant="h6" color="primary">
                        ${Number(product.price).toFixed(2)}
                      </Typography>
                      {product.quantity > 0 ? (
                        <Chip 
                          label={`${product.quantity} in stock`} 
                          color="success" 
                          size="small" 
                        />
                      ) : (
                        <Chip 
                          label="Out of Stock" 
                          color="error" 
                          size="small" 
                        />
                      )}
                    </Box>
                  </CardContent>
                  <CardActions sx={{ p: 2, pt: 0 }}>
                    <TextField
                      type="number"
                      label="Quantity"
                      value={quantities[product.id]}
                      onChange={(e) => handleQuantityChange(product.id, e.target.value)}
                      inputProps={{ 
                        min: 1, 
                        max: Math.min(99, product.quantity)
                      }}
                      size="small"
                      sx={{ width: 100 }}
                    />
                    <Button
                      variant="contained"
                      startIcon={<ShoppingCartIcon />}
                      onClick={() => handleAddToCart(product)}
                      disabled={product.quantity === 0}
                      fullWidth
                      sx={{ ml: 1 }}
                    >
                      Add to Cart
                    </Button>
                  </CardActions>
                </Card>
              </Grid>
            ))}
          </Grid>
        )}
      </Box>
    </PortalLayout>
  );
};

export default ProductCatalog;