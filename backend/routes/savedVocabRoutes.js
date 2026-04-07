const express = require('express');
const {
    saveWord,
    getMySavedWords,
    updateWordStatus,
    deleteSavedWord
} = require('../controllers/savedVocabController');
const { protect } = require('../middlewares/auth');

const router = express.Router();

router.use(protect);

router.post('/', saveWord);
router.get('/my-words', getMySavedWords);
router.put('/:id', updateWordStatus);
router.delete('/:id', deleteSavedWord);

module.exports = router;
