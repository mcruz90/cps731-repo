import { useState } from 'react';
import {   Box, 
 Button, 
 TextField, 
 MenuItem, 
 Typography, 
 Paper,
 Snackbar,
 Alert 
} from '@mui/material';
import { adminService } from '@/services/api/admin';

// TestUserCreator lets admin create users
// This is in place until the admin's user management is implemented with send-email functionality
const TestUserCreator = () => {
 const [email, setEmail] = useState('');
 const [password, setPassword] = useState('');
 const [role, setRole] = useState('practitioner');
 const [message, setMessage] = useState({ text: '', type: 'info' });
 const [open, setOpen] = useState(false);
  const handleSubmit = async (e) => {
   e.preventDefault();
   try {
     await adminService.testManualAddUser(email, password, role);
     setMessage({ text: 'User created successfully!', type: 'success' });
     setOpen(true);
     
     // clear form when the user is successfully created
     setEmail('');
     setPassword('');
   } catch (error) {
     setMessage({ text: error.message, type: 'error' });
     setOpen(true);
   }
 };
  return (
   <Paper sx={{ p: 3, maxWidth: 400, mx: 'auto', mt: 4 }}>
     <Typography variant="h6" gutterBottom>
       Test User Creator
     </Typography>
     <Box component="form" onSubmit={handleSubmit} sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
       <TextField
         label="Email"
         value={email}
         onChange={(e) => setEmail(e.target.value)}
         required
         fullWidth
       />
       <TextField
         label="Password"
         type="password"
         value={password}
         onChange={(e) => setPassword(e.target.value)}
         required
         fullWidth
       />
       <TextField
         select
         label="Role"
         value={role}
         onChange={(e) => setRole(e.target.value)}
         fullWidth
       >
         <MenuItem value="practitioner">Practitioner</MenuItem>
         <MenuItem value="client">Client</MenuItem>
         <MenuItem value="staff">Staff</MenuItem>
         <MenuItem value="admin">Admin</MenuItem>
       </TextField>
       <Button 
         type="submit" 
         variant="contained" 
         color="primary"
         fullWidth
       >
         Create Test User
       </Button>
     </Box>
      <Snackbar 
       open={open} 
       autoHideDuration={6000} 
       onClose={() => setOpen(false)}
     >
       <Alert 
         onClose={() => setOpen(false)} 
         severity={message.type} 
         sx={{ width: '100%' }}
       >
         {message.text}
       </Alert>
     </Snackbar>
   </Paper>
 );
};

export default TestUserCreator;