const SavedVocabulary = require('../schemas/SavedVocabulary');
const { updateTaskProgress } = require('../utils/dailyTaskHelper');

// @desc    Lưu từ vựng vào kho cá nhân
// @route   POST /api/saved-vocab
exports.saveWord = async (req, res) => {
    try {
        const { vocabularyId } = req.body;
        const userId = req.user.id;

        // Kiểm tra xem đã lưu chưa
        const alreadySaved = await SavedVocabulary.findOne({ user: userId, vocabulary: vocabularyId });
        if (alreadySaved) {
            return res.status(400).json({ success: false, message: 'Từ vựng này đã có trong kho lưu trữ của bạn' });
        }

        const savedWord = await SavedVocabulary.create({
            user: userId,
            vocabulary: vocabularyId
        });

        // Cập nhật tiến độ nhiệm vụ hàng ngày
        await updateTaskProgress(userId, 'Lưu 3 từ vựng mới vào sổ tay');

        res.status(201).json({ success: true, data: savedWord });
    } catch (error) {
        res.status(400).json({ success: false, message: error.message });
    }
};

// @desc    Lấy toàn bộ từ vựng đã lưu của tôi
// @route   GET /api/saved-vocab/my-words
exports.getMySavedWords = async (req, res) => {
    try {
        const words = await SavedVocabulary.find({ user: req.user.id })
            .populate('vocabulary')
            .sort({ createdAt: -1 });

        res.status(200).json({ success: true, count: words.length, data: words });
    } catch (error) {
        res.status(400).json({ success: false, message: error.message });
    }
};

// @desc    Cập nhật trạng thái (Đang học / Đã thuộc)
// @route   PUT /api/saved-vocab/:id
exports.updateWordStatus = async (req, res) => {
    try {
        const savedWord = await SavedVocabulary.findById(req.params.id);

        if (!savedWord || savedWord.user.toString() !== req.user.id) {
            return res.status(404).json({ success: false, message: 'Không tìm thấy bản ghi hoặc không có quyền' });
        }

        savedWord.status = req.body.status;
        await savedWord.save();

        res.status(200).json({ success: true, data: savedWord });
    } catch (error) {
        res.status(400).json({ success: false, message: error.message });
    }
};

// @desc    Xóa từ vựng khỏi kho lưu trữ (Bỏ thả tim)
// @route   DELETE /api/saved-vocab/:id
exports.deleteSavedWord = async (req, res) => {
    try {
        const savedWord = await SavedVocabulary.findById(req.params.id);

        if (!savedWord || savedWord.user.toString() !== req.user.id) {
            return res.status(404).json({ success: false, message: 'Không tìm thấy bản ghi hoặc không có quyền' });
        }

        await savedWord.deleteOne();

        res.status(200).json({ success: true, message: 'Đã xóa khỏi kho lưu trữ' });
    } catch (error) {
        res.status(400).json({ success: false, message: error.message });
    }
};
