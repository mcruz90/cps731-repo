import { useEffect, useState } from 'react';
import {
  Typography,
  List,
  CircularProgress,
  Alert,
  Box,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Button,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
} from '@mui/material';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import PortalLayout from '@/components/Layout/PortalLayout';
import { SchedulerSystem } from '@/services/api/scheduler';
import { useAuth } from '@/hooks/useAuth';
import ComposeMessage from './components/messaging/ComposeMessage';
import PropTypes from 'prop-types';

const SessionHistory = ({ practitionerId, clientId }) => {
  const [sessions, setSessions] = useState([]);
  const [loadingSessions, setLoadingSessions] = useState(true);
  const [errorSessions, setErrorSessions] = useState(null);

  useEffect(() => {
    const loadSessions = async () => {
      try {
        const fetchedSessions = await SchedulerSystem.fetchClientAppointments(practitionerId, clientId);
        setSessions(fetchedSessions);
      } catch (error) {
        setErrorSessions(error.message || 'Failed to load session history.');
      } finally {
        setLoadingSessions(false);
      }
    };

    loadSessions();
  }, [practitionerId, clientId]);

  if (loadingSessions) {
    return (
      <Box sx={{ display: "flex", justifyContent: "center", alignItems: "center", mt: 2 }}>
        <CircularProgress />
      </Box>
    );
  }

  if (errorSessions) {
    return (
      <Typography variant="body2" color="error">
        {errorSessions}
      </Typography>
    );
  }

  if (sessions.length === 0) {
    return (
      <Typography variant="body2" color="textSecondary">
        This client has no past sessions.
      </Typography>
    );
  }

  return (
    <TableContainer component={Paper} sx={{ mt: 2 }}>
      <Table>
        <TableHead>
          <TableRow>
            <TableCell>Date</TableCell>
            <TableCell>Time</TableCell>
            <TableCell>Duration</TableCell>
            <TableCell>Status</TableCell>
            <TableCell>Service</TableCell>
            <TableCell>Notes</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {sessions.map((session) => (
            <TableRow key={session.id}>
              <TableCell>{session.date}</TableCell>
              <TableCell>{session.time}</TableCell>
              <TableCell>{session.duration} mins</TableCell>
              <TableCell>{session.status}</TableCell>
              <TableCell>{session.serviceName}</TableCell>
              <TableCell>{session.notes}</TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </TableContainer>
  );
};

SessionHistory.propTypes = {
  practitionerId: PropTypes.string.isRequired,
  clientId: PropTypes.string.isRequired,
};

const Clients = () => {
  const { user } = useAuth();
  const [clients, setClients] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  const [isComposeOpen, setIsComposeOpen] = useState(false);
  const [selectedClient, setSelectedClient] = useState(null);

  useEffect(() => {
    const loadClients = async () => {
      try {
        const fetchedClients = await SchedulerSystem.fetchPractitionerClients(user.id);
        console.log('Fetched Clients:', fetchedClients);
        setClients(fetchedClients);
      } catch (error) {
        setError(error.message || 'Failed to load clients.');
      } finally {
        setLoading(false);
      }
    };

    loadClients();
  }, [user.id]);

  const handleMessage = (client) => {
    setSelectedClient(client);
    setIsComposeOpen(true);
  };

  const handleCloseCompose = () => {
    setSelectedClient(null);
    setIsComposeOpen(false);
  };

  if (loading) {
    return (
      <PortalLayout>
        <Box display="flex" alignItems="center" justifyContent="center" height="100%">
          <CircularProgress />
        </Box>
      </PortalLayout>
    );
  }

  if (error) {
    return (
      <PortalLayout>
        <Box display="flex" alignItems="center" flexDirection="column">
          <Typography variant="h4" component="h1" gutterBottom>
            Clients
          </Typography>
          <Alert severity="error">{error}</Alert>
        </Box>
      </PortalLayout>
    );
  }

  return (
    <PortalLayout>
      <Typography variant="h4" component="h1" gutterBottom>
        Clients
      </Typography>
      {clients.length === 0 ? (
        <Typography>No clients have booked appointments with you yet.</Typography>
      ) : (
        <List>
          {clients.map((client) => (
            <Accordion key={client.id}>
              <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                <Box display="flex" justifyContent="space-between" width="100%" alignItems="center">
                  <Typography>{`${client.firstName} ${client.lastName}`}</Typography>
                  <Button
                    variant="outlined"
                    color="primary"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleMessage(client);
                    }}
                  >
                    Message
                  </Button>
                </Box>
              </AccordionSummary>
              <AccordionDetails>
                <Typography variant="h6" gutterBottom>
                  Session History
                </Typography>
                <SessionHistory practitionerId={user.id} clientId={client.id} />
              </AccordionDetails>
            </Accordion>
          ))}
        </List>
      )}

      {/* Compose Message Modal */}
      <Dialog
        open={isComposeOpen}
        onClose={handleCloseCompose}
        fullWidth
        maxWidth="sm"
      >
        <DialogTitle>
          {selectedClient
            ? `Compose Message to ${selectedClient.firstName} ${selectedClient.lastName}`
            : 'Compose Message'}
        </DialogTitle>
        <DialogContent>
          {selectedClient && (
            <ComposeMessage
              recipients={clients} 
              onMessageSent={handleCloseCompose}
              defaultRecipient={selectedClient}
            />
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseCompose} color="primary">
            Cancel
          </Button>
        </DialogActions>
      </Dialog>
    </PortalLayout>
  );
};

export default Clients;

