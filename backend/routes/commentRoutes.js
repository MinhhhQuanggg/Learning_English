const express = require('express');
const {
    getCommentsByLesson,
    createComment,
    replyComment,
    deleteComment
} = require('../controllers/commentController');
const { protect } = require('../middlewares/auth');

const router = express.Router();

// Route xem commment bài học không cần đăng nhập (tùy bạn chọn)
router.get('/lesson/:lessonId', getCommentsByLesson);

// Các thao tác gửi/xóa yêu cầu đăng nhập
router.use(protect);
router.post('/', createComment);
router.post('/:id/reply', replyComment);
router.delete('/:id', deleteComment);

module.exports = router;
