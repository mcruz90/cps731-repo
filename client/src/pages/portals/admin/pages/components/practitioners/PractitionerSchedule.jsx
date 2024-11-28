import { useState, useEffect, useCallback } from 'react';
import PropTypes from 'prop-types';
import { 
  Box, 
  Paper, 
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  CircularProgress,
  Alert,
  IconButton,
  Tooltip
} from '@mui/material';
import EditIcon from '@mui/icons-material/Edit';
import BlockIcon from '@mui/icons-material/Block';
import DeleteIcon from '@mui/icons-material/Delete';
import { adminService } from '@/services/api/admin';
import { format, parseISO } from 'date-fns';

const PractitionerSchedule = ({ 
  practitioners,
  onEditAvailability,
  onAvailabilityAction,
  refreshTrigger,
  appointmentCounts,
  services,
  selectedPractitioner, 
  setSelectedPractitioner 
}) => {
  const [availability, setAvailability] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // fetch availability for selected practitioner
  const fetchAvailability = useCallback(async () => {
    if (!selectedPractitioner) return;
  
    try {
      setLoading(true);
      setError(null);
      console.log(`Fetching availability for practitioner ID: ${selectedPractitioner}`);
      const data = await adminService.getPractitionerAvailability(selectedPractitioner);
      setAvailability(data);
      console.log('Received availability data:', data);
    } catch (err) {
      console.error('Error fetching availability:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [selectedPractitioner]);

  // fetch availability when refresh trigger changes
  useEffect(() => {
    fetchAvailability();
  }, [fetchAvailability, refreshTrigger]);

  // format time
  const formatTime = (timeString) => {
    return format(parseISO(`2000-01-01T${timeString}`), 'h:mm a');
  };

  // map service ids to their names
  const serviceMap = {};
  if (services && Array.isArray(services)) {
    services.forEach(service => {
       serviceMap[service.id] = service.name;
     });
   } else {
    console.error('services is not defined or not an array', services);
  }

  return (
    <Box>
      {/* practitioner selection */}
      <FormControl fullWidth sx={{ mb: 3 }}>
        <InputLabel>Select Practitioner</InputLabel>
        <Select
          value={selectedPractitioner}
          onChange={(e) => setSelectedPractitioner(e.target.value)}
          label="Select Practitioner"
        >
          {practitioners.map((practitioner) => (
            <MenuItem 
              key={practitioner.id} 
              value={practitioner.id}
            >
              {`${practitioner.first_name} ${practitioner.last_name}`}
            </MenuItem>
          ))}
        </Select>
      </FormControl>

      {/* error alert */}
      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}

      {/* loading spinner */}
      {loading ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', my: 4 }}>
          <CircularProgress />
        </Box>
      ) : selectedPractitioner && (
        <TableContainer component={Paper}>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Practitioner</TableCell>
                <TableCell>Service</TableCell>
                <TableCell>Date</TableCell>
                <TableCell>Day</TableCell>
                <TableCell>Start Time</TableCell>
                <TableCell>End Time</TableCell>
                <TableCell>Status</TableCell>
                <TableCell align="right">Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {availability.map((slot) => {
                const practitioner = practitioners.find(p => p.id === slot.practitioner_id);
                const serviceName = slot.service_id ? (serviceMap[slot.service_id] || 'Service Not Found') : 'No Service Assigned';

                // Get appointment count for this slot
                const hasAppointments = appointmentCounts[slot.id] > 0;

                return (
                  <TableRow key={slot.id}>
                    <TableCell>
                      {practitioner ? `${practitioner.first_name} ${practitioner.last_name}` : 'Unknown'}
                    </TableCell>
                    
                    <TableCell>{serviceName}</TableCell>
                    <TableCell>{format(parseISO(slot.date), 'MMM dd, yyyy')}</TableCell>
                    <TableCell>{format(parseISO(slot.date), 'EEEE')}</TableCell>
                    <TableCell>{formatTime(slot.start_time)}</TableCell>
                    <TableCell>{formatTime(slot.end_time)}</TableCell>
                    <TableCell>{slot.is_available ? 'Available' : 'Booked'}</TableCell>
                    <TableCell align="right">
                      <Tooltip title="Edit">
                        <IconButton 
                          onClick={() => onEditAvailability(slot)}
                          size="small"
                        >
                          <EditIcon />
                        </IconButton>
                      </Tooltip>
                      <Tooltip title={slot.is_available ? 'Mark as Unavailable' : 'Mark as Available'}>
                        <IconButton
                          onClick={() => onAvailabilityAction(slot, 'deactivate')}
                          size="small"
                          color={slot.is_available ? 'warning' : 'success'}
                        >
                          <BlockIcon />
                        </IconButton>
                      </Tooltip>
                      <Tooltip title={hasAppointments ? 'Cannot delete slot with existing appointments' : 'Delete'}>
                        <span>
                          <IconButton
                            onClick={() => onAvailabilityAction(slot, 'delete')}
                            size="small"
                            color="error"
                            disabled={hasAppointments}
                          >
                            <DeleteIcon />
                          </IconButton>
                        </span>
                      </Tooltip>
                    </TableCell>
                  </TableRow>
                );
              })}
              {availability.length === 0 && (
                <TableRow>
                  <TableCell colSpan={8} align="center">
                    No availability scheduled
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </TableContainer>
      )}
    </Box>
  );
};

export default PractitionerSchedule;

PractitionerSchedule.propTypes = {
  practitioners: PropTypes.arrayOf(
    PropTypes.shape({
      id: PropTypes.string.isRequired,
      first_name: PropTypes.string.isRequired,
      last_name: PropTypes.string.isRequired,
      is_active: PropTypes.bool.isRequired
    })
  ).isRequired,
  onEditAvailability: PropTypes.func.isRequired,
  onAvailabilityAction: PropTypes.func.isRequired,
  refreshTrigger: PropTypes.number.isRequired,
  appointmentCounts: PropTypes.object.isRequired,
  services: PropTypes.array.isRequired,
  selectedPractitioner: PropTypes.string.isRequired,
  setSelectedPractitioner: PropTypes.func.isRequired
};
