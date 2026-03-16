import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Zap, Trophy, Flame, Play, Clock, ChevronRight, BookOpen, PlayCircle, User } from 'lucide-react';
import api from '../api/axios';
import mascotImg from '../assets/mascot.png';
import oppIcon from '../assets/opportunity.png';

const Dashboard = () => {
    const [user, setUser] = useState(JSON.parse(localStorage.getItem('user') || '{}'));
    const [loading, setLoading] = useState(true);
    const [nextLesson, setNextLesson] = useState(null);
    const [leaderboard, setLeaderboard] = useState([]);
    const [updatingLevel, setUpdatingLevel] = useState(false);
    const [localLevel, setLocalLevel] = useState(user.level || 'Thấp');
    const navigate = useNavigate();

    const fetchNextLesson = async (level) => {
        try {
            const lessonRes = await api.get(`/lessons?level=${level}`);
            if (lessonRes.data.data && lessonRes.data.data.length > 0) {
                const lessons = lessonRes.data.data;
                const randomIndex = Math.floor(Math.random() * lessons.length);
                setNextLesson(lessons[randomIndex]);
            } else {
                setNextLesson(null);
            }
        } catch (err) {
            console.error('Không thể lấy bài học', err);
        }
    };

    useEffect(() => {
        const fetchData = async () => {
            try {
                // Fetch thông tin user mới nhất
                const userRes = await api.get('/auth/me');
                const currentUser = userRes.data.data;
                setUser(currentUser);
                localStorage.setItem('user', JSON.stringify(currentUser));

                // Fetch bài học dựa trên level của user vừa lấy được
                await fetchNextLesson(currentUser.level);

                // Fetch bảng xếp hạng
                const leaderboardRes = await api.get('/auth/leaderboard');
                setLeaderboard(leaderboardRes.data.data);
            } catch (err) {
                console.error('Không thể lấy thông tin', err);
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, []); // Chạy 1 lần khi mount

    const handleLevelChange = async (newLevel) => {
        if (newLevel === localLevel || updatingLevel) return;

        setUpdatingLevel(true);
        try {
            setLocalLevel(newLevel);
            // Tải lại bài học mới cho level này
            await fetchNextLesson(newLevel);
        } catch (err) {
            console.error('Lỗi khi tải bài học mới', err);
            alert('Không thể tải bài học mới. Vui lòng thử lại!');
        } finally {
            setUpdatingLevel(false);
        }
    };

    const stats = [
        { label: 'Kinh nghiệm (XP)', value: user.xp || 0, icon: <Zap size={24} />, color: '#f59e0b', bg: '#fef3c7' },
        { label: 'Chuỗi ngày (Streak)', value: `${user.streak || 0} ngày`, icon: <Flame size={24} />, color: '#ef4444', bg: '#fee2e2' },
        { label: 'Cấp độ hiện tại', value: user.level || 'Thấp', icon: <Trophy size={24} />, color: '#4f46e5', bg: '#e0e7ff' },
    ];

    if (loading) {
        return (
            <div className="container" style={{ textAlign: 'center', marginTop: '5rem' }}>
                <div className="animate-pulse">Đang tải thông tin...</div>
            </div>
        );
    }

    return (
        <div className="container" style={{ paddingBottom: '3rem' }}>
            {/* Hero Section phong cách Mochi */}
            <div className="glass-card animate-fade-in" style={{
                marginTop: '1.5rem',
                marginBottom: '2rem',
                padding: '0',
                overflow: 'hidden',
                background: 'white',
                border: 'none',
                boxShadow: '0 10px 40px rgba(0,0,0,0.04)',
                borderRadius: '30px',
                display: 'flex',
                alignItems: 'center',
                position: 'relative',
                minHeight: '320px'
            }}>
                {/* Background Decor */}
                <div style={{
                    position: 'absolute',
                    top: '-50px',
                    right: '-50px',
                    width: '300px',
                    height: '300px',
                    borderRadius: '50%',
                    background: 'radial-gradient(circle, rgba(74, 144, 226, 0.08) 0%, transparent 70%)',
                    zIndex: 0
                }}></div>
                <div style={{
                    position: 'absolute',
                    bottom: '-20px',
                    left: '10%',
                    width: '150px',
                    height: '150px',
                    borderRadius: '50%',
                    background: 'radial-gradient(circle, rgba(245, 158, 11, 0.05) 0%, transparent 70%)',
                    zIndex: 0
                }}></div>

                <div style={{
                    display: 'flex',
                    width: '100%',
                    flexWrap: 'wrap-reverse',
                    position: 'relative',
                    zIndex: 1
                }}>
                    {/* Left: Content */}
                    <div style={{
                        flex: '1.2',
                        padding: '3rem 4rem',
                        display: 'flex',
                        flexDirection: 'column',
                        justifyContent: 'center',
                        minWidth: '350px'
                    }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', marginBottom: '1rem' }}>
                            <img src={oppIcon} alt="EngPath" style={{ width: '28px', height: '28px' }} />
                            <span style={{ fontSize: '1.2rem', fontWeight: '800', color: 'var(--primary)', letterSpacing: '0.5px' }}>ENGPATH</span>
                        </div>
                        <h1 style={{ fontSize: '2.4rem', color: '#2d3748', fontWeight: '800', lineHeight: '1.2', marginBottom: '1.2rem' }}>
                            Chào {user.fullName ? user.fullName.split(' ').pop() : 'bạn'}! 👋<br />
                            <span style={{ color: 'var(--primary)' }}>Chinh phục Tiếng Anh</span> ngay hôm nay.
                        </h1>
                        <p style={{ color: 'var(--gray-500)', fontSize: '1.05rem', marginBottom: '2rem', maxWidth: '450px', lineHeight: '1.6' }}>
                            Học tập thông minh hơn với lộ trình cá nhân hóa. Đạt mục tiêu {user.level} của bạn nhanh gấp 3 lần.
                        </p>
                        <button
                            onClick={() => navigate('/learning-path')}
                            className="btn btn-primary"
                            style={{
                                alignSelf: 'flex-start',
                                padding: '1rem 2.5rem',
                                borderRadius: '18px',
                                fontWeight: '800',
                                fontSize: '1.1rem',
                                boxShadow: '0 10px 25px rgba(74, 144, 226, 0.3)',
                                border: 'none'
                            }}
                        >
                            Bắt đầu học ngay
                        </button>
                    </div>

                    {/* Right: Mascot Image */}
                    <div style={{
                        flex: '1',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        padding: '2rem',
                        minWidth: '300px'
                    }}>
                        <div style={{ position: 'relative' }}>
                            {/* Decorative stars */}
                            <div style={{ position: 'absolute', top: '-10%', right: '10%', color: '#f59e0b', animation: 'bounce 3s infinite' }}>⭐</div>
                            <div style={{ position: 'absolute', bottom: '20%', left: '-10%', color: '#f59e0b', animation: 'bounce 4s infinite' }}>⭐</div>

                            <img
                                src={mascotImg}
                                alt="Mascot"
                                style={{
                                    width: '100%',
                                    maxHeight: '300px',
                                    objectFit: 'contain',
                                    filter: 'drop-shadow(0 20px 30px rgba(0,0,0,0.1))'
                                }}
                            />
                        </div>
                    </div>
                </div>
            </div>

            {/* Thống kê nhanh */}
            <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
                gap: '1.5rem',
                marginBottom: '4rem'
            }}>
                {stats.map((stat, index) => (
                    <div key={index} className="glass-card animate-fade-in" style={{
                        padding: '1.5rem',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '1.25rem',
                        animationDelay: `${index * 0.1}s`,
                        borderBottom: `4px solid ${stat.color}`
                    }}>
                        <div style={{
                            backgroundColor: stat.bg,
                            color: stat.color,
                            width: '60px',
                            height: '60px',
                            borderRadius: '20px',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center'
                        }}>
                            {stat.icon}
                        </div>
                        <div>
                            <div style={{ color: 'var(--gray-500)', fontSize: '0.875rem', fontWeight: '600' }}>{stat.label}</div>
                            <div style={{ fontSize: '1.75rem', fontWeight: '800', color: 'var(--dark)' }}>{stat.value}</div>
                        </div>
                    </div>
                ))}
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '2rem', flexWrap: 'wrap' }}>
                {/* Bài học đề xuất */}
                <div className="animate-fade-in" style={{ animationDelay: '0.3s' }}>
                    {/* Level Selector */}
                    <div style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '1rem',
                        marginBottom: '2rem',
                        padding: '0.5rem',
                        backgroundColor: 'white',
                        borderRadius: '20px',
                        width: 'fit-content',
                        boxShadow: '0 4px 15px rgba(0,0,0,0.02)'
                    }}>
                        <span style={{ fontSize: '0.85rem', fontWeight: '700', color: 'var(--gray-500)', marginLeft: '1rem' }}>ĐỘ KHÓ:</span>
                        {[
                            { id: 'Thấp', label: 'Dễ', color: '#10b981' },
                            { id: 'Trung', label: 'Trung bình', color: '#f59e0b' },
                            { id: 'Cao', label: 'Khó', color: '#8b5cf6' }
                        ].map((lvl) => (
                            <button
                                key={lvl.id}
                                onClick={() => handleLevelChange(lvl.id)}
                                disabled={updatingLevel}
                                style={{
                                    padding: '0.6rem 1.5rem',
                                    borderRadius: '15px',
                                    border: 'none',
                                    fontWeight: '700',
                                    fontSize: '0.9rem',
                                    cursor: updatingLevel ? 'not-allowed' : 'pointer',
                                    backgroundColor: localLevel === lvl.id ? lvl.color : 'transparent',
                                    color: localLevel === lvl.id ? 'white' : 'var(--gray-500)',
                                    transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                                    boxShadow: localLevel === lvl.id ? `0 8px 20px ${lvl.color}44` : 'none',
                                    opacity: updatingLevel && localLevel !== lvl.id ? 0.5 : 1
                                }}
                            >
                                {lvl.label}
                            </button>
                        ))}
                    </div>

                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
                        <h2 style={{ fontSize: '1.5rem', fontWeight: '800' }}>Bài học tiếp theo</h2>
                        <button
                            onClick={() => navigate('/learning-path')}
                            style={{ color: 'var(--primary)', background: 'none', border: 'none', fontWeight: '700', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.3rem' }}
                        >
                            Xem lộ trình <ChevronRight size={18} />
                        </button>
                    </div>

                    {nextLesson ? (
                        <div className="glass-card" style={{ padding: '2rem', display: 'flex', flexDirection: 'column', gap: '1.5rem', position: 'relative', overflow: 'hidden' }}>
                            <div style={{
                                position: 'absolute',
                                right: '-20px',
                                top: '-20px',
                                width: '150px',
                                height: '150px',
                                backgroundColor: 'rgba(74, 144, 226, 0.05)',
                                borderRadius: '50%',
                                zIndex: 0
                            }}></div>

                            <div style={{ display: 'flex', gap: '2rem', alignItems: 'center', position: 'relative', zIndex: 1 }}>
                                <div style={{
                                    width: '100px',
                                    height: '100px',
                                    borderRadius: '24px',
                                    backgroundColor: 'var(--primary)',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    color: 'white',
                                    boxShadow: '0 15px 30px -10px rgba(74, 144, 226, 0.5)'
                                }}>
                                    <BookOpen size={40} />
                                </div>
                                <div style={{ flex: 1 }}>
                                    <div style={{ display: 'flex', gap: '0.75rem', marginBottom: '0.5rem' }}>
                                        <span style={{ fontSize: '0.7rem', fontWeight: '800', padding: '0.2rem 0.6rem', borderRadius: '20px', backgroundColor: 'rgba(245, 158, 11, 0.1)', color: '#f59e0b', textTransform: 'uppercase' }}>
                                            {nextLesson.type}
                                        </span>
                                        <span style={{ fontSize: '0.7rem', fontWeight: '800', padding: '0.2rem 0.6rem', borderRadius: '20px', backgroundColor: 'rgba(16, 185, 129, 0.1)', color: '#10b981', textTransform: 'uppercase' }}>
                                            {nextLesson.level}
                                        </span>
                                    </div>
                                    <h3 style={{ fontSize: '1.75rem', margin: '0', fontWeight: '800' }}>{nextLesson.title}</h3>
                                    <p style={{ color: 'var(--gray-500)', fontSize: '1rem', marginTop: '0.5rem' }}>
                                        {nextLesson.description}
                                    </p>
                                </div>
                            </div>

                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingTop: '1.5rem', borderTop: '1px solid var(--gray-100)', position: 'relative', zIndex: 1 }}>
                                <div style={{ display: 'flex', gap: '2rem' }}>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontWeight: '600', color: 'var(--gray-800)' }}>
                                        <Clock size={18} style={{ color: 'var(--primary)' }} /> {nextLesson.duration} phút
                                    </div>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontWeight: '600', color: 'var(--gray-800)' }}>
                                        <Zap size={18} style={{ color: '#f59e0b' }} /> {nextLesson.xpAwarded} XP
                                    </div>
                                </div>
                                <button
                                    onClick={() => navigate(`/lessons/${nextLesson._id}`)}
                                    className="btn btn-primary"
                                    style={{ padding: '0.8rem 2.5rem', borderRadius: '15px', fontWeight: '700', display: 'flex', alignItems: 'center', gap: '0.5rem', boxShadow: '0 10px 20px -5px rgba(74, 144, 226, 0.3)' }}
                                >
                                    Bắt đầu <PlayCircle size={20} />
                                </button>
                            </div>
                        </div>
                    ) : (
                        <div className="glass-card" style={{ padding: '3rem', textAlign: 'center' }}>
                            <p style={{ color: 'var(--gray-500)' }}>Bạn đã hoàn thành tất cả bài học!</p>
                        </div>
                    )}
                </div>

                {/* Sidebar: Bảng xếp hạng */}
                <div className="animate-fade-in" style={{ animationDelay: '0.4s' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
                        <h2 style={{ fontSize: '1.5rem', fontWeight: '800' }}>Bảng xếp hạng</h2>
                        <Trophy size={20} style={{ color: '#f59e0b' }} />
                    </div>

                    <div className="glass-card" style={{ padding: '1rem', display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                        {leaderboard.length > 0 ? (
                            leaderboard.map((u, index) => (
                                <div key={u._id} style={{
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: '0.75rem',
                                    padding: '0.6rem',
                                    borderRadius: '12px',
                                    backgroundColor: u._id === user._id ? 'rgba(74, 144, 226, 0.1)' : 'transparent',
                                    border: u._id === user._id ? '1px solid rgba(74, 144, 226, 0.2)' : 'none'
                                }}>
                                    <div style={{
                                        width: '28px',
                                        fontWeight: '800',
                                        color: index === 0 ? '#f59e0b' : index === 1 ? '#94a3b8' : index === 2 ? '#b45309' : 'var(--gray-400)',
                                        fontSize: index < 3 ? '1.1rem' : '0.9rem',
                                        textAlign: 'center'
                                    }}>
                                        {index === 0 ? '🥇' : index === 1 ? '🥈' : index === 2 ? '🥉' : index + 1}
                                    </div>

                                    <div style={{
                                        width: '36px',
                                        height: '36px',
                                        borderRadius: '10px',
                                        backgroundColor: 'var(--gray-100)',
                                        overflow: 'hidden',
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                        border: '2px solid white'
                                    }}>
                                        {u.avatar ? (
                                            <img src={u.avatar} alt="Avatar" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                                        ) : (
                                            <User size={18} style={{ color: 'var(--gray-400)' }} />
                                        )}
                                    </div>

                                    <div style={{ flex: 1 }}>
                                        <div style={{
                                            fontSize: '0.9rem',
                                            fontWeight: '700',
                                            color: u._id === user._id ? 'var(--primary)' : 'var(--dark)',
                                            whiteSpace: 'nowrap',
                                            overflow: 'hidden',
                                            textOverflow: 'ellipsis',
                                            maxWidth: '120px'
                                        }}>
                                            {u.fullName}
                                        </div>
                                        <div style={{ fontSize: '0.7rem', color: 'var(--gray-400)', fontWeight: '600' }}>{u.level}</div>
                                    </div>

                                    <div style={{ textAlign: 'right' }}>
                                        <div style={{ fontSize: '0.9rem', fontWeight: '800', color: 'var(--primary)' }}>{u.xp}</div>
                                        <div style={{ fontSize: '0.6rem', fontWeight: '700', color: 'var(--gray-400)', textTransform: 'uppercase' }}>XP</div>
                                    </div>
                                </div>
                            ))
                        ) : (
                            <p style={{ textAlign: 'center', color: 'var(--gray-400)', fontSize: '0.9rem', padding: '1rem' }}>Chưa có dữ liệu xếp hạng</p>
                        )}

                        <div style={{ marginTop: '0.5rem', paddingTop: '1rem', borderTop: '1px solid var(--gray-100)' }}>
                            <button
                                onClick={() => navigate('/learning-path')}
                                style={{
                                    width: '100%',
                                    padding: '0.75rem',
                                    borderRadius: '12px',
                                    border: 'none',
                                    backgroundColor: 'var(--gray-50)',
                                    color: 'var(--gray-600)',
                                    fontWeight: '700',
                                    fontSize: '0.85rem',
                                    cursor: 'pointer',
                                    transition: 'all 0.2s'
                                }}
                                onMouseOver={(e) => e.target.style.backgroundColor = 'var(--gray-100)'}
                                onMouseOut={(e) => e.target.style.backgroundColor = 'var(--gray-50)'}
                            >
                                Học tiếp để thăng hạng 🚀
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Dashboard;
