const auth = async (req, res, next) => {
    try {
      // Check for token in headers
      const token = req.header('Authorization')?.replace('Bearer ', '');
      
      if (!token) {
        throw new Error('No authentication token');
      }
  
      // Verify token
      // Add user to request
      req.user = { id: 'some_user_id_goes_here_placeholder' }; 
  
      next();
    } catch (error) {
      res.status(401).json({ error: 'Please authenticate' });
    }
  };
  
  module.exports = auth;