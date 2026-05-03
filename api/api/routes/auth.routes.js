const express = require('express');
const router = express.Router();
const authController = require('../controllers/auth.controller');

// Standard Email/Password Routes
router.post('/register', authController.register);
router.post('/login', authController.login);

// New Routes for Google Auth and Email Verification
router.post('/google', authController.googleLogin);
router.get('/verify/:token', authController.verifyEmail);

module.exports = router;