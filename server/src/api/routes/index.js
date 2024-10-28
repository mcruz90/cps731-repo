const express = require('express');
const v1Routes = require('./v1');

const router = express.Router();

// Version 1 routes
router.use('/v1', v1Routes);

module.exports = router;