const DailyTask = require('../schemas/DailyTask');

/**
 * Kiểm tra và tạo nhiệm vụ mới cho người dùng nếu là ngày mới
 */
exports.checkAndGenerateDailyTasks = async (userId) => {
    try {
        const today = new Date();
        today.setHours(0, 0, 0, 0);

        // Tìm các nhiệm vụ của hôm nay
        const existingTasks = await DailyTask.find({
            user: userId,
            date: { $gte: today }
        });

        if (existingTasks.length === 0) {
            // Tạo 3 nhiệm vụ mặc định
            const defaultTasks = [
                {
                    user: userId,
                    title: 'Hoàn thành 1 bài học bất kỳ',
                    target: 1,
                    xpReward: 50,
                    date: today
                },
                {
                    user: userId,
                    title: 'Lưu 3 từ vựng mới vào sổ tay',
                    target: 3,
                    xpReward: 30,
                    date: today
                },
                {
                    user: userId,
                    title: 'Đạt điểm tối đa (100%) cho 1 bài học',
                    target: 1,
                    xpReward: 100,
                    date: today
                }
            ];

            await DailyTask.insertMany(defaultTasks);
            console.log(`[DailyTask] Generated 3 tasks for user ${userId}`);
        }
    } catch (error) {
        console.error('Error generating daily tasks:', error);
    }
};

/**
 * Cập nhật tiến độ nhiệm vụ theo tiêu đề (hoặc loại nhiệm vụ sau này)
 */
exports.updateTaskProgress = async (userId, taskTitle, increment = 1) => {
    try {
        const today = new Date();
        today.setHours(0, 0, 0, 0);

        const task = await DailyTask.findOne({
            user: userId,
            title: taskTitle,
            date: { $gte: today },
            isCompleted: false
        });

        if (task) {
            task.progress += increment;
            if (task.progress >= task.target) {
                task.progress = task.target;
                task.isCompleted = true;
            }
            await task.save();
            console.log(`[DailyTask] Updated progress for "${taskTitle}": ${task.progress}/${task.target}`);
        }
    } catch (error) {
        console.error('Error updating task progress:', error);
    }
};
