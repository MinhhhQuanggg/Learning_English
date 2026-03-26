const express = require('express');
const {
    getVocabularies,
    getVocabulary,
    createVocabulary,
    updateVocabulary,
    deleteVocabulary
} = require('../controllers/vocabularyController');
const { protect, authorize } = require('../middleware/auth');

const router = express.Router();

// Tất cả các route /api/vocabulary đều có thể đọc công khai (để học viên xem),
// Nhưng chỉ có admin mới được thêm/sửa/xóa

router.route('/')
    .get(protect, getVocabularies)
    .post(protect, authorize('admin'), createVocabulary);

router.route('/:id')
    .get(protect, getVocabulary)
    .put(protect, authorize('admin'), updateVocabulary)
    .delete(protect, authorize('admin'), deleteVocabulary);

module.exports = router;
