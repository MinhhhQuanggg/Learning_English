const User = require('../schemas/User');
const sendEmail = require('../utils/sendEmail');

// @desc    Đăng ký người dùng mới (bao gồm mật khẩu xác nhận và level)
// @route   POST /api/auth/register
exports.register = async (req, res) => {
    try {
        const { fullName, email, password, passwordConfirm, phone, level } = req.body;

        // Kiểm tra passwordConfirm
        if (password !== passwordConfirm) {
            return res.status(400).json({ success: false, message: 'Mật khẩu xác nhận không khớp' });
        }

        // Kiểm tra email đã tồn tại hay chưa
        const userExists = await User.findOne({ email });
        if (userExists) {
            return res.status(400).json({ success: false, message: 'Email đã được đăng ký' });
        }

        // Tạo mã xác nhận OTP (6 chữ số ngẫu nhiên)
        const verificationCode = Math.floor(100000 + Math.random() * 900000).toString();

        // Tạo user (lúc này chưa verify email)
        const user = await User.create({
            fullName,
            email,
            password,
            phone,
            level,
            verificationCode,
            verificationCodeExpires: Date.now() + 10 * 60 * 1000, // Có hiệu lực trong 10 phút
        });

        // Gửi email xác nhận
        try {
            const message = `Chào ${fullName},\n\nMã xác nhận tài khoản Learning English của bạn là: ${verificationCode}\nMã này có hiệu lực trong 10 phút.`;

            await sendEmail({
                email: user.email,
                subject: 'Mã xác nhận tài khoản Learning English',
                message,
            });

            res.status(200).json({
                success: true,
                message: 'Đăng ký thành công. Vui lòng kiểm tra email để nhận mã xác nhận.',
            });
        } catch (err) {
            console.error(err);
            // Xóa code nếu lỗi gửi mail thất bại (tuỳ chọn)
            user.verificationCode = undefined;
            user.verificationCodeExpires = undefined;
            await user.save({ validateBeforeSave: false });

            return res.status(500).json({ success: false, message: 'Không thể gửi email xác nhận' });
        }
    } catch (error) {
        res.status(400).json({ success: false, message: error.message });
    }
};

// @desc    Xác nhận email với mã OTP
// @route   POST /api/auth/verify-email
exports.verifyEmail = async (req, res) => {
    try {
        const { email, code } = req.body;

        const user = await User.findOne({ email });

        if (!user) {
            return res.status(404).json({ success: false, message: 'Không tìm thấy người dùng' });
        }

        if (user.isEmailVerified) {
            return res.status(400).json({ success: false, message: 'Email đã được xác nhận trước đó' });
        }

        if (user.verificationCode !== code) {
            return res.status(400).json({ success: false, message: 'Mã xác nhận không hợp lệ' });
        }

        if (user.verificationCodeExpires < Date.now()) {
            return res.status(400).json({ success: false, message: 'Mã xác nhận đã hết hạn. Vui lòng yêu cầu mã mới.' });
        }

        user.isEmailVerified = true;
        user.verificationCode = undefined;
        user.verificationCodeExpires = undefined;
        await user.save();

        res.status(200).json({ success: true, message: 'Xác nhận email thành công. Bạn có thể đăng nhập ngay.' });
    } catch (error) {
        res.status(400).json({ success: false, message: error.message });
    }
};

// @desc    Gửi lại mã OTP
// @route   POST /api/auth/resend-otp
exports.resendOTP = async (req, res) => {
    try {
        const { email } = req.body;

        const user = await User.findOne({ email });

        if (!user) {
            return res.status(404).json({ success: false, message: 'Không tìm thấy người dùng' });
        }

        if (user.isEmailVerified) {
            return res.status(400).json({ success: false, message: 'Email đã được xác nhận trước đó' });
        }

        // Tạo mã xác nhận OTP mới
        const verificationCode = Math.floor(100000 + Math.random() * 900000).toString();
        user.verificationCode = verificationCode;
        user.verificationCodeExpires = Date.now() + 10 * 60 * 1000;
        await user.save();

        // Gửi email xác nhận
        try {
            const message = `Chào ${user.fullName},\n\nMã xác nhận tài khoản Learning English MỚI của bạn là: ${verificationCode}\nMã này có hiệu lực trong 10 phút.`;

            await sendEmail({
                email: user.email,
                subject: 'Mã xác nhận tài khoản Learning English (Gửi lại)',
                message,
            });

            res.status(200).json({
                success: true,
                message: 'Mã xác nhận mới đã được gửi vào email của bạn.',
            });
        } catch (err) {
            console.error(err);
            return res.status(500).json({ success: false, message: 'Không thể gửi email xác nhận' });
        }
    } catch (error) {
        res.status(400).json({ success: false, message: error.message });
    }
};

// @desc    Đăng nhập
// @route   POST /api/auth/login
exports.login = async (req, res) => {
    try {
        const { email, password } = req.body;

        if (!email || !password) {
            return res.status(400).json({ success: false, message: 'Vui lòng cung cấp email và mật khẩu' });
        }

        // Do password được select: false (nếu có config) hoặc ta cứ tìm nó
        const user = await User.findOne({ email });

        if (!user) {
            return res.status(401).json({ success: false, message: 'Thông tin đăng nhập không hợp lệ' });
        }

        console.log("LOGIN DB USER:", user.email, user.level);

        if (!user.isEmailVerified) {
            return res.status(401).json({ success: false, message: 'Vui lòng xác nhận email trước khi đăng nhập' });
        }

        const isMatch = await user.matchPassword(password);

        if (!isMatch) {
            return res.status(401).json({ success: false, message: 'Thông tin đăng nhập không hợp lệ' });
        }

        // Tạo token đăng nhập
        const token = user.getSignedJwtToken();

        res.status(200).json({
            success: true,
            token,
            user: {
                id: user._id,
                fullName: user.fullName,
                email: user.email,
                level: user.level,
                role: user.role
            }
        });
    } catch (error) {
        res.status(400).json({ success: false, message: error.message });
    }
};

// @desc    Lấy thông tin người dùng hiện lưu trong token (tự động đăng nhập FE)
// @route   GET /api/auth/me
exports.getMe = async (req, res) => {
    res.status(200).json({
        success: true,
        data: req.user
    });
};
// @desc    Cập nhật thông tin cá nhân
// @route   PUT /api/auth/update-profile
exports.updateProfile = async (req, res) => {
    try {
        const { fullName, phone, level, avatar } = req.body;

        const user = await User.findById(req.user.id);
        if (!user) {
            return res.status(404).json({ success: false, message: 'Không tìm thấy người dùng' });
        }

        user.fullName = fullName || user.fullName;
        user.phone = phone || user.phone;
        user.level = level || user.level;
        user.avatar = avatar || user.avatar;

        await user.save();

        res.status(200).json({
            success: true,
            message: 'Cập nhật thông tin thành công',
            data: user
        });
    } catch (error) {
        res.status(400).json({ success: false, message: error.message });
    }
};
// @desc    Lấy bảng xếp hạng (Top 10 người dùng theo XP)
// @route   GET /api/auth/leaderboard
exports.getLeaderboard = async (req, res) => {
    try {
        const users = await User.find()
            .select('fullName level xp avatar')
            .sort({ xp: -1 })
            .limit(10);

        res.status(200).json({
            success: true,
            data: users
        });
    } catch (error) {
        res.status(400).json({ success: false, message: error.message });
    }
};

// @desc    Tải lên ảnh đại diện
// @route   POST /api/auth/upload-avatar
exports.uploadAvatar = async (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({ success: false, message: 'Vui lòng chọn một file ảnh' });
        }

        const user = await User.findById(req.user.id);
        if (!user) {
            return res.status(404).json({ success: false, message: 'Không tìm thấy người dùng' });
        }

        // Tạo public URL cho ảnh
        const protocol = req.protocol;
        const host = req.get('host');
        // File path format: /public/uploads/avatars/filename
        const avatarUrl = `${protocol}://${host}/public/uploads/avatars/${req.file.filename}`;

        user.avatar = avatarUrl;
        await user.save();

        res.status(200).json({
            success: true,
            message: 'Tải lên ảnh đại diện thành công',
            avatar: avatarUrl,
            data: user
        });
    } catch (error) {
        res.status(400).json({ success: false, message: error.message });
    }
};
