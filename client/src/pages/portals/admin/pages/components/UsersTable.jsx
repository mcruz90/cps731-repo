import { useState } from 'react';
import PropTypes from 'prop-types';
import {
  TableContainer,
  Table,
  TableHead,
  TableBody,
  TableRow,
  TableCell,
  TablePagination,
  Paper,
  Chip,
  IconButton,
  Tooltip
} from '@mui/material';
import EditIcon from '@mui/icons-material/Edit';
import BlockIcon from '@mui/icons-material/Block';
import DeleteIcon from '@mui/icons-material/Delete';

// displays the users in a table
const UsersTable = ({ users = [], onEditClick, onActionClick, isPractitionerView }) => {
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);

  const handleChangePage = (event, newPage) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  const safeUsers = Array.isArray(users) ? users : [];
  
  const displayedUsers = safeUsers.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage);

  return (
    <Paper>
      <TableContainer>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Name</TableCell>
              {!isPractitionerView && <TableCell>Role</TableCell>}
              <TableCell>Email</TableCell>
              <TableCell>Phone</TableCell>
              <TableCell>City</TableCell>
              {isPractitionerView && <TableCell>Specialization</TableCell>}
              <TableCell>Status</TableCell>
              <TableCell align="right">Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {displayedUsers.map((user) => (
              <TableRow key={user.id}>
                <TableCell>
                  {user.first_name} {user.last_name}
                </TableCell>
                {!isPractitionerView && (
                  <TableCell>
                    <Chip 
                      label={user.role} 
                      color={
                        user.role === 'admin' ? 'error' :
                        user.role === 'practitioner' ? 'primary' :
                        user.role === 'staff' ? 'warning' : 'default'
                      }
                      size="small"
                    />
                  </TableCell>
                )}
                <TableCell>{user.email}</TableCell>
                <TableCell>{user.phone}</TableCell>
                <TableCell>{user.city}</TableCell>
                {isPractitionerView && (
                  <TableCell>{user.specializations}</TableCell>
                )}
                <TableCell>
                  <Chip 
                    label={user.is_active ? 'Active' : 'Inactive'}
                    color={user.is_active ? 'success' : 'default'}
                    size="small"
                  />
                </TableCell>
                <TableCell align="right">
                  <Tooltip title="Edit">
                    <IconButton 
                      onClick={() => onEditClick(user)}
                      size="small"
                    >
                      <EditIcon />
                    </IconButton>
                  </Tooltip>
                  <Tooltip title={user.is_active ? 'Deactivate' : 'Activate'}>
                    <IconButton
                      onClick={() => onActionClick(user, 'deactivate')}
                      size="small"
                      color={user.is_active ? 'warning' : 'success'}
                    >
                      <BlockIcon />
                    </IconButton>
                  </Tooltip>
                  <Tooltip title="Delete">
                    <IconButton
                      onClick={() => onActionClick(user, 'delete')}
                      size="small"
                      color="error"
                    >
                      <DeleteIcon />
                    </IconButton>
                  </Tooltip>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
      <TablePagination
        rowsPerPageOptions={[5, 10, 25]}
        component="div"
        count={safeUsers.length}
        rowsPerPage={rowsPerPage}
        page={page}
        onPageChange={handleChangePage}
        onRowsPerPageChange={handleChangeRowsPerPage}
      />
    </Paper>
  );
};

UsersTable.propTypes = {
  users: PropTypes.array,
  onEditClick: PropTypes.func.isRequired,
  onActionClick: PropTypes.func.isRequired,
  isPractitionerView: PropTypes.bool
};

UsersTable.defaultProps = {
  users: [],
  isPractitionerView: false
};

export default UsersTable;