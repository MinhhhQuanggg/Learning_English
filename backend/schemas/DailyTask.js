const mongoose = require('mongoose');

const dailyTaskSchema = new mongoose.Schema({
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    title: { type: String, required: true },
    target: { type: Number, required: true },
    progress: { type: Number, default: 0 },
    xpReward: { type: Number, default: 50 },
    isCompleted: { type: Boolean, default: false },
    isClaimed: { type: Boolean, default: false },
    date: { type: Date, default: Date.now }
}, { timestamps: true });

module.exports = mongoose.model('DailyTask', dailyTaskSchema);
