const express = require('express');
const {
    createFeedback,
    getAllFeedbacks,
    updateFeedbackStatus,
    deleteFeedback
} = require('../controllers/feedbackController');
const { protect, authorize } = require('../middlewares/auth');

const router = express.Router();

router.use(protect); // Tất cả các route yêu cầu đăng nhập

// User gửi feedback
router.post('/', createFeedback);

// Admin quản lý feedback
router.get('/', authorize('admin'), getAllFeedbacks);
router.put('/:id/status', authorize('admin'), updateFeedbackStatus);
router.delete('/:id', authorize('admin'), deleteFeedback);

module.exports = router;
