const mongoose = require('mongoose');

const savedVocabularySchema = new mongoose.Schema({
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    vocabulary: { type: mongoose.Schema.Types.ObjectId, ref: 'Vocabulary', required: true },
    status: { type: String, enum: ['Đang học', 'Đã thuộc'], default: 'Đang học' }
}, { timestamps: true });

module.exports = mongoose.model('SavedVocabulary', savedVocabularySchema);
