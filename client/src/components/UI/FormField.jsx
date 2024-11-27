import { TextField } from '@mui/material';
import PropTypes from 'prop-types';

export const FormField = ({
  name,
  label,
  type = 'text',
  value,
  onChange,
  onBlur,
  error,
  required = false,
  ...props
}) => {
  return (
    <TextField
      fullWidth
      name={name}
      label={label}
      type={type}
      value={value || ''}
      onChange={onChange}
      onBlur={onBlur}
      error={Boolean(error)}
      helperText={error || ''}
      required={required}
      margin="normal"
      variant="outlined"
      {...props}
    />
  );
};

export default FormField;

FormField.propTypes = {
  name: PropTypes.string.isRequired,
  label: PropTypes.string.isRequired,
  type: PropTypes.string,
  value: PropTypes.string,
  onChange: PropTypes.func,
  onBlur: PropTypes.func,
  error: PropTypes.string,
  required: PropTypes.bool,
};
