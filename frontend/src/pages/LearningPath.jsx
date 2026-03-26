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

                {lessons.map((lesson, index) => {
                    const isCompleted = user.completedLessons?.some(cl => (cl.lesson?._id || cl.lesson) === lesson._id);
                    const firstUncompletedIndex = lessons.findIndex(l => !user.completedLessons?.some(cl => (cl.lesson?._id || cl.lesson) === l._id));
                    const isNext = index === firstUncompletedIndex || (firstUncompletedIndex === -1 && index === lessons.length - 1);

                    return (
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
                                backgroundColor: isCompleted ? '#10b981' : (isNext ? 'var(--primary)' : 'white'),
                                border: `3px solid ${isCompleted ? '#10b981' : (isNext ? 'var(--primary)' : 'var(--gray-200)')}`,
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                color: isCompleted ? 'white' : (isNext ? 'white' : 'var(--gray-500)'),
                                boxShadow: isNext ? '0 10px 20px -5px rgba(79, 70, 229, 0.4)' : (isCompleted ? '0 10px 20px -5px rgba(16, 185, 129, 0.3)' : 'none')
                            }}>
                                {isCompleted ? <CheckCircle2 size={40} /> : (isNext ? <PlayCircle size={40} /> : <Circle size={30} />)}
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
                    )
                })}

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
