const User = require('../schemas/User');
const OTP = require('../schemas/OTP');
const sendEmail = require('../utils/sendEmail');
const { checkAndGenerateDailyTasks } = require('../utils/dailyTaskHelper');

// @desc    Đăng ký người dùng mới (chỉ tạo OTP, chưa lưu vào DB chính)
// @route   POST /api/auth/register
exports.register = async (req, res) => {
    try {
        const { fullName, email, password, passwordConfirm, phone, level } = req.body;

        // Kiểm tra passwordConfirm
        if (password !== passwordConfirm) {
            return res.status(400).json({ success: false, message: 'Mật khẩu xác nhận không khớp' });
        }

        // Kiểm tra quy luật mật khẩu (chữ, số và độ dài >= 6)
        const passwordRegex = /^(?=.*[A-Za-z])(?=.*\d).{6,}$/;
        if (!passwordRegex.test(password)) {
            return res.status(400).json({ success: false, message: 'Mật khẩu phải có ít nhất 6 ký tự, bao gồm cả chữ và số' });
        }

        // Kiểm tra email đã tồn tại hay chưa trong DB chính
        const userExists = await User.findOne({ email });
        if (userExists) {
            return res.status(400).json({ success: false, message: 'Email đã được đăng ký' });
        }

        // Kiểm tra xem đã có mã OTP nào đang gửi cho email này không
        await OTP.deleteMany({ email }); // Xóa OTP cũ nếu có để tạo cái mới

        // Tạo mã xác nhận OTP (6 chữ số ngẫu nhiên)
        const verificationCode = Math.floor(100000 + Math.random() * 900000).toString();

        // Lưu thông tin vào collection OTP tạm thời
        await OTP.create({
            email,
            otp: verificationCode,
            userData: {
                fullName,
                email,
                password, // Sẽ được hash bằng hook 'pre save' khi lưu vào collection User
                phone,
                level,
                isEmailVerified: true, // Đánh dấu sẵn để lúc lưu sang User là true luôn
                role: 2 // Gán mặc định là User
            }
        });

        // Gửi email xác nhận
        try {
            const message = `Chào ${fullName},\n\nMã xác nhận tài khoản EngPath của bạn là: ${verificationCode}\nMã này có hiệu lực trong 10 phút.`;

            await sendEmail({
                email,
                subject: 'Mã xác nhận tài khoản EngPath',
                message,
            });

            res.status(200).json({
                success: true,
                message: 'Thông tin hợp lệ. Vui lòng kiểm tra email để nhận mã xác nhận OTP.',
            });
        } catch (err) {
            console.error(err);
            await OTP.deleteMany({ email }); // Xóa nếu lỗi gửi mail thất bại
            return res.status(500).json({ success: false, message: 'Không thể gửi email xác nhận' });
        }
    } catch (error) {
        res.status(400).json({ success: false, message: error.message });
    }
};

// @desc    Xác nhận email với mã OTP và lưu vào DB
// @route   POST /api/auth/verify-email
exports.verifyEmail = async (req, res) => {
    try {
        const { email, code } = req.body;

        const otpRecord = await OTP.findOne({ email, otp: code });

        if (!otpRecord) {
            return res.status(400).json({ success: false, message: 'Mã xác nhận không hợp lệ hoặc đã hết hạn' });
        }

        // Tạo user chính thức từ userData đã lưu tạm
        const user = await User.create(otpRecord.userData);

        // Xóa bản ghi OTP vì đã xác nhận xong
        await OTP.deleteMany({ email });

        res.status(200).json({ success: true, message: 'Xác nhận email thành công. Bạn có thể đăng nhập ngay.' });
    } catch (error) {
        // Xử lý lỗi unique (lỡ email đã được ai đó đăng ký trong lúc chờ)
        if (error.code === 11000) {
            return res.status(400).json({ success: false, message: 'Email này đã được đăng ký trước đó' });
        }
        res.status(400).json({ success: false, message: error.message });
    }
};

// @desc    Gửi lại mã OTP
// @route   POST /api/auth/resend-otp
exports.resendOTP = async (req, res) => {
    try {
        const { email } = req.body;

        // Kiểm tra xem user đã tồn tại chưa
        const userExists = await User.findOne({ email });
        if (userExists) {
            return res.status(400).json({ success: false, message: 'Email đã được đăng ký và xác nhận' });
        }

        const otpRecord = await OTP.findOne({ email });
        if (!otpRecord) {
            return res.status(404).json({ success: false, message: 'Không tìm thấy yêu cầu đăng ký nào đang chờ. Vui lòng đăng ký lại.' });
        }

        // Tạo mã xác nhận OTP mới
        const verificationCode = Math.floor(100000 + Math.random() * 900000).toString();

        // Cập nhật lại OTP record
        otpRecord.otp = verificationCode;
        otpRecord.createdAt = Date.now(); // Reset lại thời gian hết hạn
        await otpRecord.save();

        // Gửi email xác nhận
        try {
            const message = `Chào ${otpRecord.userData.fullName},\n\nMã xác nhận tài khoản Learning English MỚI của bạn là: ${verificationCode}\nMã này có hiệu lực trong 10 phút.`;

            await sendEmail({
                email,
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
        const user = await User.findOne({ email }).populate('role');

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
                role: user.role && user.role.roleName ? user.role.roleName : 'user',
                streak: user.streak,
                xp: user.xp,
                avatar: user.avatar
            }
        });
    } catch (error) {
        res.status(400).json({ success: false, message: error.message });
    }
};

// @desc    Lấy thông tin người dùng hiện lưu trong token (tự động đăng nhập FE)
// @route   GET /api/auth/me
exports.getMe = async (req, res) => {
    try {
        // Lấy lại user từ DB để có thể cập nhật streak
        const user = await User.findById(req.user.id).populate('completedLessons.lesson').populate('role');

        if (!user) {
            return res.status(404).json({ success: false, message: 'Không tìm thấy người dùng' });
        }

        // Tự động kiểm tra và tạo nhiệm vụ hàng ngày
        await checkAndGenerateDailyTasks(user._id);

        // ===== Kiểm tra và reset streak nếu bỏ lỡ ngày =====
        if (user.lastActiveDate && user.streak > 0) {
            const today = new Date();
            today.setHours(0, 0, 0, 0);

            const lastActive = new Date(user.lastActiveDate);
            lastActive.setHours(0, 0, 0, 0);

            const diffDays = Math.round((today - lastActive) / (1000 * 60 * 60 * 24));

            // Nếu bỏ lỡ 2 ngày trở lên (ví dụ: hôm qua không học) → reset về 0
            if (diffDays >= 2) {
                user.streak = 0;
                await user.save({ validateBeforeSave: false });
                console.log(`[Streak Reset] User ${user.email}: bỏ lỡ ${diffDays} ngày → streak = 0`);
            }
        }

        const userObj = user.toObject();
        if (userObj.role && userObj.role.roleName) {
            userObj.role = userObj.role.roleName;
        } else if (!userObj.role) {
            userObj.role = 'user'; // Mặc định nếu chưa có role reference
        }

        res.status(200).json({
            success: true,
            data: userObj
        });
    } catch (error) {
        res.status(400).json({ success: false, message: error.message });
    }
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
        let query = {};
        if (req.query.level) {
            query.level = req.query.level;
        }

        const users = await User.find(query)
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

// @desc    Lấy tất cả user (Admin)
// @route   GET /api/auth/users
exports.getAllUsers = async (req, res) => {
    try {
        const users = await User.find().select('-password').sort('-createdAt');
        res.status(200).json({ success: true, count: users.length, data: users });
    } catch (error) {
        res.status(400).json({ success: false, message: error.message });
    }
};

// @desc    Lấy chi tiết user (Admin)
// @route   GET /api/auth/users/:id
exports.getUser = async (req, res) => {
    try {
        const user = await User.findById(req.params.id).select('-password');
        if (!user) return res.status(404).json({ success: false, message: 'Không tìm thấy người dùng' });
        res.status(200).json({ success: true, data: user });
    } catch (error) {
        res.status(400).json({ success: false, message: error.message });
    }
};

// @desc    Cập nhật quyền user (Admin)
// @route   PUT /api/auth/users/:id
exports.updateUser = async (req, res) => {
    try {
        const user = await User.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true }).select('-password');
        if (!user) return res.status(404).json({ success: false, message: 'Không tìm thấy người dùng' });
        res.status(200).json({ success: true, data: user });
    } catch (error) {
        res.status(400).json({ success: false, message: error.message });
    }
};

// @desc    Xóa user (Admin)
// @route   DELETE /api/auth/users/:id
exports.deleteUser = async (req, res) => {
    try {
        const user = await User.findById(req.params.id);
        if (!user) return res.status(404).json({ success: false, message: 'Không tìm thấy người dùng' });
        if (user.role === 'admin') return res.status(400).json({ success: false, message: 'Không thể xóa tài khoản admin' });
        await user.deleteOne();
        res.status(200).json({ success: true, data: {} });
    } catch (error) {
        res.status(400).json({ success: false, message: error.message });
    }
};
// @desc    Đổi mật khẩu
// @route   PUT /api/auth/change-password
exports.changePassword = async (req, res) => {
    try {
        const { oldPassword, newPassword } = req.body;

        if (!oldPassword || !newPassword) {
            return res.status(400).json({ success: false, message: 'Vui lòng cung cấp mật khẩu cũ và mật khẩu mới' });
        }

        // Phải select lại password vì getMe không trả về trường password
        const user = await User.findById(req.user.id).select('+password');
        if (!user) {
            return res.status(404).json({ success: false, message: 'Không tìm thấy người dùng' });
        }

        // So sánh mật khẩu cũ với hash trong DB
        const isMatch = await user.matchPassword(oldPassword);
        if (!isMatch) {
            return res.status(400).json({ success: false, message: 'Mật khẩu cũ không đúng' });
        }

        if (newPassword.length < 6) {
            return res.status(400).json({ success: false, message: 'Mật khẩu mới phải có ít nhất 6 ký tự' });
        }

        user.password = newPassword;
        await user.save(); // pre-save hook sẽ tự hash mật khẩu mới

        res.status(200).json({ success: true, message: 'Đổi mật khẩu thành công' });
    } catch (error) {
        res.status(400).json({ success: false, message: error.message });
    }
};
