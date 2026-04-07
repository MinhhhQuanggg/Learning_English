const mongoose = require('mongoose');

const categorySchema = new mongoose.Schema({
    name: {
        type: String,
        required: [true, 'Vui lòng nhập tên danh mục'],
    },
    description: {
        type: String,
        default: ''
    },
    order: {
        type: Number,
        default: 1
    }
}, {
    timestamps: true
});

module.exports = mongoose.model('Category', categorySchema);
