const mongoose = require('mongoose');
const dotenv = require('dotenv');
const Role = require('./schemas/Role');
const User = require('./schemas/User');
const Achievement = require('./schemas/Achievement');

dotenv.config();

const initSystemWithNumericRoles = async () => {
    try {
        await mongoose.connect(process.env.MONGODB_URI);
        console.log('--- Đã kết nối MongoDB ---');

        // 0. Xóa bộ sưu tập Role cũ (vì đổi kiểu dữ liệu khóa chính _id)
        console.log('\n[0/3] Đang làm sạch bảng Role cũ...');
        try {
            await mongoose.connection.db.dropCollection('roles');
            console.log('+ Đã xóa bảng roles cũ để reset ID.');
        } catch (e) {
            console.log('- Bảng roles chưa tồn tại hoặc đã được xóa.');
        }

        // 1. Khởi tạo Roles mặc định với ID số
        console.log('\n[1/3] Đang khởi tạo Roles với ID số...');
        const roles = [
            { _id: 1, roleName: 'admin', description: 'Quản trị viên hệ thống' },
            { _id: 2, roleName: 'user', description: 'Người dùng phổ thông' }
        ];

        for (const r of roles) {
            await Role.create(r);
            console.log(`+ Đã tạo Role: ${r.roleName} (ID: ${r._id})`);
        }

        // 2. Migrate User sang ID số
        console.log('\n[2/3] Đang cập nhật dữ liệu User sang Numeric ID...');
        const users = await User.find();
        let updateCount = 0;

        for (const user of users) {
            // Logic: Nếu là admin (dựa trên email hoặc role cũ) thì gán ID 1, còn lại gán 2
            // Ở đây mình check nếu email là qminh0733@gmail.com thì cho làm admin (ví dụ)
            const targetRoleId = (user.email === 'qminh0733@gmail.com') ? 1 : 2;

            user.role = targetRoleId;
            await user.save({ validateBeforeSave: false });
            updateCount++;
        }
        console.log(`+ Đã cập nhật xong ${updateCount} người dùng sang hệ thống Numeric Role (1/2).`);

        // 3. Đảm bảo Achievement mẫu tồn tại
        console.log('\n[3/3] Kiểm tra huy hiệu mẫu...');
        const achievements = [
            { name: 'Người mới bắt đầu', description: 'Hoàn thành bài học đầu tiên', icon: 'https://cdn-icons-png.flaticon.com/512/3112/3112946.png' },
            { name: 'Chiến thần vựng học', description: 'Lưu 10 từ vựng vào sổ tay', icon: 'https://cdn-icons-png.flaticon.com/512/1903/1903172.png' },
            { name: 'Chuỗi chiến thắng', description: 'Đạt streak học tập 7 ngày', icon: 'https://cdn-icons-png.flaticon.com/512/2583/2583344.png' }
        ];

        for (const a of achievements) {
            const exists = await Achievement.findOne({ name: a.name });
            if (!exists) {
                await Achievement.create(a);
                console.log(`+ Đã tạo huy hiệu: ${a.name}`);
            }
        }

        console.log('\n--- CHUYỂN ĐỔI NUMERIC ID HOÀN TẤT! ---');
        process.exit();
    } catch (error) {
        console.error('LỖI CHUYỂN ĐỔI:', error);
        process.exit(1);
    }
};

initSystemWithNumericRoles();
