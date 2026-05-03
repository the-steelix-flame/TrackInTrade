// src/api/routes/admin.routes.js
const express = require('express');
const router = express.Router();
const adminController = require('../controllers/admin.controller');
const authMiddleware = require('../middlewares/auth.middleware');
const adminMiddleware = require('../middlewares/admin.middleware');

// Protect all admin routes with auth AND admin middlewares
router.use(authMiddleware, adminMiddleware);

router.get('/stats', adminController.getPlatformStats);
router.get('/users', adminController.getAllUsers);
router.delete('/users/:userId', adminController.deleteUser);

module.exports = router;