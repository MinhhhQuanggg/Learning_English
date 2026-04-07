const express = require('express');
const http = require('http');
const socketIo = require('socket.io');
const dotenv = require('dotenv');
const cors = require('cors');
const connectDB = require('./config/db');

// Load env vars
dotenv.config();

// Connect to database
connectDB();

// Register all models explicitly to avoid populate errors
require('./schemas/Role');
require('./schemas/User');
require('./schemas/Category');
require('./schemas/Lesson');
require('./schemas/Question');
require('./schemas/Vocabulary');
require('./schemas/OTP');
require('./schemas/Comment');
require('./schemas/Feedback');
require('./schemas/SavedVocabulary');
require('./schemas/DailyTask');
require('./schemas/Achievement');

const app = express();
const server = http.createServer(app);

// Setup Socket.io
const io = socketIo(server, {
    cors: {
        origin: 'http://localhost:5173', // Frontend URL
        methods: ['GET', 'POST']
    }
});

// Import battle handler
require('./socket/battleHandler')(io);

const path = require('path');

// Middleware
app.use(cors());
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ limit: '50mb', extended: true }));
app.use('/public', express.static(path.join(__dirname, 'public')));

// Routes
app.use('/api/auth', require('./routes/authRoutes'));
app.use('/api/lessons', require('./routes/lessonRoutes'));
app.use('/api/categories', require('./routes/categoryRoutes'));
app.use('/api/questions', require('./routes/questionRoutes'));
app.use('/api/vocabulary', require('./routes/vocabularyRoutes'));
app.use('/api/comments', require('./routes/commentRoutes'));
app.use('/api/feedback', require('./routes/feedbackRoutes'));
app.use('/api/saved-vocab', require('./routes/savedVocabRoutes'));
app.use('/api/gamification', require('./routes/gamificationRoutes'));

app.get('/', (req, res) => {
    res.send('Learning English API is running...');
});

const PORT = process.env.PORT || 5000;

server.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
