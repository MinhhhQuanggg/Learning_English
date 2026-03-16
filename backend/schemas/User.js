const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

const userSchema = new mongoose.Schema(
    {
        fullName: {
            type: String,
            required: [true, 'Vui lòng nhập họ tên'],
        },
        email: {
            type: String,
            required: [true, 'Vui lòng nhập email'],
            unique: true,
            match: [
                /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/,
                'Vui lòng nhập email hợp lệ',
            ],
        },
        password: {
            type: String,
            required: [true, 'Vui lòng nhập mật khẩu'],
            minlength: 6,
        },
        phone: {
            type: String,
            required: [true, 'Vui lòng nhập số điện thoại'],
        },
        level: {
            type: String,
            enum: ['Thấp', 'Trung', 'Cao'],
            required: [true, 'Vui lòng chọn trình độ'],
        },
        isEmailVerified: {
            type: Boolean,
            default: false,
        },
        verificationCode: {
            type: String,
        },
        verificationCodeExpires: {
            type: Date,
        },
        xp: {
            type: Number,
            default: 0,
        },
        streak: {
            type: Number,
            default: 0,
        },
        avatar: {
            type: String,
            default: '', // Lưu Base64 hoặc URL
        },
        completedLessons: [
            {
                lesson: {
                    type: mongoose.Schema.Types.ObjectId,
                    ref: 'Lesson',
                },
                completedAt: {
                    type: Date,
                    default: Date.now,
                },
            },
        ],
        role: {
            type: String,
            enum: ['user', 'admin'],
            default: 'user',
        },
    },
    {
        timestamps: true,
    }
);
// Mã hóa mật khẩu trước khi lưu
userSchema.pre('save', async function () {
    // Chỉ hash lại password nếu trường password bị thay đổi (modified)
    if (!this.isModified('password')) {
        return;
    }
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
});

// Tạo JWT Token cho đăng nhập
userSchema.methods.getSignedJwtToken = function () {
    return jwt.sign({ id: this._id }, process.env.JWT_SECRET, {
        expiresIn: '30d',
    });
};

// So sánh mật khẩu người dùng nhập với mật khẩu đã hash trong DB
userSchema.methods.matchPassword = async function (enteredPassword) {
    return await bcrypt.compare(enteredPassword, this.password);
};

module.exports = mongoose.model('User', userSchema);
