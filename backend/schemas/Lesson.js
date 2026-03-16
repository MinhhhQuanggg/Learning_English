const mongoose = require('mongoose');

const lessonSchema = new mongoose.Schema({
    title: {
        type: String,
        required: [true, 'Vui lòng nhập tiêu đề bài học'],
        trim: true
    },
    description: {
        type: String,
        required: [true, 'Vui lòng nhập mô tả'],
    },
    level: {
        type: String,
        enum: ['Thấp', 'Trung', 'Cao'],
        required: [true, 'Vui lòng chọn trình độ'],
    },
    type: {
        type: String,
        enum: ['Vocabulary', 'Grammar', 'Listening', 'Speaking', 'Reading', 'Writing'],
        default: 'Vocabulary'
    },
    xpAwarded: {
        type: Number,
        default: 10
    },
    duration: {
        type: Number, // Phút
        default: 5
    },
    order: {
        type: Number,
        default: 1
    },
    isActive: {
        type: Boolean,
        default: true
    },
    content: {
        type: String, // Code HTML hoặc Markdown cho bài học
        default: ''
    },
    questions: [
        {
            type: {
                type: String,
                enum: ['multiple_choice', 'fill_blank', 'sort_sentence', 'writing', 'reading_passage', 'true_false'],
                default: 'multiple_choice'
            },
            question: { type: String, required: true },
            mediaUrl: { type: String }, // Cho audio hoặc hình ảnh phụ trợ
            passage: { type: String }, // Đoạn văn bản dài cho đọc hiểu
            options: [{ type: String }], // Dùng cho multiple_choice, sort_sentence, true_false
            correctAnswer: { type: String, required: true }, // Index hoặc text, hoặc array text (cho sort_sentence) nối bằng dấu phẩy
            explanation: { type: String }
        }
    ]
}, {
    timestamps: true
});

module.exports = mongoose.model('Lesson', lessonSchema);
