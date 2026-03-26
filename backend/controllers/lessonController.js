const Lesson = require('../schemas/Lesson');
const Question = require('../schemas/Question');
const User = require('../schemas/User');
const Category = require('../schemas/Category');

// @desc    Lấy danh sách tất cả bài học (có thể lọc theo trình độ)
// @route   GET /api/lessons
exports.getLessons = async (req, res) => {
    try {
        let queryObj = {};

        // Admin xem toàn bộ bài học, không filter theo isActive hay level
        if (req.user && req.user.role === 'admin' && req.query.admin === 'true') {
            // Empty queryObj means get all
        } else {
            queryObj.isActive = true;
            // Ưu tiên level từ query, nếu không có thì lấy level của user đang đăng nhập
            const level = req.query.level || req.user?.level;
            if (level) {
                queryObj.level = level;
            }
        }

        if (req.query.categoryId) {
            queryObj.categoryId = req.query.categoryId;
        }

        const lessons = await Lesson.find(queryObj).sort('order').populate('categoryId', 'name');

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

        const questions = await Question.find({ lessonId: lesson._id });
        const lessonData = lesson.toObject();
        lessonData.questions = questions;

        res.status(200).json({
            success: true,
            data: lessonData
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
            console.log('Lesson completed successfully, XP added.');
        } else {
            console.log('Lesson already completed before.');
        }

        // Xử lý chuỗi ngày (streak) - Tính cả khi học lại
        const today = new Date();
        today.setHours(0, 0, 0, 0);

        if (!user.lastActiveDate) {
            user.streak = 1;
            user.lastActiveDate = today;
        } else {
            const lastActive = new Date(user.lastActiveDate);
            lastActive.setHours(0, 0, 0, 0);

            const diffTime = today - lastActive;
            const diffDays = Math.round(diffTime / (1000 * 60 * 60 * 24));

            if (diffDays === 1) {
                user.streak += 1;
                user.lastActiveDate = today;
            } else if (diffDays > 1) {
                user.streak = 1;
                user.lastActiveDate = today;
            }
        }

        await user.save();

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

// @desc    Lấy danh sách tất cả danh mục bài học
// @route   GET /api/categories
exports.getCategories = async (req, res) => {
    try {
        const categories = await Category.find().sort('order');
        res.status(200).json({
            success: true,
            count: categories.length,
            data: categories
        });
    } catch (error) {
        res.status(400).json({
            success: false,
            message: error.message
        });
    }
};

// @desc    Tạo danh mục mới (Admin)
// @route   POST /api/categories
exports.createCategory = async (req, res) => {
    try {
        const category = await Category.create(req.body);
        res.status(201).json({ success: true, data: category });
    } catch (error) {
        res.status(400).json({ success: false, message: error.message });
    }
};

// @desc    Cập nhật danh mục (Admin)
// @route   PUT /api/categories/:id
exports.updateCategory = async (req, res) => {
    try {
        const category = await Category.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
        if (!category) return res.status(404).json({ success: false, message: 'Không tìm thấy danh mục' });
        res.status(200).json({ success: true, data: category });
    } catch (error) {
        res.status(400).json({ success: false, message: error.message });
    }
};

// @desc    Xóa danh mục (Admin)
// @route   DELETE /api/categories/:id
exports.deleteCategory = async (req, res) => {
    try {
        const category = await Category.findById(req.params.id);
        if (!category) return res.status(404).json({ success: false, message: 'Không tìm thấy danh mục' });
        await category.deleteOne();
        res.status(200).json({ success: true, data: {} });
    } catch (error) {
        res.status(400).json({ success: false, message: error.message });
    }
};

// @desc    Tạo bài học mới
// @route   POST /api/lessons
exports.createLesson = async (req, res) => {
    try {
        const lesson = await Lesson.create(req.body);
        res.status(201).json({ success: true, data: lesson });
    } catch (error) {
        res.status(400).json({ success: false, message: error.message });
    }
};

// @desc    Cập nhật bài học
// @route   PUT /api/lessons/:id
exports.updateLesson = async (req, res) => {
    try {
        const lesson = await Lesson.findByIdAndUpdate(req.params.id, req.body, {
            new: true,
            runValidators: true
        });
        if (!lesson) {
            return res.status(404).json({ success: false, message: 'Không tìm thấy bài học' });
        }
        res.status(200).json({ success: true, data: lesson });
    } catch (error) {
        res.status(400).json({ success: false, message: error.message });
    }
};

// @desc    Xóa bài học
// @route   DELETE /api/lessons/:id
exports.deleteLesson = async (req, res) => {
    try {
        const lesson = await Lesson.findById(req.params.id);
        if (!lesson) {
            return res.status(404).json({ success: false, message: 'Không tìm thấy bài học' });
        }
        await lesson.deleteOne();
        // Xóa cả các câu hỏi thuộc bài học này cho sạch DB
        await Question.deleteMany({ lessonId: req.params.id });

        res.status(200).json({ success: true, data: {} });
    } catch (error) {
        res.status(400).json({ success: false, message: error.message });
    }
};
