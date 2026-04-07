const Comment = require('../schemas/Comment');

// @desc    Lấy tất cả bình luận của 1 bài học
// @route   GET /api/comments/lesson/:lessonId
exports.getCommentsByLesson = async (req, res) => {
    try {
        const comments = await Comment.find({ lesson: req.params.lessonId })
            .populate('user', 'fullName avatar')
            .populate('replies.user', 'fullName avatar')
            .sort({ createdAt: -1 });

        res.status(200).json({ success: true, count: comments.length, data: comments });
    } catch (error) {
        res.status(400).json({ success: false, message: error.message });
    }
};

// @desc    Tạo bình luận mới
// @route   POST /api/comments
exports.createComment = async (req, res) => {
    try {
        req.body.user = req.user.id; // Lấy ID từ token đã protect
        const comment = await Comment.create(req.body);

        const populatedComment = await Comment.findById(comment._id).populate('user', 'fullName avatar');

        res.status(201).json({ success: true, data: populatedComment });
    } catch (error) {
        res.status(400).json({ success: false, message: error.message });
    }
};

// @desc    Trả lời bình luận
// @route   POST /api/comments/:id/reply
exports.replyComment = async (req, res) => {
    try {
        const comment = await Comment.findById(req.params.id);

        if (!comment) {
            return res.status(404).json({ success: false, message: 'Không tìm thấy bình luận gốc' });
        }

        const reply = {
            user: req.user.id,
            content: req.body.content
        };

        comment.replies.push(reply);
        await comment.save();

        const updatedComment = await Comment.findById(req.params.id)
            .populate('user', 'fullName avatar')
            .populate('replies.user', 'fullName avatar');

        res.status(200).json({ success: true, data: updatedComment });
    } catch (error) {
        res.status(400).json({ success: false, message: error.message });
    }
};

// @desc    Xóa bình luận (Chủ sở hữu hoặc Admin)
// @route   DELETE /api/comments/:id
exports.deleteComment = async (req, res) => {
    try {
        const comment = await Comment.findById(req.params.id);

        if (!comment) {
            return res.status(404).json({ success: false, message: 'Không tìm thấy bình luận' });
        }

        // Kiểm tra quyền: Phải là chủ comment hoặc admin
        if (comment.user.toString() !== req.user.id && req.user.role.roleName !== 'admin') {
            return res.status(401).json({ success: false, message: 'Bạn không có quyền xóa bình luận này' });
        }

        await comment.deleteOne();

        res.status(200).json({ success: true, message: 'Đã xóa bình luận' });
    } catch (error) {
        res.status(400).json({ success: false, message: error.message });
    }
};
