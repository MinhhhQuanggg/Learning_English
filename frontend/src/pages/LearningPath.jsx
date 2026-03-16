import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { BookOpen, CheckCircle2, Circle, ChevronRight, PlayCircle } from 'lucide-react';
import api from '../api/axios';

const LearningPath = () => {
    const [lessons, setLessons] = useState([]);
    const [loading, setLoading] = useState(true);
    const [user, setUser] = useState(JSON.parse(localStorage.getItem('user') || '{}'));
    const navigate = useNavigate();

    useEffect(() => {
        const fetchLessons = async () => {
            try {
                const response = await api.get(`/lessons?level=${user.level}`);
                setLessons(response.data.data);
            } catch (err) {
                console.error('Không thể lấy danh sách bài học', err);
            } finally {
                setLoading(false);
            }
        };

        fetchLessons();
    }, [user.level]);

    if (loading) {
        return (
            <div className="container" style={{ textAlign: 'center', marginTop: '5rem' }}>
                <div className="animate-pulse">Đang tải lộ trình học tập...</div>
            </div>
        );
    }

    return (
        <div className="container" style={{ paddingBottom: '5rem' }}>
            <div style={{ marginTop: '2rem', marginBottom: '3rem', textAlign: 'center' }}>
                <h1 style={{ fontSize: '2.25rem', color: 'var(--primary)', marginBottom: '0.5rem' }}>Lộ trình của bạn</h1>
                <p style={{ color: 'var(--gray-500)' }}>
                    Trình độ hiện tại: <span style={{ fontWeight: '700', color: 'var(--dark)' }}>{user.level}</span>
                </p>
            </div>

            <div style={{ maxWidth: '800px', margin: '0 auto', position: 'relative' }}>
                {/* Đường nối giữa các bài học */}
                <div style={{
                    position: 'absolute',
                    left: '40px',
                    top: '20px',
                    bottom: '20px',
                    width: '2px',
                    backgroundColor: 'var(--gray-200)',
                    zIndex: 0
                }}></div>

                {lessons.map((lesson, index) => (
                    <div key={lesson._id} className="animate-fade-in" style={{
                        display: 'flex',
                        gap: '2rem',
                        marginBottom: '2.5rem',
                        position: 'relative',
                        zIndex: 1,
                        animationDelay: `${index * 0.1}s`
                    }}>
                        {/* Icon trạng thái bài học */}
                        <div style={{
                            width: '80px',
                            height: '80px',
                            borderRadius: '50%',
                            backgroundColor: index === 0 ? 'var(--primary)' : 'white',
                            border: `3px solid ${index === 0 ? 'var(--primary)' : 'var(--gray-200)'}`,
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            color: index === 0 ? 'white' : 'var(--gray-500)',
                            boxShadow: index === 0 ? '0 10px 20px -5px rgba(79, 70, 229, 0.4)' : 'none'
                        }}>
                            {index === 0 ? <PlayCircle size={40} /> : <Circle size={30} />}
                        </div>

                        {/* Thông tin bài học */}
                        <div className="glass-card" style={{
                            flex: 1,
                            padding: '1.5rem',
                            display: 'flex',
                            justifyContent: 'space-between',
                            alignItems: 'center',
                            cursor: 'pointer',
                            transition: 'transform 0.2s',
                        }}
                            onMouseEnter={(e) => e.currentTarget.style.transform = 'translateX(10px)'}
                            onMouseLeave={(e) => e.currentTarget.style.transform = 'translateX(0)'}
                            onClick={() => navigate(`/lessons/${lesson._id}`)}
                        >
                            <div>
                                <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center', marginBottom: '0.5rem' }}>
                                    <span style={{
                                        fontSize: '0.75rem',
                                        fontWeight: '700',
                                        padding: '0.2rem 0.6rem',
                                        borderRadius: '6px',
                                        backgroundColor: 'rgba(79, 70, 229, 0.1)',
                                        color: 'var(--primary)',
                                        textTransform: 'uppercase'
                                    }}>
                                        Bài {index + 1}: {lesson.type}
                                    </span>
                                    <span style={{ fontSize: '0.875rem', color: 'var(--gray-500)' }}>
                                        {lesson.duration} phút • {lesson.xpAwarded} XP
                                    </span>
                                </div>
                                <h3 style={{ fontSize: '1.25rem', color: 'var(--dark)' }}>{lesson.title}</h3>
                                <p style={{ color: 'var(--gray-500)', fontSize: '0.875rem', marginTop: '0.4rem' }}>
                                    {lesson.description}
                                </p>
                            </div>
                            <div style={{ color: 'var(--primary)' }}>
                                <ChevronRight size={24} />
                            </div>
                        </div>
                    </div>
                ))}

                {lessons.length === 0 && (
                    <div className="glass-card" style={{ padding: '3rem', textAlign: 'center' }}>
                        <BookOpen size={48} style={{ color: 'var(--gray-200)', marginBottom: '1rem' }} />
                        <p style={{ color: 'var(--gray-500)' }}>Chưa có bài học nào cho trình độ này.</p>
                    </div>
                )}
            </div>
        </div>
    );
};

export default LearningPath;
