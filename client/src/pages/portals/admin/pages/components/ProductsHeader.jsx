import PropTypes from 'prop-types';
import { Typography, Box, Button } from '@mui/material';
import AddIcon from '@mui/icons-material/Add';

const ProductsHeader = ({ onAddClick }) => (
  <Box
    sx={{
      display: 'flex',
      justifyContent: 'space-between',
      mb: 2,
      alignItems: 'center',
    }}
  >
    <Typography variant="h5">Products Management</Typography>
    <Button
      variant="contained"
      startIcon={<AddIcon />}
      onClick={onAddClick}
    >
      Add Product
    </Button>
  </Box>
);

ProductsHeader.propTypes = {
  onAddClick: PropTypes.func.isRequired,
};

export default ProductsHeader;