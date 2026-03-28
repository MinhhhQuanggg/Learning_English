import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { io } from 'socket.io-client';
import { Swords, Loader2, Clock, CheckCircle2, XCircle, Trophy, Home } from 'lucide-react';
import api from '../api/axios';

const SOCKET_URL = 'http://localhost:5000';

const Battle = () => {
    const [user] = useState(JSON.parse(localStorage.getItem('user') || '{}'));
    const navigate = useNavigate();

    const [socket, setSocket] = useState(null);
    const [status, setStatus] = useState('idle'); // idle | searching | in_game | game_over
    const [room, setRoom] = useState(null);
    const [opponent, setOpponent] = useState(null);

    // Game variables
    const [question, setQuestion] = useState(null);
    const [myScore, setMyScore] = useState(0);
    const [opponentScore, setOpponentScore] = useState(0);
    const [timeLeft, setTimeLeft] = useState(15);
    const [selectedAnswer, setSelectedAnswer] = useState(null);
    const [isCorrectAnswer, setIsCorrectAnswer] = useState(null);
    const [result, setResult] = useState(null); // { winnerId, myFinalScore, opponentFinalScore }

    useEffect(() => {
        // Init socket connection
        const newSocket = io(SOCKET_URL);
        setSocket(newSocket);

        newSocket.on('connect', () => {
            console.log('Connected to battle server');
        });

        newSocket.on('match_found', (data) => {
            const opp = data.players.find(p => p.id !== user._id);
            setOpponent(opp);
            setRoom(data.roomId);
            setStatus('in_game');
            setMyScore(0);
            setOpponentScore(0);
        });

        newSocket.on('next_question', (qData) => {
            setQuestion(qData);
            setSelectedAnswer(null);
            setIsCorrectAnswer(null);
            setTimeLeft(15);
        });

        newSocket.on('score_update', (data) => {
            if (data.socketId === newSocket.id) {
                setMyScore(data.newScore);
                setIsCorrectAnswer(data.isCorrect);
            } else {
                setOpponentScore(data.newScore);
            }
        });

        newSocket.on('game_over', (data) => {
            setStatus('game_over');
            const myData = data.players.find(p => p.id === user._id);
            const oppData = data.players.find(p => p.id !== user._id);

            setResult({
                winnerId: data.winnerId,
                myFinalScore: myData?.score || 0,
                opponentFinalScore: oppData?.score || 0
            });

            // Cập nhật lại user local storage do backend vừa thay đổi XP
            api.get('/auth/me').then(res => {
                localStorage.setItem('user', JSON.stringify(res.data.data));
            }).catch(console.error);
        });

        newSocket.on('opponent_left', (data) => {
            alert(data.message);
            setStatus('idle');
            setRoom(null);
            setOpponent(null);
        });

        return () => {
            newSocket.disconnect();
        };
    }, [user._id]);

    useEffect(() => {
        let timer;
        if (status === 'in_game' && question && !selectedAnswer && timeLeft > 0) {
            timer = setTimeout(() => setTimeLeft(prev => prev - 1), 1000);
        } else if (timeLeft === 0 && !selectedAnswer) {
            handleAnswer(-1); // Hết giờ = sai
        }
        return () => clearTimeout(timer);
    }, [status, question, timeLeft, selectedAnswer]);


    const handleFindMatch = () => {
        if (!socket) return;
        setStatus('searching');
        socket.emit('find_match', user);
    };

    const handleCancelSearch = () => {
        if (!socket) return;
        setStatus('idle');
        socket.emit('cancel_search');
    };

    const handleAnswer = (index) => {
        if (selectedAnswer !== null) return;
        setSelectedAnswer(index);
        socket.emit('submit_answer', {
            roomId: room,
            answerIndex: index,
            timeToAnswer: 15 - timeLeft
        });
    };

    // UI RENDERERS
    if (status === 'idle') {
        return (
            <div className="container" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: '80vh', textAlign: 'center' }}>
                <div style={{
                    width: '120px', height: '120px', borderRadius: '50%', background: 'linear-gradient(135deg, #ef4444, #f59e0b)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', marginBottom: '2rem',
                    boxShadow: '0 20px 40px rgba(239, 68, 68, 0.3)'
                }}>
                    <Swords size={60} />
                </div>
                <h1 style={{ fontSize: '2.5rem', fontWeight: '900', color: '#1f2937', marginBottom: '1rem' }}>Đấu Trường Tiếng Anh</h1>
                <p style={{ color: '#6b7280', fontSize: '1.1rem', maxWidth: '500px', marginBottom: '3rem', lineHeight: '1.6' }}>
                    Thách đấu cùng những người học khác theo thời gian thực. Trả lời nhanh nhất để giành chiến thắng và nhận nhiều điểm kinh nghiệm (XP)!
                </p>
                <div style={{ display: 'flex', gap: '1rem' }}>
                    <button onClick={handleFindMatch} className="btn btn-primary" style={{ padding: '1rem 3rem', fontSize: '1.2rem', borderRadius: '99px', boxShadow: '0 10px 25px rgba(79, 70, 229, 0.4)' }}>
                        Tìm đối thủ ngay
                    </button>
                    <button onClick={() => navigate('/dashboard')} className="btn" style={{ padding: '1rem 3rem', fontSize: '1.2rem', borderRadius: '99px', backgroundColor: '#f3f4f6', color: '#4b5563', border: 'none' }}>
                        Quay lại
                    </button>
                </div>
            </div>
        );
    }

    if (status === 'searching') {
        return (
            <div className="container" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: '80vh', textAlign: 'center' }}>
                <Loader2 className="animate-spin" size={60} color="var(--primary)" style={{ marginBottom: '2rem' }} />
                <h2 style={{ fontSize: '2rem', fontWeight: '800', color: '#1f2937', marginBottom: '1rem' }}>Đang tìm đối thủ...</h2>
                <p style={{ color: '#6b7280', fontSize: '1.1rem', marginBottom: '3rem' }}>Vui lòng chờ trong giây lát. Hệ thống đang tìm người có cùng cấp độ với bạn.</p>
                <button onClick={handleCancelSearch} className="btn" style={{ padding: '0.8rem 2.5rem', borderRadius: '99px', backgroundColor: '#fee2e2', color: '#ef4444', border: 'none', fontWeight: '700' }}>
                    Hủy tìm kiếm
                </button>
            </div>
        );
    }

    if (status === 'in_game' && question) {
        return (
            <div className="container" style={{ paddingBottom: '3rem', maxWidth: '800px', margin: '0 auto' }}>
                {/* Header: Scoreboard */}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', backgroundColor: 'white', padding: '1.5rem', borderRadius: '24px', boxShadow: '0 10px 30px rgba(0,0,0,0.05)', marginBottom: '2rem' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                        <div style={{ width: '50px', height: '50px', borderRadius: '50%', backgroundColor: '#e0e7ff', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#4f46e5', fontWeight: 'bold', border: '3px solid #4f46e5' }}>
                            Tôi
                        </div>
                        <div>
                            <div style={{ fontWeight: '700', fontSize: '1.1rem' }}>{user.fullName}</div>
                            <div style={{ color: '#4f46e5', fontWeight: '900', fontSize: '1.5rem' }}>{myScore}</div>
                        </div>
                    </div>

                    <div style={{ textAlign: 'center', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                        <div style={{ fontSize: '0.9rem', color: '#6b7280', fontWeight: '700', textTransform: 'uppercase', letterSpacing: '2px', marginBottom: '0.5rem' }}>Vs</div>
                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', width: '60px', height: '60px', borderRadius: '50%', backgroundColor: '#fef3c7', color: '#f59e0b', fontSize: '1.5rem', fontWeight: '900', boxShadow: '0 0 20px rgba(245, 158, 11, 0.4)' }}>
                            <Clock size={24} /> {timeLeft}s
                        </div>
                        <div style={{ fontSize: '0.8rem', color: '#6b7280', fontWeight: '600', marginTop: '0.5rem' }}>
                            Câu {question.questionIndex + 1}/{question.totalQuestions}
                        </div>
                    </div>

                    <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', flexDirection: 'row-reverse' }}>
                        <div style={{ width: '50px', height: '50px', borderRadius: '50%', backgroundColor: '#fee2e2', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#ef4444', fontWeight: 'bold', border: '3px solid #ef4444' }}>
                            Đối
                        </div>
                        <div style={{ textAlign: 'right' }}>
                            <div style={{ fontWeight: '700', fontSize: '1.1rem' }}>{opponent?.fullName}</div>
                            <div style={{ color: '#ef4444', fontWeight: '900', fontSize: '1.5rem' }}>{opponentScore}</div>
                        </div>
                    </div>
                </div>

                {/* Question Area */}
                <div style={{ backgroundColor: 'white', padding: '3rem', borderRadius: '24px', boxShadow: '0 10px 40px rgba(0,0,0,0.06)', textAlign: 'center', position: 'relative', overflow: 'hidden' }}>
                    <h2 style={{ fontSize: '2rem', fontWeight: '800', color: '#1f2937', marginBottom: '3rem', lineHeight: '1.5' }}>
                        {question.text}
                    </h2>

                    <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                        {question.options.map((opt, idx) => {
                            let bg = '#f8fafc';
                            let border = '2px solid #e2e8f0';
                            let color = '#334155';

                            if (selectedAnswer === idx) {
                                if (isCorrectAnswer) {
                                    bg = '#dcfce7'; border = '2px solid #10b981'; color = '#047857';
                                } else if (isCorrectAnswer === false) {
                                    bg = '#fee2e2'; border = '2px solid #ef4444'; color = '#b91c1c';
                                } else {
                                    bg = '#e0e7ff'; border = '2px solid #4f46e5'; color = '#3730a3';
                                }
                            } else if (selectedAnswer !== null) {
                                opacity = 0.6; // Đã trả lời thì làm mờ các lựa chọn khác
                            }

                            return (
                                <button
                                    key={idx}
                                    disabled={selectedAnswer !== null}
                                    onClick={() => handleAnswer(idx)}
                                    style={{
                                        padding: '1.25rem', borderRadius: '16px', fontSize: '1.1rem', fontWeight: '700',
                                        backgroundColor: bg, border, color, cursor: selectedAnswer !== null ? 'default' : 'pointer',
                                        transition: 'all 0.2s', width: '100%', textAlign: 'left', display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                                        opacity: selectedAnswer !== null && selectedAnswer !== idx ? 0.6 : 1
                                    }}
                                >
                                    <span>{String.fromCharCode(65 + idx)}. {opt}</span>
                                    {selectedAnswer === idx && isCorrectAnswer === true && <CheckCircle2 color="#10b981" />}
                                    {selectedAnswer === idx && isCorrectAnswer === false && <XCircle color="#ef4444" />}
                                </button>
                            );
                        })}
                    </div>

                    {selectedAnswer !== null && (
                        <div style={{ marginTop: '2rem', padding: '1rem', borderRadius: '12px', backgroundColor: '#f3f4f6', color: '#6b7280', fontWeight: '600' }}>
                            Đang đợi đối thủ trả lời...
                        </div>
                    )}
                </div>
            </div>
        );
    }

    if (status === 'game_over' && result) {
        const isWin = result.winnerId === user._id;
        const isDraw = result.winnerId === null;
        let xpGained = isWin ? 50 : isDraw ? 30 : 10;

        return (
            <div className="container" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: '80vh', textAlign: 'center' }}>
                <div style={{
                    width: '150px', height: '150px', borderRadius: '50%',
                    background: isWin ? 'linear-gradient(135deg, #fde68a, #f59e0b)' : isDraw ? 'linear-gradient(135deg, #e5e7eb, #9ca3af)' : 'linear-gradient(135deg, #fca5a5, #ef4444)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', marginBottom: '2rem',
                    boxShadow: isWin ? '0 20px 50px rgba(245, 158, 11, 0.4)' : 'none'
                }}>
                    <Trophy size={80} color={isWin ? 'white' : 'white'} />
                </div>

                <h1 style={{ fontSize: '3rem', fontWeight: '900', color: isWin ? '#d97706' : isDraw ? '#4b5563' : '#dc2626', marginBottom: '1rem' }}>
                    {isWin ? 'CHIẾN THẮNG!' : isDraw ? 'HÒA NHAU!' : 'THẤT BẠI!'}
                </h1>

                <div style={{ display: 'flex', gap: '3rem', margin: '2rem 0', backgroundColor: 'white', padding: '2rem 4rem', borderRadius: '24px', boxShadow: '0 15px 40px rgba(0,0,0,0.08)' }}>
                    <div style={{ textAlign: 'center' }}>
                        <div style={{ fontSize: '1rem', color: '#6b7280', fontWeight: '700', marginBottom: '0.5rem' }}>Điểm của bạn</div>
                        <div style={{ fontSize: '2.5rem', fontWeight: '900', color: '#4f46e5' }}>{result.myFinalScore}</div>
                    </div>
                    <div style={{ width: '2px', backgroundColor: '#e5e7eb' }}></div>
                    <div style={{ textAlign: 'center' }}>
                        <div style={{ fontSize: '1rem', color: '#6b7280', fontWeight: '700', marginBottom: '0.5rem' }}>Điểm đối thủ</div>
                        <div style={{ fontSize: '2.5rem', fontWeight: '900', color: '#ef4444' }}>{result.opponentFinalScore}</div>
                    </div>
                </div>

                <div style={{ fontSize: '1.25rem', fontWeight: '800', color: '#10b981', marginBottom: '3rem', backgroundColor: '#d1fae5', padding: '0.75rem 2rem', borderRadius: '99px' }}>
                    +{xpGained} XP
                </div>

                <div style={{ display: 'flex', gap: '1rem' }}>
                    <button onClick={() => setStatus('idle')} className="btn btn-primary" style={{ padding: '1rem 3rem', fontSize: '1.1rem', borderRadius: '99px', boxShadow: '0 10px 25px rgba(79, 70, 229, 0.4)' }}>
                        Đấu tiếp
                    </button>
                    <button onClick={() => navigate('/dashboard')} className="btn" style={{ padding: '1rem 3rem', fontSize: '1.1rem', borderRadius: '99px', backgroundColor: '#f3f4f6', color: '#4b5563', border: 'none', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                        <Home size={20} /> Về trang chủ
                    </button>
                </div>
            </div>
        );
    }

    return null;
};

export default Battle;
