const mongoose = require('mongoose');

const otpSchema = new mongoose.Schema({
    email: {
        type: String,
        required: true,
        match: [
            /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/,
            'Vui lòng nhập email hợp lệ',
        ]
    },
    otp: {
        type: String,
        required: true
    },
    userData: {
        type: Object,
        required: true // Chứa thông tin fullName, password, phone, level
    },
    createdAt: {
        type: Date,
        default: Date.now,
        expires: 600 // Tự động xóa sau 10 phút (600 giây)
    }
});

module.exports = mongoose.model('OTP', otpSchema);
