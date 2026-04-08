import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Zap, Trophy, Flame, Play, Clock, ChevronRight, BookOpen, PlayCircle, User, X, CheckCircle2, HelpCircle, Tag } from 'lucide-react';
import api from '../api/axios';
import mascotImg from '../assets/mascot.png';
import oppIcon from '../assets/opportunity.png';
import DailyTaskWidget from '../components/DailyTaskWidget';

const DAILY_QUOTES = [
    { en: "Design a life you love, not just a career.", vi: "Hãy thiết kế một cuộc đời bạn yêu thích, chứ không chỉ là một sự nghiệp." },
    { en: "Collect moments, not things.", vi: "Hãy thu thập những khoảnh khắc, đừng chỉ thu thập vật chất." },
    { en: "Slow down and enjoy the simple things.", vi: "Hãy sống chậm lại và tận hưởng những điều đơn giản nhất." },
    { en: "Consistency is more important than intensity. 15 minutes every day is better than 3 hours once a week.", vi: "Sự kiên trì quan trọng hơn cường độ. 15 phút mỗi ngày tốt hơn 3 tiếng một lần mỗi tuần." },
    { en: "Don't be afraid to make mistakes. Mistakes are the stepping stones to fluency.", vi: "Đừng sợ sai. Sai lầm chính là những bậc thềm dẫn đến sự lưu loát." },
    { en: "Think in English. Try to describe your daily activities in your head using English.", vi: "Hãy tư duy bằng Tiếng Anh. Thử mô tả các hoạt động hàng ngày của bạn trong đầu bằng Tiếng Anh." },
    { en: "Every expert was once a beginner.", vi: "Mọi chuyên gia đều từng là người mới bắt đầu." },
    { en: "The secret of getting ahead is getting started.", vi: "Bí quyết để tiến xa là hãy bắt đầu ngay." },
];

const ENGLISH_TIPS = [
    { title: "Học từ vựng theo ngữ cảnh", content: "Đừng học từ đơn lẻ. Hãy học từ trong câu hoặc đoạn văn để nhớ lâu hơn.", tag: "Từ vựng" },
    { title: "Luyện nghe mỗi ngày", content: "Nghe podcast tiếng Anh 15 phút mỗi ngày giúp tai bạn quen với âm thanh tự nhiên.", tag: "Nghe" },
    { title: "Nói to khi luyện tập", content: "Đọc to các câu tiếng Anh giúp não bộ ghi nhớ và luyện phản xạ ngôn ngữ nhanh hơn.", tag: "Nói" },
    { title: "Viết nhật ký bằng tiếng Anh", content: "Dành 5 phút mỗi tối viết vài câu về ngày hôm đó để luyện kỹ năng viết tự nhiên.", tag: "Viết" },
    { title: "Xem phim với phụ đề", content: "Bắt đầu với phụ đề tiếng Việt, sau đó chuyển sang phụ đề tiếng Anh để học cách dùng từ.", tag: "Nghe" },
];

const Dashboard = () => {
    const [user, setUser] = useState(JSON.parse(localStorage.getItem('user') || '{}'));
    const [loading, setLoading] = useState(true);
    const [nextLesson, setNextLesson] = useState(null);
    const [leaderboard, setLeaderboard] = useState([]);
    const [leaderboardTab, setLeaderboardTab] = useState(user.level || 'Thấp');
    const [updatingLevel, setUpdatingLevel] = useState(false);
    const [localLevel, setLocalLevel] = useState(user.level || 'Thấp');
    // Modal 12: Danh sách bài đã hoàn thành
    const [showCompletedModal, setShowCompletedModal] = useState(false);
    // Modal chi tiết bài học đã hoàn thành
    const [selectedCompletedLesson, setSelectedCompletedLesson] = useState(null);
    // Right sidebar widgets
    const [dailyQuote] = useState(() => DAILY_QUOTES[Math.floor(Math.random() * DAILY_QUOTES.length)]);
    const [dailyTip] = useState(() => ENGLISH_TIPS[Math.floor(Math.random() * ENGLISH_TIPS.length)]);
    const [wordsLearned] = useState(() => Math.floor(Math.random() * 8) + 1);
    const dailyGoal = 10;
    const navigate = useNavigate();

    const fetchLeaderboardData = async (level) => {
        try {
            const leaderboardRes = await api.get(`/auth/leaderboard?level=${level}`);
            setLeaderboard(leaderboardRes.data.data);
        } catch (err) {
            console.error('Không thể lấy bảng xếp hạng', err);
        }
    };

    const handleLeaderboardTab = (lvl) => {
        setLeaderboardTab(lvl);
        fetchLeaderboardData(lvl);
    };

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

                // Fetch bảng xếp hạng cho level hiện tại của user
                if (!leaderboardTab) setLeaderboardTab(currentUser.level || 'Thấp');
                await fetchLeaderboardData(currentUser.level || 'Thấp');
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
        { label: 'Bài đã hoàn thành', value: user.completedLessons?.length || 0, icon: <CheckCircle2 size={24} />, color: '#10b981', bg: '#d1fae5', onClick: () => setShowCompletedModal(true) },
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
                    <div key={index} className="glass-card animate-fade-in" onClick={stat.onClick || undefined} style={{
                        padding: '1.5rem',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '1.25rem',
                        animationDelay: `${index * 0.1}s`,
                        borderBottom: `4px solid ${stat.color}`,
                        cursor: stat.onClick ? 'pointer' : 'default',
                        transition: stat.onClick ? 'transform 0.2s, box-shadow 0.2s' : undefined
                    }}
                        onMouseEnter={stat.onClick ? (e) => { e.currentTarget.style.transform = 'translateY(-2px)'; e.currentTarget.style.boxShadow = '0 8px 20px rgba(0,0,0,0.1)'; } : undefined}
                        onMouseLeave={stat.onClick ? (e) => { e.currentTarget.style.transform = ''; e.currentTarget.style.boxShadow = ''; } : undefined}
                    >
                        <div style={{ backgroundColor: stat.bg, color: stat.color, width: '60px', height: '60px', borderRadius: '20px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                            {stat.icon}
                        </div>
                        <div>
                            <div style={{ color: 'var(--gray-500)', fontSize: '0.875rem', fontWeight: '600' }}>{stat.label}</div>
                            <div style={{ fontSize: '1.75rem', fontWeight: '800', color: 'var(--dark)' }}>{stat.value}</div>
                            {stat.onClick && <div style={{ fontSize: '0.75rem', color: stat.color, fontWeight: '600' }}>Bấm để xem chi tiết →</div>}
                        </div>
                    </div>
                ))}
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr 1fr', gap: '2rem', alignItems: 'start' }}>
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

                <div className="animate-fade-in" style={{ animationDelay: '0.4s' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
                        <h2 style={{ fontSize: '1.5rem', fontWeight: '800' }}>Bảng xếp hạng</h2>
                        <Trophy size={20} style={{ color: '#f59e0b' }} />
                    </div>

                    {/* Tabs Bảng xếp hạng */}
                    <div style={{
                        display: 'flex',
                        background: 'white',
                        padding: '0.4rem',
                        borderRadius: '16px',
                        marginBottom: '1rem',
                        gap: '0.4rem',
                        boxShadow: '0 4px 15px rgba(0,0,0,0.02)'
                    }}>
                        {['Thấp', 'Trung', 'Cao'].map((lvl) => (
                            <button
                                key={lvl}
                                onClick={() => handleLeaderboardTab(lvl)}
                                style={{
                                    flex: 1,
                                    padding: '0.6rem',
                                    border: 'none',
                                    borderRadius: '12px',
                                    fontWeight: '700',
                                    fontSize: '0.85rem',
                                    cursor: 'pointer',
                                    backgroundColor: leaderboardTab === lvl ? 'var(--primary)' : 'transparent',
                                    color: leaderboardTab === lvl ? 'white' : 'var(--gray-500)',
                                    transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                                    boxShadow: leaderboardTab === lvl ? '0 4px 10px rgba(79, 70, 229, 0.3)' : 'none',
                                }}
                            >
                                {lvl}
                            </button>
                        ))}
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

                {/* ===== SIDEBAR WIDGETS (cột giữa) ===== */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>

                    {/* Quote Card */}
                    <div className="glass-card animate-fade-in" style={{
                        padding: '1.75rem',
                        background: 'linear-gradient(135deg, #fdf6ff 0%, #f0f4ff 100%)',
                        border: '1px solid rgba(124, 58, 237, 0.1)',
                        borderRadius: '20px',
                        position: 'relative',
                        overflow: 'hidden',
                        animationDelay: '0.5s'
                    }}>
                        <div style={{
                            position: 'absolute', top: '-10px', left: '12px',
                            fontSize: '5rem', color: 'rgba(124, 58, 237, 0.12)',
                            fontFamily: 'Georgia, serif', lineHeight: 1, userSelect: 'none'
                        }}>"</div>
                        <p style={{
                            fontStyle: 'italic', fontSize: '0.95rem', color: '#4c1d95',
                            fontWeight: '600', lineHeight: '1.6', margin: '0 0 0.75rem',
                            position: 'relative', zIndex: 1, paddingTop: '0.5rem'
                        }}>"{dailyQuote.en}"</p>
                        <p style={{
                            fontSize: '0.8rem', color: '#7c3aed', lineHeight: '1.5',
                            margin: 0, fontStyle: 'italic', opacity: 0.8
                        }}>({dailyQuote.vi})</p>
                        <div style={{
                            display: 'flex', alignItems: 'center', gap: '0.4rem',
                            marginTop: '1rem', paddingTop: '0.75rem',
                            borderTop: '1px solid rgba(124,58,237,0.1)'
                        }}>
                            <span style={{ fontSize: '0.7rem', fontWeight: '700', color: '#7c3aed', textTransform: 'uppercase', letterSpacing: '0.05em' }}>✨ Quote of the Day</span>
                        </div>
                    </div>

                    {/* Tip of the Day */}
                    <div className="glass-card animate-fade-in" style={{
                        padding: '1.5rem',
                        borderRadius: '20px',
                        border: '1px solid rgba(16,185,129,0.12)',
                        background: 'linear-gradient(135deg, #f0fdf4 0%, #ecfdf5 100%)',
                        animationDelay: '0.6s'
                    }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.75rem' }}>
                            <span style={{
                                fontSize: '0.65rem', fontWeight: '800', textTransform: 'uppercase',
                                letterSpacing: '0.08em', color: 'white', backgroundColor: '#10b981',
                                padding: '0.2rem 0.6rem', borderRadius: '99px'
                            }}>💡 English Tip</span>
                            <span style={{
                                fontSize: '0.65rem', fontWeight: '700', color: '#10b981',
                                backgroundColor: 'rgba(16,185,129,0.1)', padding: '0.2rem 0.5rem', borderRadius: '99px'
                            }}>{dailyTip.tag}</span>
                        </div>
                        <h4 style={{ fontSize: '0.95rem', fontWeight: '800', color: '#065f46', margin: '0 0 0.5rem' }}>
                            {dailyTip.title}
                        </h4>
                        <p style={{ fontSize: '0.85rem', color: '#047857', lineHeight: '1.6', margin: '0 0 1rem' }}>
                            {dailyTip.content}
                        </p>
                        <button
                            onClick={() => navigate('/learning-path')}
                            style={{
                                fontSize: '0.8rem', fontWeight: '700', color: '#10b981',
                                background: 'rgba(16,185,129,0.1)', border: '1px solid rgba(16,185,129,0.2)',
                                borderRadius: '10px', padding: '0.4rem 1rem', cursor: 'pointer',
                                transition: 'all 0.2s'
                            }}
                            onMouseOver={e => { e.target.style.background = '#10b981'; e.target.style.color = 'white'; }}
                            onMouseOut={e => { e.target.style.background = 'rgba(16,185,129,0.1)'; e.target.style.color = '#10b981'; }}
                        >
                            Learn more →
                        </button>
                    </div>

                    {/* Progress Tracker / Daily Tasks */}
                    <div style={{ animationDelay: '0.7s', animationFillMode: 'both' }} className="animate-fade-in">
                        <DailyTaskWidget />
                    </div>

                </div>
            </div>

            {/* ===== MODAL 12: Danh sách bài đã hoàn thành ===== */}
            {showCompletedModal && (
                <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0,0,0,0.5)', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 50 }}>
                    <div style={{ backgroundColor: 'white', borderRadius: '16px', padding: '2rem', width: '580px', maxWidth: '92%', maxHeight: '80vh', display: 'flex', flexDirection: 'column', boxShadow: '0 25px 50px rgba(0,0,0,0.15)' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
                            <div>
                                <h3 style={{ fontWeight: 'bold', fontSize: '1.3rem', margin: 0 }}>🏆 Bài học đã hoàn thành</h3>
                                <p style={{ color: 'var(--gray-500)', fontSize: '0.875rem', margin: '0.25rem 0 0' }}>Tổng cộng: {user.completedLessons?.length || 0} bài</p>
                            </div>
                            <button onClick={() => setShowCompletedModal(false)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#9ca3af' }}><X size={22} /></button>
                        </div>
                        <div style={{ overflowY: 'auto', flex: 1, display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                            {user.completedLessons?.length > 0 ? (
                                user.completedLessons.map((cl, i) => (
                                    <div
                                        key={i}
                                        onClick={() => setSelectedCompletedLesson(cl)}
                                        style={{
                                            display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                                            padding: '0.875rem 1.25rem', backgroundColor: '#f0fdf4', borderRadius: '10px',
                                            border: '1px solid #bbf7d0', cursor: 'pointer', transition: 'all 0.2s'
                                        }}
                                        onMouseEnter={e => {
                                            e.currentTarget.style.backgroundColor = '#dcfce7';
                                            e.currentTarget.style.borderColor = '#10b981';
                                            e.currentTarget.style.transform = 'translateX(4px)';
                                        }}
                                        onMouseLeave={e => {
                                            e.currentTarget.style.backgroundColor = '#f0fdf4';
                                            e.currentTarget.style.borderColor = '#bbf7d0';
                                            e.currentTarget.style.transform = 'translateX(0)';
                                        }}
                                    >
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                                            <CheckCircle2 size={20} color="#10b981" />
                                            <div>
                                                <div style={{ fontWeight: '600' }}>{cl.lesson?.title || 'Bài học'}</div>
                                                <div style={{ fontSize: '0.75rem', color: '#6b7280', marginTop: '1px' }}>Nhấn để xem chi tiết</div>
                                            </div>
                                        </div>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                                            {cl.score != null && (
                                                <span style={{ fontSize: '0.8rem', fontWeight: '700', color: cl.score >= 70 ? '#10b981' : '#ef4444', backgroundColor: cl.score >= 70 ? '#f0fdf4' : '#fef2f2', padding: '0.2rem 0.5rem', borderRadius: '6px' }}>
                                                    {cl.score}%
                                                </span>
                                            )}
                                            <span style={{ color: '#6b7280', fontSize: '0.82rem', whiteSpace: 'nowrap' }}>{new Date(cl.completedAt).toLocaleDateString('vi-VN')}</span>
                                            <span style={{ color: '#10b981', opacity: 0.6 }}>›</span>
                                        </div>
                                    </div>
                                ))
                            ) : (
                                <div style={{ textAlign: 'center', padding: '3rem', color: 'var(--gray-500)' }}>Bạn chưa hoàn thành bài học nào. Hãy bắt đầu ngay!</div>
                            )}
                        </div>
                        <button onClick={() => setShowCompletedModal(false)} className="btn btn-primary" style={{ marginTop: '1.5rem' }}>Đóng</button>
                    </div>
                </div>
            )}

            {/* ===== MODAL Chi tiết bài học (Dashboard) ===== */}
            {selectedCompletedLesson && (
                <div
                    onClick={() => setSelectedCompletedLesson(null)}
                    style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0,0,0,0.6)', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 60, backdropFilter: 'blur(4px)' }}
                >
                    <div
                        onClick={e => e.stopPropagation()}
                        style={{ backgroundColor: 'white', borderRadius: '20px', padding: '0', width: '500px', maxWidth: '94%', boxShadow: '0 30px 60px rgba(0,0,0,0.2)', overflow: 'hidden', animation: 'fadeInUp 0.25s ease' }}
                    >
                        {/* Header */}
                        <div style={{ background: 'linear-gradient(135deg, #4a90e2 0%, #6c63ff 100%)', padding: '1.5rem 2rem', color: 'white', position: 'relative' }}>
                            <button onClick={() => setSelectedCompletedLesson(null)} style={{ position: 'absolute', top: '1rem', right: '1rem', background: 'rgba(255,255,255,0.2)', border: 'none', cursor: 'pointer', color: 'white', borderRadius: '50%', width: '32px', height: '32px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                <X size={18} />
                            </button>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', marginBottom: '0.4rem', opacity: 0.85 }}>
                                <BookOpen size={18} />
                                <span style={{ fontSize: '0.82rem', fontWeight: '600' }}>Chi tiết bài học</span>
                            </div>
                            <h3 style={{ fontWeight: '800', fontSize: '1.2rem', margin: 0, lineHeight: 1.3 }}>
                                {selectedCompletedLesson.lesson?.title || 'Bài học đã hoàn thành'}
                            </h3>
                        </div>

                        {/* Body */}
                        <div style={{ padding: '1.5rem 2rem' }}>
                            {/* Ngày giờ */}
                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1.25rem', padding: '0.75rem 1rem', backgroundColor: '#f8fafc', borderRadius: '10px' }}>
                                <Clock size={16} style={{ color: 'var(--primary)', flexShrink: 0 }} />
                                <div>
                                    <div style={{ fontSize: '0.72rem', color: '#6b7280', fontWeight: '600', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Ngày hoàn thành</div>
                                    <div style={{ fontSize: '0.9rem', fontWeight: '700', color: '#1f2937' }}>
                                        {new Date(selectedCompletedLesson.completedAt).toLocaleString('vi-VN', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
                                    </div>
                                </div>
                            </div>

                            {/* Stats */}
                            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '0.6rem', marginBottom: '1.25rem' }}>
                                <div style={{ padding: '0.875rem 0.5rem', backgroundColor: 'rgba(74,144,226,0.07)', borderRadius: '12px', textAlign: 'center' }}>
                                    <div style={{ fontSize: '1.5rem', fontWeight: '900', color: '#4a90e2' }}>{selectedCompletedLesson.score ?? '—'}%</div>
                                    <div style={{ fontSize: '0.7rem', color: '#6b7280', fontWeight: '600', marginTop: '2px' }}>Số điểm</div>
                                </div>
                                <div style={{ padding: '0.875rem 0.5rem', backgroundColor: 'rgba(16,185,129,0.07)', borderRadius: '12px', textAlign: 'center' }}>
                                    <div style={{ fontSize: '1.5rem', fontWeight: '900', color: '#10b981' }}>{selectedCompletedLesson.correctAnswers ?? '—'}</div>
                                    <div style={{ fontSize: '0.7rem', color: '#6b7280', fontWeight: '600', marginTop: '2px' }}>Câu đúng</div>
                                </div>
                                <div style={{ padding: '0.875rem 0.5rem', backgroundColor: 'rgba(239,68,68,0.07)', borderRadius: '12px', textAlign: 'center' }}>
                                    <div style={{ fontSize: '1.5rem', fontWeight: '900', color: '#ef4444' }}>{selectedCompletedLesson.wrongAnswers ?? '—'}</div>
                                    <div style={{ fontSize: '0.7rem', color: '#6b7280', fontWeight: '600', marginTop: '2px' }}>Câu sai</div>
                                </div>
                                <div style={{ padding: '0.875rem 0.5rem', backgroundColor: 'rgba(245,158,11,0.07)', borderRadius: '12px', textAlign: 'center' }}>
                                    <div style={{ fontSize: '1.5rem', fontWeight: '900', color: '#f59e0b' }}>{selectedCompletedLesson.totalQuestions ?? '—'}</div>
                                    <div style={{ fontSize: '0.7rem', color: '#6b7280', fontWeight: '600', marginTop: '2px' }}>Tổng câu</div>
                                </div>
                            </div>

                            {/* Progress bar */}
                            {selectedCompletedLesson.totalQuestions > 0 && (
                                <div style={{ marginBottom: '1.25rem' }}>
                                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.78rem', color: '#6b7280', fontWeight: '600', marginBottom: '0.4rem' }}>
                                        <span>Tỷ lệ đúng</span>
                                        <span style={{ color: selectedCompletedLesson.score >= 70 ? '#10b981' : '#ef4444' }}>{selectedCompletedLesson.score}%</span>
                                    </div>
                                    <div style={{ height: '8px', backgroundColor: '#e5e7eb', borderRadius: '99px', overflow: 'hidden' }}>
                                        <div style={{ height: '100%', width: `${selectedCompletedLesson.score}%`, backgroundColor: selectedCompletedLesson.score >= 70 ? '#10b981' : '#ef4444', borderRadius: '99px', transition: 'width 0.6s ease' }} />
                                    </div>
                                </div>
                            )}

                            {/* Đánh giá */}
                            {selectedCompletedLesson.totalQuestions > 0 && (
                                <div style={{ padding: '0.75rem 1rem', borderRadius: '10px', marginBottom: '1.25rem', backgroundColor: selectedCompletedLesson.score >= 70 ? '#ecfdf5' : '#fef2f2', color: selectedCompletedLesson.score >= 70 ? '#047857' : '#b91c1c', display: 'flex', alignItems: 'center', gap: '0.5rem', fontWeight: '700', fontSize: '0.9rem' }}>
                                    {selectedCompletedLesson.score >= 70
                                        ? <><CheckCircle2 size={18} /> Xuất sắc! Bạn đã nắm vững bài học này.</>
                                        : <><HelpCircle size={18} /> Cần cố gắng thêm. Hãy xem lại bài học nhé!</>}
                                </div>
                            )}

                            <button onClick={() => setSelectedCompletedLesson(null)} className="btn btn-primary" style={{ width: '100%', padding: '0.875rem', borderRadius: '12px', fontWeight: '700', fontSize: '1rem' }}>
                                Đóng
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Dashboard;
