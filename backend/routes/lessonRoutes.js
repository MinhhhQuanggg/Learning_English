const express = require('express');
const { getLessons, getLesson, completeLesson } = require('../controllers/lessonController');
const { protect } = require('../middlewares/auth');

const router = express.Router();

// Tất cả các route này yêu cầu đăng nhập
router.use(protect);

router.get('/', getLessons);
router.get('/:id', getLesson);
router.post('/:id/complete', completeLesson);

module.exports = router;
