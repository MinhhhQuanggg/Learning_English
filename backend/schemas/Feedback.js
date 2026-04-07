const mongoose = require('mongoose');

const feedbackSchema = new mongoose.Schema({
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    title: { type: String, required: true },
    type: { type: String, enum: ['Lỗi phần mềm', 'Lỗi nội dung', 'Góp ý khác'], default: 'Góp ý khác' },
    content: { type: String, required: true },
    status: { type: String, enum: ['Đang chờ', 'Đang xử lý', 'Đã giải quyết'], default: 'Đang chờ' }
}, { timestamps: true });

module.exports = mongoose.model('Feedback', feedbackSchema);
