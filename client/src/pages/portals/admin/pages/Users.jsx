import { useState, useEffect } from 'react';
import { Box, CircularProgress, Alert } from '@mui/material';
import PortalLayout from '@/components/Layout/PortalLayout';
import { adminService } from '@/services/api/admin';
import UserFilters from './components/UserFilters';
import UsersTable from './components/UsersTable';
import EditUserDialog from './components/EditUserDialog';
import ActionConfirmDialog from './components/ActionConfirmDialog';

const Users = () => {
  const [users, setUsers] = useState([]);
  const [filteredUsers, setFilteredUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedUser, setSelectedUser] = useState(null);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [actionDialogOpen, setActionDialogOpen] = useState(false);
  const [selectedAction, setSelectedAction] = useState(null);
  const [actionUser, setActionUser] = useState(null);
  const [filters, setFilters] = useState({
    role: '',
    city: '',
    phone: '',
    specialization: '',
    startDateFrom: '',
    startDateTo: '',
    status: 'active'
  });

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      const data = await adminService.getAllUsers();
      setUsers(data);
      setFilteredUsers(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleEditClick = (user) => {
    setSelectedUser(user);
    setEditDialogOpen(true);
  };

  const handleActionClick = (user, action) => {
    setActionUser(user);
    setSelectedAction(action);
    setActionDialogOpen(true);
  };

  const handleConfirmAction = async () => {
    try {
      if (selectedAction === 'deactivate') {
        await adminService.updateUserStatus(actionUser.id, !actionUser.is_active);
      } else if (selectedAction === 'delete') {
        await adminService.deleteUser(actionUser.id);
      }
      await fetchUsers();
      setActionDialogOpen(false);
      setActionUser(null);
      setSelectedAction(null);
      setError(null);
    } catch (err) {
      setError(err.message);
    }
  };

  const handleSaveEdit = async (editedData) => {
    try {
      await adminService.updateUser(selectedUser.id, editedData);
      await fetchUsers();
      setEditDialogOpen(false);
      setSelectedUser(null);
    } catch (err) {
      setError(err.message);
    }
  };

  return (
    <PortalLayout>
      <Box sx={{ mb: 4 }}>
        {error && <Alert severity="error" sx={{ mb: 3 }}>{error}</Alert>}
        
        {loading ? (
          <CircularProgress />
        ) : (
          <>
            <UserFilters 
              users={users}
              filters={filters}
              setFilters={setFilters}
              setFilteredUsers={setFilteredUsers}
            />
            
            <UsersTable 
              users={filteredUsers}
              onEditClick={handleEditClick}
              onActionClick={handleActionClick}
            />

            <EditUserDialog
              open={editDialogOpen}
              user={selectedUser}
              onClose={() => setEditDialogOpen(false)}
              onSave={handleSaveEdit}
            />

            <ActionConfirmDialog
              open={actionDialogOpen}
              action={selectedAction}
              user={actionUser}
              onClose={() => setActionDialogOpen(false)}
              onConfirm={handleConfirmAction}
            />
          </>
        )}
      </Box>
    </PortalLayout>
  );
};

export default Users;