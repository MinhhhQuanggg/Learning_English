const express = require('express');
const { register, login, verifyEmail, getMe, resendOTP, updateProfile, getLeaderboard, uploadAvatar, getAllUsers, getUser, updateUser, deleteUser, changePassword } = require('../controllers/authController');
const { protect, authorize } = require('../middlewares/auth');
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
router.put('/change-password', protect, changePassword);

// Admin routes
router.get('/users', protect, authorize('admin'), getAllUsers);
router.get('/users/:id', protect, authorize('admin'), getUser);
router.put('/users/:id', protect, authorize('admin'), updateUser);
router.delete('/users/:id', protect, authorize('admin'), deleteUser);

module.exports = router;
