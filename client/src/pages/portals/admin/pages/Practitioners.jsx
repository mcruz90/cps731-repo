import { useState, useEffect } from 'react';
import { Box, CircularProgress, Alert, Tabs, Tab } from '@mui/material';
import PortalLayout from '@/components/Layout/PortalLayout';
import UserFilters from './components/UserFilters';
import UsersTable from './components/UsersTable';
import EditUserDialog from './components/dialogs/EditUserDialog';
import ActionConfirmDialog from './components/dialogs/ActionConfirmDialog';
import PractitionerSchedule from './components/practitioners/PractitionerSchedule';
import EditAvailabilityDialog from './components/dialogs/EditAvailabilityDialog';
import { useUserManagement } from '@/pages/portals/admin/hooks/useUserManagement';
import { adminService } from '@/services/api/admin';

const Practitioners = () => {
  const [activeTab, setActiveTab] = useState(0);
  const [filters, setFilters] = useState({
    specializations: '',
    city: '',
    phone: '',
    startDateFrom: '',
    startDateTo: '',
    status: 'active'
  });
  const [services, setServices] = useState([]);
  const [refreshAvailabilityTrigger, setRefreshAvailabilityTrigger] = useState(0);
  const [selectedPractitioner, setSelectedPractitioner] = useState('');

  // actually destructure all necessary variables and functions from useUserManagement hook. error logs popping if I don't do this
  const {
    users: practitioners,
    filteredUsers: filteredPractitioners,
    loading,
    error,
    selectedUser,
    editDialogOpen,
    actionDialogOpen,
    selectedAction,
    actionUser,
    setFilteredUsers: setFilteredPractitioners,
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
  } = useUserManagement('practitioner');

  // fetch services data
  useEffect(() => {
    const fetchServicesData = async () => {
      try {
        const { services: servicesData } = 
          await adminService.fetchServicesData();
        setServices(servicesData);
      } catch (error) {
        console.error('Error fetching services data:', error);
      }
    };

    fetchServicesData();
  }, []);

  const handleTabChange = (event, newValue) => {
    setActiveTab(newValue);
  };

  const refreshAvailability = () => {
    setRefreshAvailabilityTrigger(prev => prev + 1);
  };

  const fetchAppointmentCountsForPractitioner = async (practitionerId) => {
    try {
      await fetchAppointmentCounts(practitionerId);
    } catch (error) {
      console.error('Error fetching appointment counts:', error);
      
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
            <Tabs value={activeTab} onChange={handleTabChange} sx={{ mb: 3 }}>
              <Tab label="Practitioners List" />
              <Tab label="Availability Schedule" />
            </Tabs>

            {activeTab === 0 ? (
              <>
                <UserFilters 
                  users={practitioners}
                  filters={filters}
                  setFilters={setFilters}
                  setFilteredUsers={setFilteredPractitioners}
                  isPractitionerView
                />
                
                <UsersTable 
                  users={filteredPractitioners}
                  onEditClick={handleEditClick}
                  onActionClick={handleActionClick}
                  isPractitionerView
                />
              </>
            ) : (
              <>
                <PractitionerSchedule 
                  refreshTrigger={refreshAvailabilityTrigger}
                  practitioners={practitioners}
                  selectedPractitioner={selectedPractitioner} 
                  setSelectedPractitioner={setSelectedPractitioner}
                  onEditAvailability={(slot) => {
                    handleEditAvailability(slot);
                    if (slot.practitioner_id) {
                      fetchAppointmentCountsForPractitioner(slot.practitioner_id);
                    }
                  }}
                  onAvailabilityAction={(slot, action) => {
                    handleAvailabilityAction(slot, action);
                    if (slot.practitioner_id) {
                      fetchAppointmentCountsForPractitioner(slot.practitioner_id);
                    }
                  }}
                  appointmentCounts={appointmentCounts}
                  services={services}
                />
                
                <EditAvailabilityDialog
                  open={editAvailabilityDialogOpen}
                  availability={selectedAvailability}
                  onClose={handleCloseAvailabilityEdit}
                  onSave={async (editedData) => {
                    await handleSaveAvailabilityEdit(editedData);
                    
                    refreshAvailability();
                    if (editedData.practitioner_id) {
                      fetchAppointmentCountsForPractitioner(editedData.practitioner_id);
                    }
                  }}
                  services={services} 
                  practitioners={practitioners} 
                />

                <ActionConfirmDialog
                  open={availabilityActionDialogOpen}
                  action={selectedAction}
                  item={selectedAvailability}
                  onClose={handleCloseAvailabilityAction}
                  onConfirm={async () => {
                    await handleConfirmAvailabilityAction();
                    refreshAvailability();
                    if (selectedAvailability.practitioner_id) {
                      fetchAppointmentCountsForPractitioner(selectedAvailability.practitioner_id);
                    }
                  }}
                />
              </>
            )}

            <EditUserDialog
              open={editDialogOpen}
              user={selectedUser}
              onClose={handleCloseEdit}
              onSave={handleSaveEdit}
              isPractitionerView
            />

            <ActionConfirmDialog
              open={actionDialogOpen}
              action={selectedAction}
              item={actionUser}
              onClose={handleCloseAction}
              onConfirm={handleConfirmAction}
            />
          </>
        )}
      </Box>
    </PortalLayout>
  );
};

export default Practitioners;
