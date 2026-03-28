const User = require('../schemas/User');

let waitingPlayers = []; // Hàng đợi tìm đối thủ ({ socket, user })
const activeRooms = {}; // Lưu các phòng đấu { roomId: { players: [], currentQuestion: {}, history: [] } }

// Hàm helper để random câu hỏi
const getRandomQuestions = async (count = 5) => {
    const Question = require('../schemas/Question');
    const questions = await Question.aggregate([{ $sample: { size: count } }]);
    return questions;
};

module.exports = (io) => {
    io.on('connection', (socket) => {
        console.log(`User connected to Socket: ${socket.id}`);

        // Người chơi yêu cầu tìm trận
        socket.on('find_match', async (userData) => {
            console.log(`${userData.fullName} đang tìm trận...`);
            socket.user = userData; // Lưu thông tin user vào socket

            // Kiểm tra xem đã có trong hàng đợi chưa
            const exIdx = waitingPlayers.findIndex(p => p.user._id === userData._id);
            if (exIdx !== -1) waitingPlayers.splice(exIdx, 1);

            if (waitingPlayers.length > 0) {
                // Đã có người đợi -> Bắt cặp
                const opponent = waitingPlayers.shift();
                const roomId = `room_${socket.id}_${opponent.socket.id}`;

                // Cho cả 2 vào chung phòng
                socket.join(roomId);
                opponent.socket.join(roomId);

                // Lấy bộ câu hỏi cho phòng này
                const questions = await getRandomQuestions(5); // Chơi 5 câu

                activeRooms[roomId] = {
                    roomId,
                    players: [
                        { socketId: opponent.socket.id, user: opponent.user, score: 0, answers: 0 },
                        { socketId: socket.id, user: userData, score: 0, answers: 0 }
                    ],
                    questions,
                    currentQuestionIndex: 0
                };

                // Báo cho 2 người chơi đã tìm thấy trận
                io.to(roomId).emit('match_found', {
                    roomId,
                    players: [
                        { id: opponent.user._id, fullName: opponent.user.fullName, avatar: opponent.user.avatar, level: opponent.user.level },
                        { id: userData._id, fullName: userData.fullName, avatar: userData.avatar, level: userData.level }
                    ]
                });

                console.log(`Phòng ${roomId} đã được tạo cho ${opponent.user.fullName} và ${userData.fullName}`);

                // Đợi 3 giây rồi gửi câu hỏi đầu tiên
                setTimeout(() => {
                    sendNextQuestion(roomId);
                }, 3000);
            } else {
                // Không có ai đợi -> Cho vào hàng đợi
                waitingPlayers.push({ socket, user: userData });
            }
        });

        // Người chơi trả lời câu hỏi
        socket.on('submit_answer', ({ roomId, answerIndex, timeToAnswer }) => {
            const room = activeRooms[roomId];
            if (!room) return;

            const player = room.players.find(p => p.socketId === socket.id);
            const currentQ = room.questions[room.currentQuestionIndex];

            // Nếu chưa trả lời câu này
            if (!player.hasAnsweredCurrent) {
                player.hasAnsweredCurrent = true;
                player.answers++;

                // Tính điểm nếu trả lời đúng (nhanh được nhiều điểm hơn)
                const isCorrect = answerIndex === currentQ.correctAnswer;
                if (isCorrect) {
                    // Điểm cơ bản là 10. Max bonus tốc độ là 10 (giả sử tối đa 15s/câu).
                    const speedBonus = Math.max(0, 15 - timeToAnswer);
                    player.score += (10 + speedBonus);
                }

                // Gửi cập nhật điểm số cho cả 2 ngay lập tức
                io.to(roomId).emit('score_update', {
                    socketId: socket.id,
                    newScore: player.score,
                    isCorrect
                });
            }

            // Kiểm tra xem cả 2 đã trả lời xong câu này chưa
            const bothAnswered = room.players.every(p => p.hasAnsweredCurrent);
            if (bothAnswered) {
                // Reset flag cho câu tiếp theo
                room.players.forEach(p => p.hasAnsweredCurrent = false);

                // Chuyển sang câu tiếp theo sau 2 giây (để hiển thị đáp án)
                setTimeout(() => {
                    room.currentQuestionIndex++;
                    if (room.currentQuestionIndex < room.questions.length) {
                        sendNextQuestion(roomId);
                    } else {
                        endGame(roomId);
                    }
                }, 2000);
            }
        });

        // Thoát tìm trận
        socket.on('cancel_search', () => {
            waitingPlayers = waitingPlayers.filter(p => p.socket.id !== socket.id);
        });

        // Ngắt kết nối
        socket.on('disconnect', () => {
            console.log(`User ${socket.id} disconnected`);
            waitingPlayers = waitingPlayers.filter(p => p.socket.id !== socket.id);

            // Kiểm tra xem có đang trong phòng không, nếu có thì xử thua luôn
            for (const roomId in activeRooms) {
                const room = activeRooms[roomId];
                const playerIndex = room.players.findIndex(p => p.socketId === socket.id);
                if (playerIndex !== -1) {
                    const opponent = room.players[playerIndex === 0 ? 1 : 0];
                    io.to(roomId).emit('opponent_left', { message: 'Đối thủ đã thoát trận. Bạn thắng!' });
                    // Ghi nhận trận thắng cho người còn lại
                    endGameEarly(roomId, opponent.user._id);
                }
            }
        });

        // Helpers
        function sendNextQuestion(roomId) {
            const room = activeRooms[roomId];
            if (!room) return;

            const q = room.questions[room.currentQuestionIndex];
            // Format gửi lên client, giấu đáp án đúng
            const questionData = {
                text: q.text,
                options: q.options,
                audioUrl: q.audioUrl,
                questionIndex: room.currentQuestionIndex,
                totalQuestions: room.questions.length
            };

            io.to(roomId).emit('next_question', questionData);
        }

        async function endGame(roomId) {
            const room = activeRooms[roomId];
            if (!room) return;

            const p1 = room.players[0];
            const p2 = room.players[1];

            // Xác định người thắng
            let winnerId = null;
            if (p1.score > p2.score) winnerId = p1.user._id;
            else if (p2.score > p1.score) winnerId = p2.user._id;

            // Gửi kết quả
            io.to(roomId).emit('game_over', {
                winnerId, // null nếu hòa
                players: [
                    { id: p1.user._id, score: p1.score },
                    { id: p2.user._id, score: p2.score }
                ]
            });

            // Cập nhật XP trong DB (Cộng 50 XP cho người thắng, 10 XP cho người thua, 30 XP nếu hòa)
            try {
                if (winnerId) {
                    const loserId = winnerId === p1.user._id ? p2.user._id : p1.user._id;
                    await User.findByIdAndUpdate(winnerId, { $inc: { xp: 50, streak: 0 } }); // Chỉ cộng xp
                    await User.findByIdAndUpdate(loserId, { $inc: { xp: 10 } });
                } else {
                    // Hòa
                    await User.findByIdAndUpdate(p1.user._id, { $inc: { xp: 30 } });
                    await User.findByIdAndUpdate(p2.user._id, { $inc: { xp: 30 } });
                }
            } catch (err) {
                console.error("Lỗi cập nhật XP sau battle:", err);
            }

            delete activeRooms[roomId];
        }

        async function endGameEarly(roomId, winnerId) {
            const room = activeRooms[roomId];
            if (!room) return;

            try {
                await User.findByIdAndUpdate(winnerId, { $inc: { xp: 50 } });
            } catch (e) {
                console.error(e);
            }

            delete activeRooms[roomId];
        }
    });
};
