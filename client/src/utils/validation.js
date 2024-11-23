export const validateEmail = (email) => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!email) return 'Email is required';
  if (!emailRegex.test(email)) return 'Please enter a valid email address';
  return '';
};

export const validatePassword = (password) => {
  if (!password) return 'Password is required';
  if (password.length < 8) return 'Password must be at least 8 characters long';
  if (!/(?=.*[a-z])/.test(password)) return 'Password must contain at least one lowercase letter';
  if (!/(?=.*[A-Z])/.test(password)) return 'Password must contain at least one uppercase letter';
  if (!/(?=.*\d)/.test(password)) return 'Password must contain at least one number';
  return '';
};

export const validatePhone = (phone) => {
  const phoneRegex = /^\(?([0-9]{3})\)?[-. ]?([0-9]{3})[-. ]?([0-9]{4})$/;
  if (!phone) return 'Phone number is required';
  if (!phoneRegex.test(phone)) return 'Please enter a valid phone number (e.g., 123-456-7890)';
  return '';
};

export const validateConfirmPassword = (password, confirmPassword) => {
  if (!confirmPassword) return 'Please confirm your password';
  if (password !== confirmPassword) return 'Passwords do not match';
  return '';
};

export const validateRequired = (value, fieldName) => {
  if (!value) return `${fieldName} is required`;
  return '';
};

export const validateRole = (role) => {
  const validRoles = ['practitioner', 'staff', 'admin'];
  if (!role) return 'Role is required';
  if (!validRoles.includes(role)) return 'Invalid role selected';
  return '';
};

export const validatePostalCode = (postalCode) => {
  const postalRegex = /^[A-Za-z]\d[A-Za-z][ -]?\d[A-Za-z]\d$/;
  if (!postalCode) return 'Postal code is required';
  if (!postalRegex.test(postalCode)) return 'Please enter a valid postal code (e.g., A1A 1A1)';
  return '';
};

export const validateDate = (date, fieldName = 'Date') => {
  if (!date) return `${fieldName} is required`;
  const selectedDate = new Date(date);
  if (isNaN(selectedDate.getTime())) return 'Please enter a valid date';
  return '';
};