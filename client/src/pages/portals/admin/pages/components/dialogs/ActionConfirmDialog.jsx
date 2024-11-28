import PropTypes from 'prop-types';
import { Dialog, DialogTitle, DialogContent, DialogActions, Button, Typography } from '@mui/material';

// action confirmation dialog for user management (e.g. delete user, deactivate availability, etc)
const ActionConfirmDialog = ({ open, action, item, onClose, onConfirm }) => {
  const getTitle = () => {
    if (action === 'delete') return 'Confirm Deletion';
    if (action === 'deactivate') return item.is_available ? 'Mark as Unavailable' : 'Mark as Available';
    return 'Confirm Action';
  };

  const getContent = () => {
    if (action === 'delete') return 'Are you sure you want to delete this availability slot? This action cannot be undone.';
    if (action === 'deactivate') return item.is_available ? 'Are you sure you want to mark this slot as unavailable?' : 'Are you sure you want to mark this slot as available?';
    return 'Are you sure you want to perform this action?';
  };

  const handleConfirm = () => {
    onConfirm();
  };

  return (
    <Dialog open={open} onClose={onClose}>
      <DialogTitle>{getTitle()}</DialogTitle>
      <DialogContent>
        <Typography>{getContent()}</Typography>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose} color="secondary">Cancel</Button>
        <Button onClick={handleConfirm} variant="contained" color={action === 'delete' ? 'error' : 'primary'}>
          {action === 'delete' ? 'Delete' : 'Confirm'}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default ActionConfirmDialog;

ActionConfirmDialog.propTypes = {
  open: PropTypes.bool.isRequired,
  action: PropTypes.string.isRequired,
  item: PropTypes.object.isRequired,
  onClose: PropTypes.func.isRequired,
  onConfirm: PropTypes.func.isRequired
};
