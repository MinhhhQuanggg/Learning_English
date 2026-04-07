const DailyTask = require('../schemas/DailyTask');
const Achievement = require('../schemas/Achievement');
const User = require('../schemas/User');

// @desc    Lấy danh sách nhiệm vụ hàng ngày của người dùng
// @route   GET /api/gamification/daily-tasks
exports.getDailyTasks = async (req, res) => {
    try {
        const tasks = await DailyTask.find({ user: req.user.id })
            .sort({ createdAt: -1 });

        res.status(200).json({ success: true, data: tasks });
    } catch (error) {
        res.status(400).json({ success: false, message: error.message });
    }
};

// @desc    Cập nhật tiến độ nhiệm vụ
// @route   PUT /api/gamification/daily-tasks/:id/progress
exports.updateTaskProgress = async (req, res) => {
    try {
        const { progress } = req.body;
        const task = await DailyTask.findById(req.params.id);

        if (!task || task.user.toString() !== req.user.id) {
            return res.status(404).json({ success: false, message: 'Nhiệm vụ không tồn tại' });
        }

        task.progress += progress;
        if (task.progress >= task.target) {
            task.progress = task.target;
            task.isCompleted = true;
        }

        await task.save();

        res.status(200).json({ success: true, data: task });
    } catch (error) {
        res.status(400).json({ success: false, message: error.message });
    }
};

// @desc    Nhận thưởng XP từ nhiệm vụ đã hoàn thành
// @route   POST /api/gamification/daily-tasks/:id/claim
exports.claimTask = async (req, res) => {
    try {
        const task = await DailyTask.findById(req.params.id);

        if (!task || task.user.toString() !== req.user.id) {
            return res.status(404).json({ success: false, message: 'Nhiệm vụ không tồn tại' });
        }

        if (task.progress < task.target) {
            return res.status(400).json({ success: false, message: 'Nhiệm vụ chưa hoàn thành' });
        }

        if (task.isClaimed) {
            return res.status(400).json({ success: false, message: 'Nhiệm vụ này đã được nhận thưởng' });
        }

        const user = await User.findById(req.user.id);
        user.xp += task.xpReward || 50;

        task.isClaimed = true;

        await user.save();
        await task.save();

        res.status(200).json({
            success: true,
            message: 'Nhận thưởng thành công',
            xpAwarded: task.xpReward,
            totalXp: user.xp
        });
    } catch (error) {
        res.status(400).json({ success: false, message: error.message });
    }
};

// @desc    Lấy tất cả thành tựu/huy hiệu
// @route   GET /api/gamification/achievements
exports.getAchievements = async (req, res) => {
    try {
        const achievements = await Achievement.find();
        res.status(200).json({ success: true, data: achievements });
    } catch (error) {
        res.status(400).json({ success: false, message: error.message });
    }
};

// @desc    Tạo thành tựu mới (Admin)
// @route   POST /api/gamification/achievements
exports.createAchievement = async (req, res) => {
    try {
        const achievement = await Achievement.create(req.body);
        res.status(201).json({ success: true, data: achievement });
    } catch (error) {
        res.status(400).json({ success: false, message: error.message });
    }
};
