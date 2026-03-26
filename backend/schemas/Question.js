const mongoose = require('mongoose');

const questionSchema = new mongoose.Schema({
    lessonId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Lesson',
        required: true
    },
    type: {
        type: String,
        enum: ['multiple_choice', 'fill_blank', 'sort_sentence', 'writing', 'reading_passage', 'true_false'],
        default: 'multiple_choice'
    },
    level: {
        type: String,
        enum: ['Thấp', 'Trung', 'Cao']
    },
    question: { type: String, required: true },
    mediaUrl: { type: String }, // Cho audio hoặc hình ảnh phụ trợ
    passage: { type: String }, // Đoạn văn bản dài cho đọc hiểu
    options: [{ type: String }], // Dùng cho multiple_choice, sort_sentence, true_false
    correctAnswer: { type: String, required: true }, // Index hoặc text, hoặc array text (cho sort_sentence) nối bằng dấu phẩy
    explanation: { type: String }
}, {
    timestamps: true
});

module.exports = mongoose.model('Question', questionSchema);
