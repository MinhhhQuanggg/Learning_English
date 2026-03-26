const Vocabulary = require('../schemas/Vocabulary');

// @desc    Lấy danh sách từ vựng (có thể lọc theo bài học hoặc câu hỏi)
// @route   GET /api/vocabulary
exports.getVocabularies = async (req, res) => {
    try {
        let queryObj = {};

        if (req.query.lessonId) {
            queryObj.lessonId = req.query.lessonId;
        }

        if (req.query.questionId) {
            queryObj.questionId = req.query.questionId;
        }

        const vocabularies = await Vocabulary.find(queryObj).populate('lessonId', 'title').sort('-createdAt');

        res.status(200).json({
            success: true,
            count: vocabularies.length,
            data: vocabularies
        });
    } catch (error) {
        res.status(400).json({ success: false, message: error.message });
    }
};

// @desc    Lấy một từ vựng
// @route   GET /api/vocabulary/:id
exports.getVocabulary = async (req, res) => {
    try {
        const vocabulary = await Vocabulary.findById(req.params.id);
        if (!vocabulary) {
            return res.status(404).json({ success: false, message: 'Không tìm thấy từ vựng' });
        }
        res.status(200).json({ success: true, data: vocabulary });
    } catch (error) {
        res.status(400).json({ success: false, message: error.message });
    }
};

// @desc    Tạo từ vựng mới
// @route   POST /api/vocabulary
exports.createVocabulary = async (req, res) => {
    try {
        const vocabulary = await Vocabulary.create(req.body);
        res.status(201).json({ success: true, data: vocabulary });
    } catch (error) {
        res.status(400).json({ success: false, message: error.message });
    }
};

// @desc    Cập nhật từ vựng
// @route   PUT /api/vocabulary/:id
exports.updateVocabulary = async (req, res) => {
    try {
        const vocabulary = await Vocabulary.findByIdAndUpdate(req.params.id, req.body, {
            new: true,
            runValidators: true
        });

        if (!vocabulary) {
            return res.status(404).json({ success: false, message: 'Không tìm thấy từ vựng' });
        }

        res.status(200).json({ success: true, data: vocabulary });
    } catch (error) {
        res.status(400).json({ success: false, message: error.message });
    }
};

// @desc    Xóa từ vựng
// @route   DELETE /api/vocabulary/:id
exports.deleteVocabulary = async (req, res) => {
    try {
        const vocabulary = await Vocabulary.findById(req.params.id);

        if (!vocabulary) {
            return res.status(404).json({ success: false, message: 'Không tìm thấy từ vựng' });
        }

        await vocabulary.deleteOne();

        res.status(200).json({ success: true, data: {} });
    } catch (error) {
        res.status(400).json({ success: false, message: error.message });
    }
};
