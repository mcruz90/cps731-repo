const express = require('express');
const authRoutes = require('./auth');
const appointmentRoutes = require('./appointments');
const userRoutes = require('./users');
const productRoutes = require('./products');
const reportRoutes = require('./reports');

const router = express.Router();

// Mount each route module
router.use('/auth', authRoutes);
router.use('/appointments', appointmentRoutes);
router.use('/users', userRoutes);
router.use('/products', productRoutes);
router.use('/reports', reportRoutes);

module.exports = router;