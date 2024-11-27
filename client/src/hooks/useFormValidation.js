import { useState } from 'react';

// useFormValidation is a custom hook that provides a form validation and submission function
export const useFormValidation = (initialValues, validationRules = {}) => {
    const [values, setValues] = useState(initialValues);
    const [errors, setErrors] = useState({});

    const handleChange = (e) => {
        const { name, value, type, checked } = e.target;
        setValues(prev => ({
            ...prev,
            [name]: type === 'checkbox' ? checked : value
        }));
        
        if (errors[name]) {
            setErrors(prev => ({
                ...prev,
                [name]: ''
            }));
        }
    };

    const handleBlur = (e) => {
        const { name, value } = e.target;
        if (validationRules[name]) {
            const error = validationRules[name](value, values);
            setErrors(prev => ({
                ...prev,
                [name]: error
            }));
        }
    };

    const handleSubmit = async (e, onSubmit) => {
        e.preventDefault();
        
        const formErrors = {};
        let isValid = true;

        if (typeof validationRules === 'object' && !validationRules.isStaffRegistration) {
            Object.keys(values).forEach(field => {
                if (validationRules[field]) {
                    const error = validationRules[field](values[field], values);
                    if (error) {
                        formErrors[field] = error;
                        isValid = false;
                    }
                }
            });
        }

        setErrors(formErrors);

        if (!isValid) {
            return;
        }

        if (onSubmit) {
            await onSubmit(values);
        }
    };

    const resetForm = () => {
        setValues(initialValues);
        setErrors({});
    };

    return {
        values,
        errors,
        handleChange,
        handleBlur,
        handleSubmit,
        resetForm,
        setErrors
    };
};
