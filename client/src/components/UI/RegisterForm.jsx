import { useState } from 'react';
import { useNavigate } from 'react-router-dom';

// UI-related imports
import { Button, Alert } from '@mui/material';
import Grid from '@mui/material/Grid2';
import FormField from '@/components/UI/FormField';

// Form validation hook
import { useFormValidation } from '@/hooks/useFormValidation';

// authentication API service
import { authService } from '@/services/api/auth';


// set empty initial values for the form fields
const initialValues = {
    email: '',
    password: '',
    confirmPassword: '',
    first_name: '',
    last_name: '',
    phone: '',
    address: '',
    city: '',
    province: '',
    postal_code: '',
};

// Register form component to handle the registration of a new user
const RegisterForm = () => {
    const navigate = useNavigate();
    const [registrationError, setRegistrationError] = useState('');
    const {
        values,
        errors,
        handleChange,
        handleBlur,
        handleSubmit,
    } = useFormValidation(initialValues, { isRegistering: true });

    // onSubmit function to handle the registration of a new user
    const onSubmit = async (formValues) => {
        try {
            setRegistrationError('');
            const result = await authService.register(formValues);
            
            if (result?.user) {
                navigate('/client');
            }
        } catch (err) {
            console.error('Registration error:', err);
            setRegistrationError(err.message || 'Registration failed. Please try again.');
        }
    };

    return (
        <form onSubmit={(e) => handleSubmit(e, onSubmit)}>
            {registrationError && (
                <Alert severity="error" sx={{ mb: 2 }}>
                    {registrationError}
                </Alert>
            )}
            
            <Grid container spacing={2}>
                <Grid item xs={12}>
                    <FormField
                        name="email"
                        label="Email"
                        value={values.email}
                        onChange={handleChange}
                        onBlur={handleBlur}
                        error={errors.email}
                        required
                    />
                </Grid>
                <Grid item xs={12}>
                    <FormField
                        name="password"
                        label="Password"
                        type="password"
                        value={values.password}
                        onChange={handleChange}
                        onBlur={handleBlur}
                        error={errors.password}
                        required
                    />
                </Grid>
                <Grid item xs={12}>
                    <FormField
                        name="confirmPassword"
                        label="Confirm Password"
                        type="password"
                        value={values.confirmPassword}
                        onChange={handleChange}
                        onBlur={handleBlur}
                        error={errors.confirmPassword}
                        required
                    />
                </Grid>
                <Grid item xs={12} sm={6}>
                    <FormField
                        name="first_name"
                        label="First Name"
                        value={values.first_name}
                        onChange={handleChange}
                        onBlur={handleBlur}
                        error={errors.first_name}
                        required
                    />
                </Grid>
                <Grid item xs={12} sm={6}>
                    <FormField
                        name="last_name"
                        label="Last Name"
                        value={values.last_name}
                        onChange={handleChange}
                        onBlur={handleBlur}
                        error={errors.last_name}
                        required
                    />
                </Grid>
                <Grid item xs={12}>
                    <FormField
                        name="phone"
                        label="Phone Number"
                        value={values.phone}
                        onChange={handleChange}
                        onBlur={handleBlur}
                        error={errors.phone}
                        required
                    />
                </Grid>
                <Grid item xs={12}>
                    <FormField
                        name="address"
                        label="Address"
                        value={values.address}
                        onChange={handleChange}
                        onBlur={handleBlur}
                        error={errors.address}
                        required
                    />
                </Grid>
                <Grid item xs={12} sm={6}>
                    <FormField
                        name="city"
                        label="City"
                        value={values.city}
                        onChange={handleChange}
                        onBlur={handleBlur}
                        error={errors.city}
                        required
                    />
                </Grid>
                <Grid item xs={12} sm={6}>
                    <FormField
                        name="province"
                        label="Province"
                        value={values.province}
                        onChange={handleChange}
                        onBlur={handleBlur}
                        error={errors.province}
                        required
                    />
                </Grid>
                <Grid item xs={12}>
                    <FormField
                        name="postal_code"
                        label="Postal Code"
                        value={values.postal_code}
                        onChange={handleChange}
                        onBlur={handleBlur}
                        error={errors.postal_code}
                        required
                    />
                </Grid>
                <Grid item xs={12}>
                    <Button 
                        type="submit" 
                        variant="contained" 
                        color="primary"
                        fullWidth
                    >
                        Register
                    </Button>
                </Grid>
            </Grid>
        </form>
    );
};

export default RegisterForm;