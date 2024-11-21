import PropTypes from 'prop-types';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Typography
} from '@mui/material';

const ActionConfirmDialog = ({ open, action, user, onClose, onConfirm }) => {
  const getActionText = () => {
    if (action === 'deactivate') {
      return user?.is_active ? 'deactivate' : 'activate';
    }
    return action;
  };

  return (
    <Dialog open={open} onClose={onClose}>
      <DialogTitle>
        Confirm {getActionText()}
      </DialogTitle>
      <DialogContent>
        <Typography>
          Are you sure you want to {getActionText()} user {user?.first_name} {user?.last_name}?
        </Typography>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Cancel</Button>
        <Button 
          onClick={onConfirm} 
          color="error" 
          variant="contained"
        >
          Confirm
        </Button>
      </DialogActions>
    </Dialog>
  );
};

ActionConfirmDialog.propTypes = {
  open: PropTypes.bool.isRequired,
  action: PropTypes.string,
  user: PropTypes.object,
  onClose: PropTypes.func.isRequired,
  onConfirm: PropTypes.func.isRequired
};

export default ActionConfirmDialog;