import { useState, useCallback } from 'react';
import {
  validateEmail,
  validatePassword,
  validatePhone,
  validateConfirmPassword,
  validateRequired,
  validatePostalCode,
} from '@/utils/validation';

export const useFormValidation = (initialValues, options = {}) => {
  const [values, setValues] = useState(initialValues);
  const [errors, setErrors] = useState({});
  const [isSubmitted, setIsSubmitted] = useState(false);

  const validateForm = useCallback(() => {
    const newErrors = {};
    const { isRegistering, isStaffRegistration, isEditing } = options;

    // Basic validations
    newErrors.email = validateEmail(values.email);

    if (isRegistering || isStaffRegistration || isEditing) {
      newErrors.phone = validatePhone(values.phone);
      newErrors.firstName = validateRequired(values.firstName, 'First name');
      newErrors.lastName = validateRequired(values.lastName, 'Last name');
      
      if (values.postalCode) {
        newErrors.postalCode = validatePostalCode(values.postalCode);
      }
      
      // Only validate password for new users
      if (!isEditing && (isRegistering || isStaffRegistration)) {
        newErrors.password = validatePassword(values.password);
      }
      
      // Additional staff validations
      if (isStaffRegistration || (isEditing && values.role === 'practitioner')) {
        if (values.specializations) {
          newErrors.specializations = validateRequired(values.specializations, 'Specializations');
        }
      }
    }

    setErrors(newErrors);
    setIsSubmitted(true);

    return !Object.values(newErrors).some(error => error !== '');
  }, [values, options]);

  const handleSubmit = async (e, onSubmit) => {
    e.preventDefault();
    const isValid = validateForm();
    
    if (isValid && onSubmit) {
      await onSubmit(values);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setValues(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleBlur = (e) => {
    const { name } = e.target;
    if (!isSubmitted) return;

    // Validate the specific field that was blurred
    const newErrors = { ...errors };
    switch (name) {
      case 'email':
        newErrors[name] = validateEmail(values[name]);
        break;
      case 'password':
        newErrors[name] = validatePassword(values[name]);
        break;
      case 'confirmPassword':
        newErrors[name] = validateConfirmPassword(values.password, values[name]);
        break;
      case 'phone':
        newErrors[name] = validatePhone(values[name]);
        break;
      default:
        if (options.isRegistering) {
          newErrors[name] = validateRequired(values[name], name);
        }
    }
    setErrors(newErrors);
  };

  const resetForm = () => {
    setValues(initialValues);
    setErrors({});
    setIsSubmitted(false);
  };

  return {
    values,
    errors,
    handleChange,
    handleBlur,
    handleSubmit,
    validateForm,
    resetForm,
    isSubmitted,
    setErrors,
  };
};
