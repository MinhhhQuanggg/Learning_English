import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { BookOpen, Check, Circle, ChevronRight, Play, Star } from 'lucide-react';
import api from '../api/axios';

const LearningPath = () => {
    const [lessons, setLessons] = useState([]);
    const [loading, setLoading] = useState(true);
    const [user, setUser] = useState(JSON.parse(localStorage.getItem('user') || '{}'));
    const navigate = useNavigate();

    useEffect(() => {
        const fetchUserDataAndLessons = async () => {
            try {
                // Fetch latest user data from server to ensure completedLessons is up to date
                const meRes = await api.get('/auth/me');
                if (meRes.data && meRes.data.success) {
                    setUser(meRes.data.data);
                    localStorage.setItem('user', JSON.stringify(meRes.data.data));
                }

                // Use the latest level
                const levelToFetch = meRes.data?.data?.level || user.level;
                const response = await api.get(`/lessons?level=${levelToFetch}`);
                setLessons(response.data.data);
            } catch (err) {
                console.error('Không thể lấy danh sách bài học', err);
            } finally {
                setLoading(false);
            }
        };

        fetchUserDataAndLessons();
    }, []);

    if (loading) {
        return (
            <div className="container" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: '60vh' }}>
                <div style={{ width: '48px', height: '48px', border: '4px solid #e2e8f0', borderTopColor: '#3b82f6', borderRadius: '50%', animation: 'spin 1s linear infinite' }} />
                <div style={{ marginTop: '1.5rem', color: '#64748b', fontWeight: '500', fontSize: '1.1rem' }}>Đang tải lộ trình học tập...</div>
            </div>
        );
    }

    return (
        <div style={{
            background: 'linear-gradient(135deg, #f0f4f8 0%, #e0e7ff 100%)',
            minHeight: '100vh',
            paddingBottom: '8rem',
            fontFamily: "'Inter', system-ui, sans-serif"
        }}>
            <style>
                {`
                @keyframes spin { 100% { transform: rotate(360deg); } }
                @keyframes pulse-glow {
                    0% { box-shadow: 0 0 0 0 rgba(59, 130, 246, 0.4); }
                    70% { box-shadow: 0 0 0 15px rgba(59, 130, 246, 0); }
                    100% { box-shadow: 0 0 0 0 rgba(59, 130, 246, 0); }
                }
                `}
            </style>

            {/* Header section: Trong suốt & Sang trọng */}
            <div style={{ padding: '4rem 0 3.5rem 0', textAlign: 'center' }}>
                <div className="container" style={{ maxWidth: '800px', margin: '0 auto' }}>
                    <h1 style={{
                        fontSize: '3.25rem',
                        fontWeight: '900',
                        marginBottom: '1.25rem',
                        letterSpacing: '-0.04em',
                        background: 'linear-gradient(to right, #1e3a8a, #3b82f6, #06b6d4)',
                        WebkitBackgroundClip: 'text',
                        WebkitTextFillColor: 'transparent',
                        paddingBottom: '0.2rem'
                    }}>
                        Lộ trình của bạn
                    </h1>

                    <div style={{
                        display: 'inline-flex',
                        alignItems: 'center',
                        backgroundColor: 'rgba(255, 255, 255, 0.8)',
                        backdropFilter: 'blur(10px)',
                        padding: '0.5rem 1.5rem',
                        borderRadius: '999px',
                        boxShadow: '0 4px 15px rgba(0,0,0,0.03)',
                        border: '1px solid rgba(255,255,255,1)'
                    }}>
                        <span style={{ color: '#475569', fontSize: '1.1rem', marginRight: '0.5rem', fontWeight: '500' }}>Trình độ hiện tại:</span>
                        <span style={{ fontWeight: '800', color: '#1d4ed8', fontSize: '1.15rem', textTransform: 'uppercase', letterSpacing: '0.02em' }}>{user.level}</span>
                    </div>
                </div>
            </div>

            {/* Timeline & Cards */}
            <div className="container" style={{ display: 'flex', justifyContent: 'center', padding: '0 1rem' }}>
                <div style={{ width: '100%', maxWidth: '780px', position: 'relative' }}>
                    {lessons.map((lesson, index) => {
                        const isCompleted = user.completedLessons?.some(cl => (cl.lesson?._id || cl.lesson) === lesson._id);
                        const firstUncompletedIndex = lessons.findIndex(l => !user.completedLessons?.some(cl => (cl.lesson?._id || cl.lesson) === l._id));
                        const isNext = index === firstUncompletedIndex || (firstUncompletedIndex === -1 && index === lessons.length - 1);

                        return (
                            <div key={lesson._id} style={{
                                display: 'flex',
                                gap: '2.5rem',
                                marginBottom: '3rem',
                                position: 'relative',
                                zIndex: 1
                            }}>
                                {/* Đường thẳng kết nối các Node dọc */}
                                {index !== lessons.length - 1 && (
                                    <div style={{
                                        position: 'absolute',
                                        left: '30px', /* (64px node / 2) - (4px line / 2) = 30px */
                                        top: '64px',
                                        bottom: '-3rem',
                                        width: '4px',
                                        backgroundColor: isCompleted ? '#3b82f6' : '#cbd5e1',
                                        borderRadius: '2px',
                                        zIndex: 0,
                                        transition: 'background-color 0.5s ease'
                                    }} />
                                )}

                                {/* Node Icon (Mốc thời gian) */}
                                <div style={{
                                    width: '64px',
                                    height: '64px',
                                    flexShrink: 0,
                                    borderRadius: '50%',
                                    backgroundColor: isCompleted ? '#3b82f6' : (isNext ? '#ffffff' : '#f8fafc'),
                                    border: isCompleted ? 'none' : (isNext ? '4px solid #3b82f6' : '4px solid #cbd5e1'),
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    color: isCompleted ? 'white' : (isNext ? '#3b82f6' : '#94a3b8'),
                                    boxShadow: isCompleted
                                        ? '0 6px 12px -2px rgba(59, 130, 246, 0.4)'
                                        : (isNext ? '0 8px 16px -4px rgba(59, 130, 246, 0.3)' : 'none'),
                                    animation: isNext ? 'pulse-glow 2s infinite' : 'none',
                                    zIndex: 1,
                                    transition: 'all 0.3s ease',
                                    background: isCompleted ? 'linear-gradient(135deg, #60a5fa, #2563eb)' : ''
                                }}>
                                    {isCompleted ? <Check size={32} strokeWidth={3} /> : (isNext ? <Play size={28} fill="currentColor" style={{ marginLeft: '4px' }} /> : <div style={{ width: '14px', height: '14px', backgroundColor: '#cbd5e1', borderRadius: '50%' }} />)}
                                </div>

                                {/* Thông tin Bài Học (Card Kính / Glassmorphism) */}
                                <div style={{
                                    flex: 1,
                                    padding: '2rem',
                                    display: 'flex',
                                    justifyContent: 'space-between',
                                    alignItems: 'center',
                                    cursor: 'pointer',
                                    backgroundColor: 'rgba(255, 255, 255, 0.85)',
                                    backdropFilter: 'blur(16px)',
                                    WebkitBackdropFilter: 'blur(16px)',
                                    borderRadius: '24px',
                                    border: '1px solid rgba(255, 255, 255, 1)',
                                    boxShadow: '0 10px 40px -10px rgba(0,0,0,0.06), 0 1px 3px rgba(0,0,0,0.02)',
                                    transition: 'all 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275)',
                                    zIndex: 1
                                }}
                                    onMouseEnter={(e) => {
                                        e.currentTarget.style.transform = 'translateY(-6px) scale(1.01)';
                                        e.currentTarget.style.boxShadow = '0 20px 40px -10px rgba(37, 99, 235, 0.15), 0 10px 20px -5px rgba(0, 0, 0, 0.04)';
                                        e.currentTarget.style.borderColor = 'rgba(191, 219, 254, 0.8)';
                                        const arrow = e.currentTarget.querySelector('.lesson-arrow');
                                        if (arrow) {
                                            arrow.style.color = '#2563eb';
                                            arrow.style.transform = 'translateX(8px)';
                                        }
                                    }}
                                    onMouseLeave={(e) => {
                                        e.currentTarget.style.transform = 'translateY(0) scale(1)';
                                        e.currentTarget.style.boxShadow = '0 10px 40px -10px rgba(0,0,0,0.06), 0 1px 3px rgba(0,0,0,0.02)';
                                        e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 1)';
                                        const arrow = e.currentTarget.querySelector('.lesson-arrow');
                                        if (arrow) {
                                            arrow.style.color = '#cbd5e1';
                                            arrow.style.transform = 'translateX(0)';
                                        }
                                    }}
                                    onClick={() => navigate(`/lessons/${lesson._id}`)}
                                >
                                    <div style={{ flex: 1, paddingRight: '2rem' }}>
                                        {/* Row Badge Thông Tin */}
                                        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '1rem', alignItems: 'center', marginBottom: '1rem' }}>
                                            <span style={{
                                                fontSize: '0.75rem',
                                                fontWeight: '800',
                                                padding: '0.4rem 0.8rem',
                                                borderRadius: '12px',
                                                backgroundColor: isCompleted ? '#ecfdf5' : '#eff6ff',
                                                color: isCompleted ? '#059669' : '#2563eb',
                                                textTransform: 'uppercase',
                                                letterSpacing: '0.05em'
                                            }}>
                                                Bài {index + 1}: {lesson.type}
                                            </span>

                                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                                <span style={{ fontSize: '0.9rem', color: '#64748b', fontWeight: '600' }}>
                                                    {lesson.duration} phút
                                                </span>
                                                <span style={{ color: '#cbd5e1' }}>•</span>
                                                <span style={{
                                                    display: 'flex',
                                                    alignItems: 'center',
                                                    gap: '0.25rem',
                                                    fontSize: '0.85rem',
                                                    color: '#d97706',
                                                    fontWeight: '700',
                                                    backgroundColor: '#fef3c7',
                                                    padding: '0.2rem 0.6rem',
                                                    borderRadius: '8px'
                                                }}>
                                                    <Star size={14} fill="currentColor" />
                                                    {lesson.xpAwarded} XP
                                                </span>
                                            </div>
                                        </div>

                                        {/* Tiêu đề & Mô tả */}
                                        <h3 style={{
                                            fontSize: '1.5rem',
                                            color: '#0f172a',
                                            fontWeight: '800',
                                            marginBottom: '0.6rem',
                                            lineHeight: '1.3',
                                            letterSpacing: '-0.02em'
                                        }}>
                                            {lesson.title}
                                        </h3>
                                        <p style={{ color: '#64748b', fontSize: '1rem', lineHeight: '1.6', margin: 0 }}>
                                            {lesson.description}
                                        </p>
                                    </div>

                                    {/* Mũi tên */}
                                    <div className="lesson-arrow" style={{
                                        color: '#cbd5e1',
                                        transition: 'all 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275)',
                                        transform: 'translateX(0)',
                                        flexShrink: 0
                                    }}>
                                        <ChevronRight size={32} strokeWidth={2.5} />
                                    </div>
                                </div>
                            </div>
                        )
                    })}

                    {lessons.length === 0 && (
                        <div style={{
                            backgroundColor: 'rgba(255, 255, 255, 0.7)',
                            backdropFilter: 'blur(10px)',
                            borderRadius: '24px',
                            padding: '5rem 2rem',
                            textAlign: 'center',
                            boxShadow: '0 10px 40px -10px rgba(0,0,0,0.05)',
                            border: '1px solid rgba(255,255,255,1)'
                        }}>
                            <div style={{
                                width: '80px',
                                height: '80px',
                                backgroundColor: '#f1f5f9',
                                borderRadius: '50%',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                margin: '0 auto 2rem'
                            }}>
                                <BookOpen size={40} style={{ color: '#94a3b8' }} />
                            </div>
                            <h3 style={{ fontSize: '1.5rem', color: '#1e293b', fontWeight: '800', marginBottom: '0.75rem' }}>Chưa có bài học</h3>
                            <p style={{ color: '#64748b', fontSize: '1.1rem' }}>Hiện tại chưa có bài học nào được thiết kế cho trình độ này.<br />Hãy quay lại sau nhé!</p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default LearningPath;
