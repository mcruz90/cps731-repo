import { Box, Typography, Link as MuiLink } from '@mui/material';
import { Link } from 'react-router-dom';
import RegisterForm from '@/components/UI/RegisterForm';

export default function Register() {
    return (
        <Box sx={{ 
            maxWidth: 600, 
            mx: 'auto', 
            mt: 4, 
            p: 2 
        }}>
            <Typography 
                variant="h4" 
                component="h1" 
                gutterBottom
                textAlign="center"
            >
                Create an Account
            </Typography>
            
            <RegisterForm />
            
            <Box sx={{ 
                mt: 3, 
                textAlign: 'center' 
            }}>
                <Typography variant="body2">
                    Already have an account?{' '}
                    <MuiLink 
                        component={Link} 
                        to="/login"
                        underline="hover"
                    >
                        Sign in
                    </MuiLink>
                </Typography>
            </Box>
        </Box>
    );
}
