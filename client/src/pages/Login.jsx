import { useState } from 'react';
import { 
    Box, 
    Button, 
    CircularProgress, 
    Alert,
    AlertTitle,
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    Link as MuiLink,
    Typography,
} from '@mui/material';
import { Link } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { useNavigate } from 'react-router-dom';
import PropTypes from 'prop-types';
import { useFormValidation } from '@/hooks/useFormValidation';
import { FormField } from '@/components/UI/FormField';
import { authService } from '@/services/api/auth';

const validationRules = {
    email: (value) => {
        if (!value) return 'Email is required';
        if (!/\S+@\S+\.\S+/.test(value)) return 'Invalid email format';
        return '';
    },
    password: (value) => {
        if (!value) return 'Password is required';
        return '';
    }
};

export default function Login() {
    console.log('Login component rendering');

    const navigate = useNavigate();
    const { login, error: authError, loadingState } = useAuth();
    const [resetDialogOpen, setResetDialogOpen] = useState(false);
    const [resetEmail, setResetEmail] = useState('');
    const [resetStatus, setResetStatus] = useState({ success: false, error: null });
    const [isResetting, setIsResetting] = useState(false);

    const {
        values,
        errors,
        handleChange,
        handleBlur,
        setErrors
    } = useFormValidation({
        email: '',
        password: '',
    }, validationRules);

    const handleLoginSubmit = async (e) => {
        e.preventDefault();
        
        // Validate form fields
        let hasErrors = false;
        const newErrors = {};
        
        if (!values.email) {
            newErrors.email = 'Email is required';
            hasErrors = true;
        } else if (!/\S+@\S+\.\S+/.test(values.email)) {
            newErrors.email = 'Invalid email format';
            hasErrors = true;
        }
        
        if (!values.password) {
            newErrors.password = 'Password is required';
            hasErrors = true;
        }
        
        if (hasErrors) {
            setErrors(newErrors);
            return;
        }
        
        try {
            const result = await login(values.email, values.password);
            if (result?.user) {
                const profile = await authService.getUserRoleById(result.user.id);

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
        } catch (err) {
            console.error('Login error:', err);
            setErrors(prev => ({
                ...prev,
                form: err.message
            }));
        }
    };

    const handleResetPassword = async (e) => {
        e.preventDefault();
        setIsResetting(true);
        setResetStatus({ success: false, error: null });

        try {
            await authService.resetPassword(resetEmail);
            setResetStatus({ 
                success: true, 
                error: null 
            });
           
        } catch (err) {
            console.error('Password reset error:', err);
            setResetStatus({ 
                success: false, 
                error: err.message || 'Failed to send reset email' 
            });
        } finally {
            setIsResetting(false);
        }
    };

    const handleCloseResetDialog = () => {
        setResetDialogOpen(false);
        setResetEmail('');
        setResetStatus({ success: false, error: null });
    };

    return (
        <Box sx={{ maxWidth: 600, mx: 'auto', mt: 4, p: 2 }}>
            <Typography 
                variant="h4" 
                component="h1" 
                gutterBottom
                textAlign="center"
            >
                Sign In
            </Typography>

            {authError && (
                <Alert severity="error" sx={{ mb: 2 }}>
                    <AlertTitle>Login Failed</AlertTitle>
                    Invalid email or password
                </Alert>
            )}

            <Box 
                component="form" 
                onSubmit={handleLoginSubmit}
                sx={{ 
                    display: 'flex', 
                    flexDirection: 'column', 
                    gap: 2 
                }}
            >
                <FormField
                    name="email"
                    label="Email"
                    value={values.email}
                    onChange={handleChange}
                    onBlur={handleBlur}
                    error={errors.email}
                    type="email"
                    required
                />

                <FormField
                    name="password"
                    label="Password"
                    value={values.password}
                    onChange={handleChange}
                    onBlur={handleBlur}
                    error={errors.password}
                    type="password"
                    required
                />

                <Box sx={{ 
                    display: 'flex', 
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    mt: 1,
                    mb: 2
                }}>
                    <MuiLink
                        component={Link}
                        variant="body2"
                        onClick={(e) => {
                            e.preventDefault();
                            setResetDialogOpen(true);
                        }}
                    >
                        Forgot Password?
                    </MuiLink>
                </Box>

                <Button 
                    type="submit" 
                    variant="contained" 
                    color="primary"
                    fullWidth
                    disabled={loadingState.login}
                    sx={{ 
                        mt: 2,
                        position: 'relative',
                        '&.Mui-disabled': {
                            backgroundColor: 'action.disabledBackground'
                        }
                    }}
                >
                    {loadingState.login ? (
                        <CircularProgress size={24} color="inherit" />
                    ) : (
                        'Login'
                    )}
                </Button>
            </Box>

            <Box sx={{ 
                mt: 3, 
                textAlign: 'center' 
            }}>
                <Typography variant="body2">
                    Don&apos;t have an account?{' '}
                    <MuiLink 
                        component={Link} 
                        to="/register"
                        underline="hover"
                    >
                        Sign up
                    </MuiLink>
                </Typography>
            </Box>

            {/* Password Reset Dialog */}
            <Dialog 
                open={resetDialogOpen} 
                onClose={handleCloseResetDialog}
                maxWidth="sm"
                fullWidth
            >
                <DialogTitle>
                    Reset Password
                </DialogTitle>
                <DialogContent>
                    {resetStatus.error && (
                        <Alert severity="error" sx={{ mb: 2 }}>
                            {resetStatus.error}
                        </Alert>
                    )}
                    {resetStatus.success ? (
                        <Alert severity="success" sx={{ mb: 2 }}>
                            We have sent password reset instructions to the email provided, if it is associated with an account.
                        </Alert>
                    ) : (
                        <Box component="form" onSubmit={handleResetPassword}>
                            <FormField
                                name="resetEmail"
                                label="Email"
                                type="email"
                                value={resetEmail}
                                onChange={(e) => setResetEmail(e.target.value)}
                                required
                                autoFocus
                            />
                        </Box>
                    )}
                </DialogContent>
                <DialogActions>
                    <Button onClick={handleCloseResetDialog}>
                        {resetStatus.success ? 'Close' : 'Cancel'}
                    </Button>
                    {!resetStatus.success && (
                        <Button 
                            onClick={handleResetPassword}
                            disabled={isResetting}
                            variant="contained"
                        >
                            {isResetting ? (
                                <CircularProgress size={24} color="inherit" />
                            ) : (
                                'Send Reset Link'
                            )}
                        </Button>
                    )}
                </DialogActions>
            </Dialog>
        </Box>
    );
}

Login.propTypes = {
    redirectTo: PropTypes.string,
};