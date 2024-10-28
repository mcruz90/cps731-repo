const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const routes = require('./src/api/routes');

// Load environment variables
dotenv.config();

const app = express();
const port = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());

// Routes
app.use('/api', routes);

// Legacy PHP proxy (during migration)
if (process.env.USE_LEGACY_PHP) {
  const { createProxyMiddleware } = require('http-proxy-middleware');
  app.use('/legacy-php', createProxyMiddleware({
    target: process.env.PHP_SERVER_URL || 'http://localhost:8000',
    changeOrigin: true
  }));
}

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).send('Something broke!');
});

// Start server
app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});

// Handle unhandled promise rejections
process.on('unhandledRejection', (err) => {
  console.log('Unhandled Rejection:', err);
});