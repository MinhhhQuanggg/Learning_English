const mongoose = require('mongoose');

const roleSchema = new mongoose.Schema(
    {
        _id: {
            type: Number,
            required: true,
        },
        roleName: {
            type: String,
            required: [true, 'Vui lòng nhập tên phân quyền'],
            unique: true,
            enum: ['user', 'admin'], // Ví dụ các role mặc định
            default: 'user',
        },
        description: {
            type: String,
        },
        permissions: [
            {
                type: String, // Ví dụ: 'manage_users', 'manage_lessons'
            }
        ]
    },
    {
        timestamps: true,
    }
);

module.exports = mongoose.model('Role', roleSchema);
