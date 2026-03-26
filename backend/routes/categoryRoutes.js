const express = require('express');
const { getCategories, createCategory, updateCategory, deleteCategory } = require('../controllers/lessonController');
const { protect, authorize } = require('../middlewares/auth');

const router = express.Router();

router.use(protect);

// @route   GET /api/categories
router.get('/', getCategories);

// Admin Routes
router.post('/', authorize('admin'), createCategory);
router.put('/:id', authorize('admin'), updateCategory);
router.delete('/:id', authorize('admin'), deleteCategory);

module.exports = router;
