# LearningEnglish
# Đồ án cuối kì môn: Ngôn ngữ phát triển ứng dụng mới 
# - Tải Mongodb Compass về kết nối database
# BƯỚC 1:
# 1. Tạo file môi trường: Tại thư mục backend, tạo một file mới tên là .env.
# 2. Thiết lập cấu hình: Copy toàn bộ nội dung từ file .env_example dán sang file .env vừa tạo.
# 3. Cập nhật thông tin: Thay đổi giá trị EMAIL và PASSWORD trong file .env bằng tài khoản email cá nhân của bạn (dùng mật khẩu ứng dụng - App Password) để hệ thống có thể gửi thông báo bảo mật.
# - Trong file backend\utils\sendEmail.js dòng: if (!process.env.EMAIL_USER || process.env.EMAIL_USER === 'your_email@gmail.com'), hãy tự điền email mình vào đây để nhận email.

# BƯỚC 2: Tải thư viện
# - Mở 2 terminal:
# - Terminal 1: cd backend => npm install
# - Terminal 2: cd frontend => npm install

# BƯỚC 3: Lệnh thêm file để nạp dữ liệu vào Database
# - Ở trong backend gõ 2 lệnh
# node seedLessons.js và node seeder.js
# - Dữ liệu trong 2 file này sẽ được thêm vào Database (MongoDB Compass)

# BƯỚC 3: Cách chạy
# - Terminal 1: cd backend => npm run dev
# - Terminal 2: cd frontend => npm run dev
# - Ở terminal 2 phần chạy fronend sẽ có hiển thị link để chạy loaclhost trên web

# - Nếu muốn dùng MongoDB Atlas thì hãy đỏi đường dẫn MONGODB_URI trong file .env
