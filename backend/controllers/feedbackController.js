const Feedback = require('../schemas/Feedback');

// @desc    Gửi góp ý hoặc báo lỗi mới
// @route   POST /api/feedback
exports.createFeedback = async (req, res) => {
    try {
        req.body.user = req.user.id;
        const feedback = await Feedback.create(req.body);

        res.status(201).json({ success: true, data: feedback });
    } catch (error) {
        res.status(400).json({ success: false, message: error.message });
    }
};

// @desc    Lấy tất cả feedback (Chỉ dành cho Admin)
// @route   GET /api/feedback
exports.getAllFeedbacks = async (req, res) => {
    try {
        const feedbacks = await Feedback.find()
            .populate('user', 'fullName email')
            .sort({ createdAt: -1 });

        res.status(200).json({ success: true, count: feedbacks.length, data: feedbacks });
    } catch (error) {
        res.status(400).json({ success: false, message: error.message });
    }
};

// @desc    Cập nhật trạng thái feedback (Admin duyệt)
// @route   PUT /api/feedback/:id/status
exports.updateFeedbackStatus = async (req, res) => {
    try {
        const feedback = await Feedback.findById(req.params.id);

        if (!feedback) {
            return res.status(404).json({ success: false, message: 'Không tìm thấy feedback' });
        }

        feedback.status = req.body.status;
        await feedback.save();

        res.status(200).json({ success: true, data: feedback });
    } catch (error) {
        res.status(400).json({ success: false, message: error.message });
    }
};

// @desc    Xóa feedback
// @route   DELETE /api/feedback/:id
exports.deleteFeedback = async (req, res) => {
    try {
        const feedback = await Feedback.findById(req.params.id);

        if (!feedback) {
            return res.status(404).json({ success: false, message: 'Không tìm thấy feedback' });
        }

        await feedback.deleteOne();

        res.status(200).json({ success: true, message: 'Đã xóa feedback' });
    } catch (error) {
        res.status(400).json({ success: false, message: error.message });
    }
};
