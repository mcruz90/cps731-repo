import PropTypes from 'prop-types';
import {
  Box,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  TextField as SearchField,
  InputAdornment,
} from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import SortIcon from '@mui/icons-material/Sort';

const ProductsFilters = ({ filters, onFilterChange }) => (
  <Box sx={{ mb: 3, display: 'flex', gap: 2 }}>
    <SearchField
      name="search"
      value={filters.search}
      onChange={onFilterChange}
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
        onChange={onFilterChange}
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
        onChange={onFilterChange}
        label="Order"
      >
        <MenuItem value="asc">Ascending</MenuItem>
        <MenuItem value="desc">Descending</MenuItem>
      </Select>
    </FormControl>
  </Box>
);

ProductsFilters.propTypes = {
  filters: PropTypes.shape({
    search: PropTypes.string,
    sortBy: PropTypes.string,
    sortOrder: PropTypes.string,
  }).isRequired,
  onFilterChange: PropTypes.func.isRequired,
};

export default ProductsFilters;