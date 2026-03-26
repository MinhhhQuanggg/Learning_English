const express = require('express');
const { getLessons, getLesson, completeLesson, createLesson, updateLesson, deleteLesson } = require('../controllers/lessonController');
const { protect, authorize } = require('../middlewares/auth');

const router = express.Router();

// Tất cả các route này yêu cầu đăng nhập
router.use(protect);

router.get('/', getLessons);
router.get('/:id', getLesson);
router.post('/:id/complete', completeLesson);

// Admin routes
router.post('/', authorize('admin'), createLesson);
router.put('/:id', authorize('admin'), updateLesson);
router.delete('/:id', authorize('admin'), deleteLesson);

module.exports = router;
