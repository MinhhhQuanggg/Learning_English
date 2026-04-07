const mongoose = require('mongoose');

const questionSchema = new mongoose.Schema({
    lessonId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Lesson',
        required: true
    },
    type: {
        type: String,
        enum: ['Trắc nghiệm', 'Điền từ', 'Sắp xếp câu', 'Viết luận', 'Đọc hiểu', 'Đúng/Sai'],
        default: 'Trắc nghiệm'
    },
    level: {
        type: String,
        enum: ['Thấp', 'Trung', 'Cao']
    },
    question: { type: String, required: true },
    mediaUrl: { type: String }, // Cho audio hoặc hình ảnh phụ trợ
    passage: { type: String }, // Đoạn văn bản dài cho đọc hiểu
    options: [{ type: String }], // Dùng cho Trắc nghiệm, Sắp xếp câu, Đúng/Sai
    correctAnswer: { type: String, required: true }, // Index hoặc text, hoặc array text (cho Sắp xếp câu) nối bằng dấu phẩy
    explanation: { type: String }
}, {
    timestamps: true
});

module.exports = mongoose.model('Question', questionSchema);
