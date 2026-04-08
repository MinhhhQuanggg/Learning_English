import React, { useState, useEffect } from 'react';
import { Target, Gift, CheckCircle2, ChevronRight, Zap } from 'lucide-react';
import api from '../api/axios';

const DailyTaskWidget = () => {
    const [tasks, setTasks] = useState([]);
    const [loading, setLoading] = useState(true);

    const fetchTasks = async () => {
        try {
            const res = await api.get('/gamification/daily-tasks');
            setTasks(res.data.data);
        } catch (err) {
            console.error('Lỗi tải nhiệm vụ hàng ngày', err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchTasks();
    }, []);

    const handleClaim = async (taskId) => {
        try {
            const res = await api.post(`/gamification/daily-tasks/${taskId}/claim`);
            alert(`Nhận thưởng thành công! +${res.data.xpAwarded} XP`);
            // Update local state
            setTasks(prev => prev.map(t => t._id === taskId ? { ...t, isClaimed: true } : t));
        } catch (err) {
            alert(err.response?.data?.message || 'Có lỗi khi nhận thưởng');
        }
    };

    if (loading) {
        return (
            <div className="glass-card animate-fade-in" style={{ padding: '1.5rem', borderRadius: '20px', border: '1px solid rgba(245,158,11,0.15)', background: 'linear-gradient(135deg, #fffbeb 0%, #fef3c7 100%)', textAlign: 'center' }}>
                <span className="animate-pulse" style={{ color: '#d97706', fontWeight: '600' }}>Đang tải nhiệm vụ...</span>
            </div>
        );
    }

    return (
        <div className="glass-card animate-fade-in" style={{
            padding: '1.5rem',
            borderRadius: '20px',
            border: '1px solid rgba(245,158,11,0.2)',
            background: 'linear-gradient(135deg, #fffbeb 0%, #fef3c7 100%)',
            animationDelay: '0.7s',
            position: 'relative',
            overflow: 'hidden'
        }}>
            <div style={{ position: 'absolute', right: '-10px', top: '-10px', opacity: 0.1 }}>
                <Target size={100} />
            </div>

            <div style={{ position: 'relative', zIndex: 1 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1rem' }}>
                    <div style={{ background: '#f59e0b', color: 'white', padding: '0.3rem', borderRadius: '10px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        <Target size={18} />
                    </div>
                    <h4 style={{ margin: 0, fontWeight: '800', color: '#b45309', fontSize: '1.1rem' }}>Nhiệm vụ hôm nay</h4>
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                    {tasks.length > 0 ? tasks.map(task => {
                        const progressPercent = Math.min((task.progress / task.target) * 100, 100);
                        const isCompleted = task.progress >= task.target;

                        return (
                            <div key={task._id} style={{
                                backgroundColor: 'white',
                                padding: '1rem',
                                borderRadius: '12px',
                                border: `1px solid ${task.isClaimed ? '#10b981' : (isCompleted ? '#f59e0b' : 'rgba(245,158,11,0.1)')}`,
                                boxShadow: '0 2px 10px rgba(0,0,0,0.03)'
                            }}>
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.5rem' }}>
                                    <div style={{ fontWeight: '700', color: '#1f2937', fontSize: '0.95rem', flex: 1 }}>
                                        {task.title}
                                    </div>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.2rem', color: '#f59e0b', fontWeight: '800', fontSize: '0.85rem' }}>
                                        <Zap size={14} fill="#f59e0b" /> +{task.xpReward}
                                    </div>
                                </div>

                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '0.8rem', color: 'var(--gray-500)', marginBottom: '0.4rem', fontWeight: '600' }}>
                                    <span>Tiến độ</span>
                                    <span>{task.progress}/{task.target}</span>
                                </div>
                                <div style={{ width: '100%', height: '6px', backgroundColor: 'var(--gray-100)', borderRadius: '99px', overflow: 'hidden', marginBottom: '0.75rem' }}>
                                    <div style={{
                                        height: '100%',
                                        width: `${progressPercent}%`,
                                        backgroundColor: isCompleted ? '#10b981' : '#f59e0b',
                                        transition: 'width 0.5s ease-out',
                                        borderRadius: '99px'
                                    }}></div>
                                </div>

                                {task.isClaimed ? (
                                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.2rem', color: '#10b981', fontWeight: '700', fontSize: '0.85rem', width: '100%', padding: '0.4rem' }}>
                                        <CheckCircle2 size={16} /> Đã nhận thưởng
                                    </div>
                                ) : isCompleted ? (
                                    <button
                                        onClick={() => handleClaim(task._id)}
                                        style={{ width: '100%', padding: '0.5rem', background: 'linear-gradient(135deg, #f59e0b, #ef4444)', color: 'white', border: 'none', borderRadius: '8px', fontWeight: '700', fontSize: '0.85rem', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.2rem' }}
                                    >
                                        <Gift size={16} /> Nhận thưởng
                                    </button>
                                ) : (
                                    <div style={{ textAlign: 'center', color: '#9ca3af', fontSize: '0.8rem', fontWeight: '600', fontStyle: 'italic' }}>
                                        Chưa hoàn thành
                                    </div>
                                )}
                            </div>
                        );
                    }) : (
                        <div style={{ textAlign: 'center', color: '#b45309', padding: '1rem', fontStyle: 'italic' }}>
                            Oops, hôm nay chưa có nhiệm vụ nào!
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default DailyTaskWidget;
