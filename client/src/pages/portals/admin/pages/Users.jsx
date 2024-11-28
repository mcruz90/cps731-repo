import { useState } from 'react';
import { Box, CircularProgress, Alert } from '@mui/material';
import PortalLayout from '@/components/Layout/PortalLayout';
import UserFilters from './components/UserFilters';
import UsersTable from './components/UsersTable';
import EditUserDialog from './components/dialogs/EditUserDialog';
import ActionConfirmDialog from './components/dialogs/ActionConfirmDialog';
import { useUserManagement } from '@/pages/portals/admin/hooks/useUserManagement';

const Users = () => {
  const [filters, setFilters] = useState({
    role: '',
    city: '',
    phone: '',
    specialization: '',
    startDateFrom: '',
    startDateTo: '',
    status: ''
  });

  const {
    users,
    filteredUsers,
    loading,
    error,
    selectedUser,
    editDialogOpen,
    actionDialogOpen,
    selectedAction,
    actionUser,
    setFilteredUsers,
    handleEditClick,
    handleActionClick,
    handleConfirmAction,
    handleSaveEdit,
    handleCloseEdit,
    handleCloseAction,
  } = useUserManagement();

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
              isPractitionerView={false}
            />
            
            <UsersTable 
              users={filteredUsers}
              onEditClick={handleEditClick}
              onActionClick={handleActionClick}
              isPractitionerView={false}
            />

            <EditUserDialog
              open={editDialogOpen}
              user={selectedUser}
              onSave={handleSaveEdit}
              onClose={handleCloseEdit}
            />

            <ActionConfirmDialog
              open={actionDialogOpen}
              action={selectedAction}
              user={actionUser}
              onClose={handleCloseAction}
              onConfirm={handleConfirmAction}
            />
          </>
        )}
      </Box>
    </PortalLayout>
  );
};

export default Users;