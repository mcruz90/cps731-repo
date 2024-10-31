import axios from 'axios';

// Set Authorization header with JWT token
const setAuthToken = (token) => {
    if (token) {
        localStorage.setItem('token', token);
        axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
    } else {
        localStorage.removeItem('token');
        delete axios.defaults.headers.common['Authorization'];
    }
};

// Login function
export const login = async (email, password) => {
    const response = await axios.post('/api/auth/login', { email, password });
    const { token, user } = response.data;
    setAuthToken(token);
    return user;
};

// Logout function
export const logout = () => {
    setAuthToken(null);
};

// Initialize token on app load
const token = localStorage.getItem('token');
if (token) {
    setAuthToken(token);
}
