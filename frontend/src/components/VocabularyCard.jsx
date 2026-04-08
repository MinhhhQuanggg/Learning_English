import React from 'react';
import { Heart, Star, Trash2 } from 'lucide-react';

const VocabularyCard = ({
    vocab,
    isSaved,
    savedRecord,
    onToggleHeart,
    onToggleStatus,
    onRemove,
    showRemove = false
}) => {
    const status = savedRecord?.status || 'Đang học';
    const isMastered = status === 'Đã thuộc';

    return (
        <div className="glass-card" style={{
            padding: '1.25rem',
            borderRadius: '16px',
            border: `1px solid ${isSaved ? (isMastered ? '#10b981' : '#3b82f6') : '#e5e7eb'}`,
            backgroundColor: isSaved ? (isMastered ? '#f0fdf4' : '#eff6ff') : 'white',
            position: 'relative',
            transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
            display: 'flex',
            flexDirection: 'column',
            gap: '0.5rem',
            boxShadow: isSaved ? '0 4px 12px rgba(0,0,0,0.05)' : 'none'
        }}>
            {/* Action Buttons: Heart/Remove */}
            <div style={{ position: 'absolute', top: '1rem', right: '1rem', display: 'flex', gap: '0.5rem' }}>
                {showRemove ? (
                    <button
                        onClick={() => onRemove(savedRecord._id)}
                        title="Xóa khỏi sổ tay"
                        style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#cbd5e1' }}
                        onMouseOver={e => e.currentTarget.style.color = '#ef4444'}
                        onMouseOut={e => e.currentTarget.style.color = '#cbd5e1'}
                    >
                        <Trash2 size={18} />
                    </button>
                ) : (
                    <button
                        onClick={() => onToggleHeart(vocab._id)}
                        title={isSaved ? "Xóa khỏi sổ tay" : "Lưu vào sổ tay"}
                        style={{
                            background: 'none',
                            border: 'none',
                            cursor: 'pointer',
                            color: isSaved ? '#ef4444' : '#cbd5e1',
                            transition: 'transform 0.2s ease'
                        }}
                        onMouseDown={e => e.currentTarget.style.transform = 'scale(0.8)'}
                        onMouseUp={e => e.currentTarget.style.transform = 'scale(1)'}
                    >
                        <Heart size={20} fill={isSaved ? '#ef4444' : 'none'} />
                    </button>
                )}
            </div>

            {/* Word Info */}
            <div style={{ fontWeight: '800', fontSize: '1.25rem', color: '#1e40af', paddingRight: '2.5rem' }}>
                {vocab.word}
            </div>

            {vocab.pronunciation && (
                <div style={{ fontSize: '0.85rem', color: '#64748b', fontStyle: 'italic', marginBottom: '0.25rem' }}>
                    /{vocab.pronunciation}/
                </div>
            )}

            <div style={{ fontWeight: '600', color: '#334155', fontSize: '1rem' }}>
                {vocab.meaning}
            </div>

            {vocab.example && (
                <div style={{
                    marginTop: '0.5rem',
                    fontSize: '0.875rem',
                    color: '#475569',
                    backgroundColor: 'rgba(255,255,255,0.5)',
                    padding: '0.75rem',
                    borderRadius: '12px',
                    border: '1px solid rgba(0,0,0,0.03)',
                    lineHeight: '1.5'
                }}>
                    <span style={{ fontWeight: '700', color: '#64748b' }}>VD: </span>{vocab.example}
                </div>
            )}

            {/* Footer: Status Toggle */}
            {isSaved && (
                <div style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    marginTop: '0.75rem',
                    paddingTop: '0.75rem',
                    borderTop: '1px solid rgba(0,0,0,0.05)'
                }}>
                    <span style={{
                        fontSize: '0.7rem',
                        fontWeight: '800',
                        color: isMastered ? '#047857' : '#2563eb',
                        backgroundColor: isMastered ? '#d1fae5' : '#dbeafe',
                        padding: '0.25rem 0.6rem',
                        borderRadius: '8px',
                        textTransform: 'uppercase',
                        letterSpacing: '0.02em'
                    }}>
                        {status}
                    </span>
                    <button
                        onClick={() => onToggleStatus(savedRecord._id, status)}
                        title={isMastered ? "Đánh dấu lại là Đang học" : "Đã thuộc từ này!"}
                        style={{
                            background: 'none',
                            border: 'none',
                            cursor: 'pointer',
                            color: isMastered ? '#f59e0b' : '#10b981',
                            display: 'flex',
                            alignItems: 'center',
                            padding: '4px',
                            transition: 'transform 0.2s'
                        }}
                        onMouseEnter={e => e.currentTarget.style.transform = 'scale(1.2)'}
                        onMouseLeave={e => e.currentTarget.style.transform = 'scale(1)'}
                    >
                        <Star size={18} fill={isMastered ? '#f59e0b' : 'none'} strokeWidth={2.5} />
                    </button>
                </div>
            )}
        </div>
    );
};

export default VocabularyCard;
