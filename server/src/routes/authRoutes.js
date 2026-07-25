const express = require('express');
const router = express.Router();
const rateLimit = require('express-rate-limit');
const AuthController = require('../controllers/AuthController');
const { authenticate } = require('../middlewares/auth');

const loginLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 10, // 10 attempts per IP per window
    message: { error: 'Too many login attempts. Please try again in 15 minutes.' },
    standardHeaders: true,
    legacyHeaders: false
});

router.post('/login', loginLimiter, AuthController.login);
router.get('/me', authenticate, AuthController.getMe);
router.post('/reset-password', authenticate, AuthController.resetPassword);

module.exports = router;
