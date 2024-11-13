import { useState } from 'react';
import { 
    Box, 
    TextField, 
    Button, 
    CircularProgress, 
    Tabs,
    Tab,
    Alert,
} from '@mui/material';
import Grid from '@mui/material/Grid2';
import { useAuth } from '@/hooks/useAuth';
import { useNavigate } from 'react-router-dom';
import PropTypes from 'prop-types';
import { supabase } from '@/services/api';

export default function Login() {
    console.log('Login component rendering');

    const navigate = useNavigate();
    const { login, error, loadingState } = useAuth();
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [formErrors, setFormErrors] = useState({});
    const [isRegistering, setIsRegistering] = useState(false);
    const [registrationData, setRegistrationData] = useState({
        firstName: '',
        lastName: '',
        phone: '',
        address: '',
        city: '',
        province: '',
        postalCode: ''
    });

    const validateForm = () => {
        const errors = {};
        if (!email) {
            errors.email = 'Email is required';
        } else if (!/\S+@\S+\.\S+/.test(email)) {
            errors.email = 'Email is invalid';
        }
        if (!password) {
            errors.password = 'Password is required';
        }
        if (isRegistering) {
            if (!confirmPassword) {
                errors.confirmPassword = 'Please confirm your password';
            } else if (password !== confirmPassword) {
                errors.confirmPassword = 'Passwords do not match';
            }
        }
        setFormErrors(errors);
        return Object.keys(errors).length === 0;
    };

    const validateRegistrationForm = () => {
        const errors = {};
        if (!email) errors.email = 'Email is required';
        if (!password) errors.password = 'Password is required';
        if (password !== confirmPassword) {
            errors.confirmPassword = 'Passwords do not match';
        }
        if (isRegistering) {
            if (!registrationData.firstName) errors.firstName = 'First name is required';
            if (!registrationData.lastName) errors.lastName = 'Last name is required';
            if (!registrationData.phone) errors.phone = 'Phone number is required';
            if (!registrationData.address) errors.address = 'Address is required';
            if (!registrationData.city) errors.city = 'City is required';
            if (!registrationData.province) errors.province = 'Province is required';
            if (!registrationData.postalCode) errors.postalCode = 'Postal code is required';
        }
        setFormErrors(errors);
        return Object.keys(errors).length === 0;
    };

    const handleLogin = async (e) => {
        e.preventDefault();
        if (!validateForm()) return;

        try {
            const result = await login(email, password);
            if (result?.user) {
                // Check user role and navigate accordingly
                const { data: profile } = await supabase
                    .from('profiles')
                    .select('role')
                    .eq('id', result.user.id)
                    .single();

                // Navigate based on role to the appropriate portal
                switch (profile?.role) {
                    case 'client':
                        navigate('/client');
                        break;
                    case 'practitioner':
                        navigate('/practitioner');
                        break;
                    case 'admin':
                        navigate('/admin');
                        break;
                    case 'staff':
                        navigate('/staff');
                        break;
                    default:
                        navigate('/');
                }
            }
        } catch (error) {
            setFormErrors(prev => ({
                ...prev,
                password: error.message.includes('credentials') ? 'Invalid email or password' : '',
                email: error.message.includes('not found') ? 'User not found' : ''
            }));
        }
    };

    const handleRegister = async (e) => {
        e.preventDefault();
        if (!validateRegistrationForm()) return;

        try {
            // First, sign up the user
            const { data: authData, error: signUpError } = await supabase.auth.signUp({
                email,
                password,
                options: {
                    data: {
                        role: 'client'
                    }
                }
            });

            if (signUpError) throw signUpError;

            // Then create their profile with the registration data
            if (authData?.user) {
                const { error: profileError } = await supabase
                    .from('profiles')
                    .insert([
                        {
                            id: authData.user.id,
                            first_name: registrationData.firstName,
                            last_name: registrationData.lastName,
                            phone: registrationData.phone,
                            address: registrationData.address,
                            city: registrationData.city,
                            province: registrationData.province,
                            postal_code: registrationData.postalCode,
                            role: 'client'
                        }
                    ]);

                if (profileError) throw profileError;

                // Navigate to success or login page
                navigate('/client');
            }
        } catch (error) {
            console.error('Registration error:', error);
            setFormErrors(prev => ({
                ...prev,
                submit: error.message
            }));
        }
    };

    return (
        <Box sx={{ maxWidth: 600, mx: 'auto', mt: 4, p: 2 }}>
            {error && (
                <Alert severity="error" sx={{ mb: 2 }}>
                    {error}
                </Alert>
            )}
            
            <Tabs
                value={isRegistering ? 1 : 0}
                onChange={(_, newValue) => {
                    setIsRegistering(!!newValue);
                    setFormErrors({});
                    setEmail('');
                    setPassword('');
                    setConfirmPassword('');
                }}
                sx={{ mb: 2 }}
            >
                <Tab label="Login" />
                <Tab label="Register" />
            </Tabs>

            <Box 
                component="form" 
                onSubmit={isRegistering ? handleRegister : handleLogin}
                sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}
            >
                <TextField 
                    label="Email" 
                    variant="outlined" 
                    fullWidth 
                    value={email}
                    onChange={(e) => {
                        setEmail(e.target.value);
                        if (formErrors.email) {
                            setFormErrors(prev => ({ ...prev, email: '' }));
                        }
                    }}
                    margin="normal"
                    disabled={loadingState.login}
                    error={!!formErrors.email}
                    helperText={formErrors.email}
                    type="email"
                    required
                    autoComplete="email"
                />
                
                <TextField 
                    label="Password" 
                    variant="outlined" 
                    fullWidth 
                    type="password"
                    value={password}
                    onChange={(e) => {
                        setPassword(e.target.value);
                        if (formErrors.password) {
                            setFormErrors(prev => ({ ...prev, password: '' }));
                        }
                    }}
                    margin="normal"
                    disabled={loadingState.login}
                    error={!!formErrors.password}
                    helperText={formErrors.password}
                    required
                    autoComplete="current-password"
                />
                
                {isRegistering && (
                    <TextField 
                        label="Confirm Password" 
                        variant="outlined" 
                        fullWidth 
                        type="password"
                        value={confirmPassword}
                        onChange={(e) => {
                            setConfirmPassword(e.target.value);
                            if (formErrors.confirmPassword) {
                                setFormErrors(prev => ({ ...prev, confirmPassword: '' }));
                            }
                        }}
                        margin="normal"
                        disabled={loadingState.login}
                        error={!!formErrors.confirmPassword}
                        helperText={formErrors.confirmPassword}
                        required
                        autoComplete="new-password"
                    />
                )}

                {isRegistering && (
                    <Grid container spacing={2}>
                        <Grid item xs={12} sm={6}>
                            <TextField 
                                label="First Name"
                                fullWidth
                                value={registrationData.firstName}
                                onChange={(e) => setRegistrationData(prev => ({
                                    ...prev,
                                    firstName: e.target.value
                                }))}
                                error={!!formErrors.firstName}
                                helperText={formErrors.firstName}
                                required
                            />
                        </Grid>
                        <Grid item xs={12} sm={6}>
                            <TextField 
                                label="Last Name"
                                fullWidth
                                value={registrationData.lastName}
                                onChange={(e) => setRegistrationData(prev => ({
                                    ...prev,
                                    lastName: e.target.value
                                }))}
                                error={!!formErrors.lastName}
                                helperText={formErrors.lastName}
                                required
                            />
                        </Grid>
                        <Grid item xs={12} sm={6}>
                            <TextField 
                                label="Phone"
                                fullWidth
                                value={registrationData.phone}
                                onChange={(e) => setRegistrationData(prev => ({
                                    ...prev,
                                    phone: e.target.value
                                }))}
                                error={!!formErrors.phone}
                                helperText={formErrors.phone}
                                required
                            />
                        </Grid>
                        <Grid item xs={12} sm={6}>
                            <TextField 
                                label="Address"
                                fullWidth
                                value={registrationData.address}
                                onChange={(e) => setRegistrationData(prev => ({
                                    ...prev,
                                    address: e.target.value
                                }))}
                                error={!!formErrors.address}
                                helperText={formErrors.address}
                                required
                            />
                        </Grid>
                        <Grid item xs={12} sm={6}>
                            <TextField 
                                label="City"
                                fullWidth
                                value={registrationData.city}
                                onChange={(e) => setRegistrationData(prev => ({
                                    ...prev,
                                    city: e.target.value
                                }))}
                                error={!!formErrors.city}
                                helperText={formErrors.city}
                                required
                            />
                        </Grid>
                        <Grid item xs={12} sm={6}>
                            <TextField 
                                label="Province"
                                fullWidth
                                value={registrationData.province}
                                onChange={(e) => setRegistrationData(prev => ({
                                    ...prev,
                                    province: e.target.value
                                }))}
                                error={!!formErrors.province}
                                helperText={formErrors.province}
                                required
                            />
                        </Grid>
                        <Grid item xs={12} sm={6}>
                            <TextField 
                                label="Postal Code"
                                fullWidth
                                value={registrationData.postalCode}
                                onChange={(e) => setRegistrationData(prev => ({
                                    ...prev,
                                    postalCode: e.target.value
                                }))}
                                error={!!formErrors.postalCode}
                                helperText={formErrors.postalCode}
                                required
                            />
                        </Grid>
                    </Grid>
                )}

                <Button 
                    type="submit" 
                    variant="contained" 
                    color="primary"
                    fullWidth
                    disabled={loadingState.login || loadingState.profile}
                    sx={{ mt: 2 }}
                >
                    {loadingState.login ? (
                        <CircularProgress size={24} color="inherit" />
                    ) : loadingState.profile ? (
                        'Loading Profile...'
                    ) : (
                        isRegistering ? 'Register' : 'Login'
                    )}
                </Button>
            </Box>
        </Box>
    );
}

Login.propTypes = {
    redirectTo: PropTypes.string,
};