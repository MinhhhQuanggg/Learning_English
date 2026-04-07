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
    categoryId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Category',
        required: [true, 'Vui lòng chọn danh mục cho bài học']
    },
    xpAwarded: {
        type: Number,
        default: 50
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
}, {
    timestamps: true
});

module.exports = mongoose.model('Lesson', lessonSchema);
