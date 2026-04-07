const express = require('express');
const {
    getDailyTasks,
    updateTaskProgress,
    getAchievements,
    createAchievement
} = require('../controllers/gamificationController');
const { protect, authorize } = require('../middlewares/auth');

const router = express.Router();

router.use(protect);

router.get('/daily-tasks', getDailyTasks);
router.put('/daily-tasks/:id/progress', updateTaskProgress);
router.post('/daily-tasks/:id/claim', require('../controllers/gamificationController').claimTask);
router.get('/achievements', getAchievements);

// Admin tạo Achievement
router.post('/achievements', authorize('admin'), createAchievement);

module.exports = router;
