const express = require('express');
const { register, login, verifyEmail, getMe, resendOTP, updateProfile, getLeaderboard, uploadAvatar } = require('../controllers/authController');
const { protect } = require('../middlewares/auth');
const upload = require('../utils/upload');

const router = express.Router();

router.post('/register', register);
router.post('/verify-email', verifyEmail);
router.post('/resend-otp', resendOTP);
router.post('/login', login);
router.get('/me', protect, getMe);
router.put('/update-profile', protect, updateProfile);
router.post('/upload-avatar', protect, upload.single('avatar'), uploadAvatar);
router.get('/leaderboard', protect, getLeaderboard);

module.exports = router;
