import { useState, useCallback, useEffect } from 'react';
import { adminService } from '@/services/api/admin';
import { useSnackbar } from 'notistack';

export const useUserManagement = (role = null) => {

  // State variables
  const [users, setUsers] = useState([]); 
  const [filteredUsers, setFilteredUsers] = useState([]); 
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // user editing
  const [selectedUser, setSelectedUser] = useState(null);
  const [editDialogOpen, setEditDialogOpen] = useState(false);

  // action dialogs
  const [actionDialogOpen, setActionDialogOpen] = useState(false);
  const [selectedAction, setSelectedAction] = useState(null);
  const [actionUser, setActionUser] = useState(null);

  // availability actions
  const [availabilityActionDialogOpen, setAvailabilityActionDialogOpen] = useState(false);
  const [selectedAvailability, setSelectedAvailability] = useState(null);
  const [editAvailabilityDialogOpen, setEditAvailabilityDialogOpen] = useState(false);
  const [appointmentCounts, setAppointmentCounts] = useState({});

  const [practitioners, setPractitioners] = useState([]);

  const { enqueueSnackbar } = useSnackbar();

  // fetch users based on role, otherwise fetch all users
  const fetchUsers = useCallback(async () => {
    console.log('useUserManagement: Fetching users...');
    console.log('Role filter:', role);
    
    try {
      setLoading(true);
      setError(null);
      
      console.log('Calling adminService.getAllUsers()...');
      const data = await adminService.getAllUsers();
      console.log('Received users data:', data);
    
      const filteredData = role 
        ? data.filter(user => user.role === role)
        : data;
      
      console.log(`Filtered ${data.length} users to ${filteredData.length} ${role || 'all'} users`);
      
      setUsers(filteredData);
      setFilteredUsers(filteredData);
      console.log('User state updated successfully');
    } catch (err) {
      console.error('Error fetching users:', err);
      setError(err.message);
      enqueueSnackbar('Failed to fetch users.', { variant: 'error' });
    } finally {
      console.log('Setting loading state to false');
      setLoading(false);
    }
  }, [role, enqueueSnackbar]);

  // fetch practitioners for select fields
  const fetchPractitioners = useCallback(async () => {
    try {
      const data = await adminService.getPractitioners();
      setPractitioners(data);
      console.log('Fetched practitioners:', data);
    } catch (err) {
      console.error('Error fetching practitioners:', err);
      enqueueSnackbar('Failed to fetch practitioners.', { variant: 'error' });
    }
  }, [enqueueSnackbar]);

  // fetch appointment counts for all availability slots of a given practitioner
  const fetchAppointmentCounts = useCallback(async (practitionerId) => {
    try {
      const appointments = await adminService.getAppointmentsByPractitioner(practitionerId);
      const counts = {};
      appointments.forEach(appointment => {
        if (appointment.availability_id) {
          counts[appointment.availability_id] = (counts[appointment.availability_id] || 0) + 1;
        }
      });
      setAppointmentCounts(counts);
      console.log('Updated appointmentCounts:', counts);
    } catch (error) {
      console.error('Error fetching appointment counts:', error);
      enqueueSnackbar('Failed to fetch appointment counts.', { variant: 'error' });
    }
  }, [enqueueSnackbar]);

  // fetch users and practitioners on component mount or when role changes
  useEffect(() => {
    fetchUsers();
    fetchPractitioners();
  }, [fetchUsers, fetchPractitioners]);

  // handlers for editing users
  const handleEditClick = (user) => {
    setSelectedUser(user);
    setEditDialogOpen(true);
  };

  const handleSaveEdit = async (editedUser) => {
    console.log('Edited user:', editedUser);
    try {
      await adminService.updateUser(editedUser.id, editedUser);
      enqueueSnackbar('User updated successfully.', { variant: 'success' });
      setEditDialogOpen(false);
      setSelectedUser(null);
      fetchUsers();
    } catch (err) {
      console.error('Error updating user:', err);
      enqueueSnackbar('Failed to update user.', { variant: 'error' });
    }
  };

  const handleCloseEdit = () => {
    setEditDialogOpen(false);
    setSelectedUser(null);
  };

  // handlers for performing actions on users
  const handleActionClick = (user, action) => {
    setActionUser(user);
    setSelectedAction(action);
    setActionDialogOpen(true);
  };

  // confirm action on user
  const handleConfirmAction = async () => {
    if (!selectedAction || !actionUser) return;

    try {
      if (selectedAction === 'delete') {
        await adminService.deleteUser(actionUser.id);
        enqueueSnackbar('User deleted successfully.', { variant: 'success' });
      } else if (selectedAction === 'deactivate') {
        await adminService.updateUserStatus(actionUser.id, false);
        enqueueSnackbar('User deactivated successfully.', { variant: 'success' });
      } else if (selectedAction === 'activate') {
        await adminService.updateUserStatus(actionUser.id, true);
        enqueueSnackbar('User activated successfully.', { variant: 'success' });
      }
      setActionDialogOpen(false);
      setSelectedAction(null);
      setActionUser(null);
      fetchUsers(); // Refresh users list
    } catch (err) {
      console.error('Error performing action on user:', err);
      enqueueSnackbar('Failed to perform action.', { variant: 'error' });
    }
  };

  const handleCloseAction = () => {
    setActionDialogOpen(false);
    setSelectedAction(null);
    setActionUser(null);
  };

  // handlers for editing availability slots
  const handleEditAvailability = (slot) => {
    setSelectedAvailability(slot);
    setEditAvailabilityDialogOpen(true);
  };

  // save edited availability slot
  const handleSaveAvailabilityEdit = async (editedData) => {
    try {
      console.log('Saving edited availability:', editedData); // Log the data
      
      await adminService.updateAvailability(editedData);
      enqueueSnackbar('Availability updated successfully.', { variant: 'success' });
      setEditAvailabilityDialogOpen(false);
      setSelectedAvailability(null);
      
      fetchUsers();
      if (editedData.practitioner_id) {
        fetchAppointmentCounts(editedData.practitioner_id);
      }
    } catch (err) {
      console.error('Error updating availability:', err);
      enqueueSnackbar('Failed to update availability.', { variant: 'error' });
    }
  };

  const handleCloseAvailabilityEdit = () => {
    setEditAvailabilityDialogOpen(false);
    setSelectedAvailability(null);
  };

  // handlers for availability actions
  const handleAvailabilityAction = async (slot, action) => {
    console.log('Handling availability action:', action, 'for slot:', slot);
    
    if (action === 'delete') {
      try {
        const appointments = await adminService.getAppointmentsByAvailability(slot.id);
        if (appointments.length > 0) {
          enqueueSnackbar('Cannot delete this slot as there are existing appointments.', { variant: 'warning' });
          return;
        }
      } catch (error) {
        enqueueSnackbar(error.message + ': Failed to verify appointments. Please try again.', { variant: 'error' });
        return;
      }
    }

    setSelectedAvailability(slot);
    setSelectedAction(action);
    setAvailabilityActionDialogOpen(true);
  };

  // confirm availability action
  const handleConfirmAvailabilityAction = async () => {
    if (!selectedAction || !selectedAvailability) return;

    try {
      if (selectedAction === 'deactivate') {
        await adminService.toggleAvailabilityStatus(selectedAvailability.id, !selectedAvailability.is_available);
        enqueueSnackbar('Availability status updated successfully.', { variant: 'success' });
      } else if (selectedAction === 'delete') {
        await adminService.deleteAvailability(selectedAvailability.id);
        enqueueSnackbar('Availability deleted successfully.', { variant: 'success' });
      }
      setAvailabilityActionDialogOpen(false);
      setSelectedAction(null);
      setSelectedAvailability(null);
      fetchUsers();
      if (selectedAvailability.practitioner_id) {
        fetchAppointmentCounts(selectedAvailability.practitioner_id);
      }
    } catch (err) {
      console.error('Error performing availability action:', err);
      enqueueSnackbar(err.message || 'Failed to perform availability action.', { variant: 'error' });
    }
  };

  // close availability action dialog
  const handleCloseAvailabilityAction = () => {
    setAvailabilityActionDialogOpen(false);
    setSelectedAction(null);
    setSelectedAvailability(null);
  };

  return {
    users,
    filteredUsers,
    setFilteredUsers,
    loading,
    error,
    selectedUser,
    editDialogOpen,
    actionDialogOpen,
    selectedAction,
    actionUser,
    handleEditClick,
    handleActionClick,
    handleConfirmAction,
    handleSaveEdit,
    handleCloseEdit,
    handleCloseAction,
    handleEditAvailability,
    handleAvailabilityAction,
    selectedAvailability,
    handleSaveAvailabilityEdit,
    editAvailabilityDialogOpen,
    availabilityActionDialogOpen,
    handleConfirmAvailabilityAction,
    handleCloseAvailabilityEdit,
    handleCloseAvailabilityAction,
    appointmentCounts,
    fetchAppointmentCounts,
    practitioners,
  };
};
