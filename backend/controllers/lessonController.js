const Lesson = require('../schemas/Lesson');
const User = require('../schemas/User');

// @desc    Lấy danh sách tất cả bài học (có thể lọc theo trình độ)
// @route   GET /api/lessons
exports.getLessons = async (req, res) => {
    try {
        let query;

        // Ưu tiên level từ query, nếu không có thì lấy level của user đang đăng nhập
        const level = req.query.level || (req.user ? req.user.level : null);

        let queryObj = { isActive: true };
        if (level) {
            queryObj.level = level;
        }

        const lessons = await Lesson.find(queryObj).sort('order');

        res.status(200).json({
            success: true,
            count: lessons.length,
            data: lessons
        });
    } catch (error) {
        res.status(400).json({
            success: false,
            message: error.message
        });
    }
};

// @desc    Lấy chi tiết một bài học
// @route   GET /api/lessons/:id
exports.getLesson = async (req, res) => {
    try {
        const lesson = await Lesson.findById(req.params.id);

        if (!lesson) {
            return res.status(404).json({
                success: false,
                message: 'Không tìm thấy bài học'
            });
        }

        res.status(200).json({
            success: true,
            data: lesson
        });
    } catch (error) {
        res.status(400).json({
            success: false,
            message: error.message
        });
    }
};

// @desc    Ghi nhận hoàn thành bài học và cộng XP
// @route   POST /api/lessons/:id/complete
exports.completeLesson = async (req, res) => {
    try {
        console.log('Completing lesson:', req.params.id);
        console.log('User ID:', req.user.id);

        const lesson = await Lesson.findById(req.params.id);
        if (!lesson) {
            return res.status(404).json({ success: false, message: 'Không tìm thấy bài học' });
        }

        const user = await User.findById(req.user.id);
        if (!user) {
            return res.status(404).json({ success: false, message: 'Không tìm thấy người dùng' });
        }

        // Kiểm tra xem bài học đã hoàn thành chưa
        const isAlreadyCompleted = user.completedLessons && user.completedLessons.some(
            (cl) => cl.lesson && cl.lesson.toString() === lesson._id.toString()
        );

        if (!isAlreadyCompleted) {
            user.xp += lesson.xpAwarded || 10;
            user.completedLessons.push({
                lesson: lesson._id,
                completedAt: Date.now()
            });
            await user.save();
            console.log('Lesson completed successfully, XP added.');
        } else {
            console.log('Lesson already completed before.');
        }

        res.status(200).json({
            success: true,
            message: isAlreadyCompleted ? 'Bài học đã ghi nhận trước đó' : 'Chúc mừng! Bạn đã hoàn thành bài học',
            xpAwarded: isAlreadyCompleted ? 0 : lesson.xpAwarded,
            totalXp: user.xp
        });
    } catch (error) {
        console.error('Error in completeLesson:', error);
        res.status(400).json({ success: false, message: error.message });
    }
};
