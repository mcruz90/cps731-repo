import {
  Paper,
  TableContainer,
  Table,
  TableHead,
  TableRow,
  TableCell,
  TableBody,
  TablePagination,
  IconButton,
  Tooltip,
} from '@mui/material';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import { styled } from '@mui/material/styles';
import PropTypes from 'prop-types';

// Styling to change the color of the profit margin based on the profit margin value
const ProfitCell = styled(TableCell)(({ theme, profitmargin }) => ({
  color:
    profitmargin === 0
      ? theme.palette.text.primary
      : profitmargin < 30
      ? theme.palette.error.main
      : theme.palette.success.main,
  fontWeight: 'bold',
}));

const ProductsTable = ({
  products,
  page,
  rowsPerPage,
  handleChangePage,
  handleChangeRowsPerPage,
  onEdit,
  onDelete,
}) => {
  return (
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
          {products
            .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
            .map((product) => (
              <TableRow key={product.id}>
                <TableCell>{product.name}</TableCell>
                <TableCell>{product.description}</TableCell>
                <TableCell align="right">
                  {product.price.toFixed(2)}
                </TableCell>
                <TableCell align="right">{product.quantity}</TableCell>
                <TableCell align="right">
                  {Number(product.supply_cost).toFixed(2)}
                </TableCell>
                <Tooltip
                  title={
                    product.profit_margin === 0
                      ? 'No profit margin'
                      : product.profit_margin < 30
                      ? 'Low profit margin'
                      : 'Healthy profit margin'
                  }
                >
                  <ProfitCell align="right" profitmargin={Number(product.profit_margin)}>
                    {Number(product.profit_margin).toFixed(2)}
                  </ProfitCell>
                </Tooltip>
                <TableCell>
                  <IconButton onClick={() => onEdit(product)}>
                    <EditIcon />
                  </IconButton>
                  <IconButton color="error" onClick={() => onDelete(product)}>
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
        count={products.length}
        rowsPerPage={rowsPerPage}
        page={page}
        onPageChange={handleChangePage}
        onRowsPerPageChange={handleChangeRowsPerPage}
      />
    </TableContainer>
  );
};

export default ProductsTable;

ProductsTable.propTypes = {
  products: PropTypes.array.isRequired,
  page: PropTypes.number.isRequired,
  rowsPerPage: PropTypes.number.isRequired,
  handleChangePage: PropTypes.func.isRequired,
  handleChangeRowsPerPage: PropTypes.func.isRequired,
  onEdit: PropTypes.func.isRequired,
  onDelete: PropTypes.func.isRequired,
};
