import React, { useState, useEffect } from 'react';
import { BookMarked } from 'lucide-react';
import api from '../api/axios';
import VocabularyCard from './VocabularyCard';

const SavedVocabSection = () => {
    const [vocabs, setVocabs] = useState([]);
    const [loading, setLoading] = useState(true);

    const fetchVocabs = async () => {
        try {
            const res = await api.get('/saved-vocab/my-words');
            setVocabs(res.data.data);
        } catch (err) {
            console.error('Lỗi khi tải sổ tay từ vựng', err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchVocabs();
    }, []);

    const handleRemove = async (id) => {
        if (!window.confirm('Bạn có chắc muốn xóa từ này khỏi sổ tay?')) return;
        try {
            await api.delete(`/saved-vocab/${id}`);
            setVocabs(prev => prev.filter(v => v._id !== id));
        } catch (err) {
            alert('Lỗi khi xóa từ vựng');
        }
    };

    const handleToggleStatus = async (id, currentStatus) => {
        try {
            const newStatus = currentStatus === 'Đang học' ? 'Đã thuộc' : 'Đang học';
            await api.put(`/saved-vocab/${id}`, { status: newStatus });
            setVocabs(prev => prev.map(v => v._id === id ? { ...v, status: newStatus } : v));
        } catch (err) {
            console.error('Error updating status:', err);
            alert('Lỗi cập nhật trạng thái');
        }
    };

    if (loading) return <div style={{ textAlign: 'center', padding: '1.5rem', color: 'var(--gray-500)' }}>Đang tải Sổ tay từ vựng...</div>;

    return (
        <div className="glass-card animate-fade-in" style={{ padding: '2.5rem', marginBottom: '2rem' }}>
            <h3 style={{ fontSize: '1.5rem', marginBottom: '2rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <BookMarked size={24} color="#ef4444" /> Sổ tay Từ vựng ({vocabs.length})
            </h3>

            {vocabs.length > 0 ? (
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '1.5rem' }}>
                    {vocabs.map(item => (
                        <VocabularyCard
                            key={item._id}
                            vocab={item.vocabulary || { word: 'Từ bị xóa', meaning: '', pronunciation: '' }}
                            isSaved={true}
                            savedRecord={item}
                            onRemove={handleRemove}
                            onToggleStatus={handleToggleStatus}
                            showRemove={true}
                        />
                    ))}
                </div>
            ) : (
                <div style={{ textAlign: 'center', padding: '3rem', color: 'var(--gray-400)', backgroundColor: 'var(--gray-50)', borderRadius: '16px' }}>
                    Sổ tay của bạn đang trống. Hãy lưu thêm các từ vựng mới trong lúc học nhé!
                </div>
            )}
        </div>
    );
};

export default SavedVocabSection;
