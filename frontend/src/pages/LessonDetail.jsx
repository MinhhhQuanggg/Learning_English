import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { CheckCircle2, ChevronLeft, Award, ArrowRight, Zap, PlayCircle, Info } from 'lucide-react';
import api from '../api/axios';

const LessonDetail = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const [lesson, setLesson] = useState(null);
    const [loading, setLoading] = useState(true);
    const [step, setStep] = useState('content'); // 'content' or 'quiz'
    const [currentQuestion, setCurrentQuestion] = useState(0);
    const [selectedOption, setSelectedOption] = useState(null);
    const [isCorrect, setIsCorrect] = useState(null);
    const [completed, setCompleted] = useState(false);
    const [xpAwarded, setXpAwarded] = useState(0);

    useEffect(() => {
        const fetchLesson = async () => {
            try {
                const res = await api.get(`/lessons/${id}`);
                const lessonData = res.data.data;

                // Bỏ shuffle để thứ tự câu hỏi khớp với dữ liệu gốc
                // if (lessonData.questions && lessonData.questions.length > 0) {
                //     const shuffledQuestions = [...lessonData.questions].sort(() => Math.random() - 0.5);
                //     lessonData.questions = shuffledQuestions;
                // }

                setLesson(lessonData);
            } catch (err) {
                console.error('Lỗi khi tải bài học', err);
            } finally {
                setLoading(false);
            }
        };
        fetchLesson();
    }, [id]);

    const handleOptionSelect = (option) => {
        if (isCorrect !== null) return;
        setSelectedOption(option);

        const currentQ = lesson.questions[currentQuestion];
        let correct = false;

        if (currentQ.type === 'fill_blank' || currentQ.type === 'writing') {
            correct = option.toLowerCase() === currentQ.correctAnswer.toLowerCase();
        } else {
            correct = option === currentQ.correctAnswer;
        }

        setIsCorrect(correct);

        // Nếu trả lời đúng, tự động chuyển sang câu tiếp theo sau 1.5 giây
        if (correct) {
            setTimeout(() => {
                nextStep(true); // Truyền flag để biết đây là auto-next
            }, 1500);
        }
    };

    const [completing, setCompleting] = useState(false);

    const nextStep = async (isAuto = false) => {
        if (step === 'content') {
            setStep('quiz');
        } else {
            // Nếu là auto-next và đã qua bước khác hoặc người dùng đã bấm thủ công rồi thì thôi
            if (isAuto && isCorrect === null) return;

            if (currentQuestion < lesson.questions.length - 1) {
                setCurrentQuestion(currentQuestion + 1);
                setSelectedOption(null);
                setIsCorrect(null);
            } else {
                // Kết thúc bài học
                if (completing || completed) return;
                setCompleting(true);
                try {
                    const res = await api.post(`/lessons/${id}/complete`);
                    setXpAwarded(res.data.xpAwarded);
                    setCompleted(true);
                } catch (err) {
                    console.error('Lỗi khi hoàn thành bài học', err);
                    alert('Có lỗi xảy ra khi lưu kết quả bài học. Vui lòng thử lại!');
                } finally {
                    setCompleting(false);
                }
            }
        }
    };

    if (loading) return <div className="container" style={{ textAlign: 'center', marginTop: '5rem' }}>Đang tải bài học...</div>;
    if (!lesson) return <div className="container" style={{ textAlign: 'center', marginTop: '5rem' }}>Không tìm thấy bài học.</div>;

    if (completed) {
        return (
            <div className="container" style={{ maxWidth: '600px', textAlign: 'center', marginTop: '5rem' }}>
                <div className="glass-card animate-fade-in" style={{ padding: '4rem 2rem' }}>
                    <div style={{
                        width: '100px', height: '100px', backgroundColor: '#10b981', color: 'white',
                        borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center',
                        margin: '0 auto 2rem', boxShadow: '0 20px 40px rgba(16, 185, 129, 0.3)'
                    }}>
                        <CheckCircle2 size={60} />
                    </div>
                    <h1 style={{ fontSize: '2.5rem', fontWeight: '800', marginBottom: '1rem' }}> Tuyệt vời!</h1>
                    <p style={{ color: 'var(--gray-500)', fontSize: '1.2rem', marginBottom: '2rem' }}>
                        Bạn đã hoàn thành bài học <strong>{lesson.title}</strong>
                    </p>

                    <div className="glass-card" style={{
                        background: 'var(--primary-light)', color: 'var(--primary)',
                        padding: '1.5rem', borderRadius: '20px', display: 'inline-flex',
                        alignItems: 'center', gap: '1rem', marginBottom: '3rem'
                    }}>
                        <Zap size={32} />
                        <div style={{ textAlign: 'left' }}>
                            <div style={{ fontSize: '0.9rem', fontWeight: '600' }}>Điểm kinh nghiệm nhận được</div>
                            <div style={{ fontSize: '2rem', fontWeight: '900' }}>+{xpAwarded} XP</div>
                        </div>
                    </div>

                    <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center' }}>
                        <button onClick={() => navigate('/dashboard')} className="btn btn-primary" style={{ padding: '1rem 2.5rem', borderRadius: '15px', fontWeight: '700' }}>
                            Về Dashboard
                        </button>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="container" style={{ maxWidth: '900px', paddingBottom: '5rem' }}>
            <button
                onClick={() => navigate(-1)}
                style={{ background: 'none', border: 'none', display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--gray-500)', fontWeight: '600', marginBottom: '2rem', cursor: 'pointer' }}
            >
                <ChevronLeft size={20} /> Quay lại
            </button>

            <div className="glass-card animate-fade-in" style={{ padding: '0', overflow: 'hidden' }}>
                {/* Header thanh tiến trình */}
                <div style={{ padding: '1.5rem 2rem', borderBottom: '1px solid var(--gray-100)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                        <div style={{ padding: '0.5rem', borderRadius: '12px', background: 'var(--primary-light)', color: 'var(--primary)' }}>
                            <Award size={24} />
                        </div>
                        <div>
                            <h2 style={{ fontSize: '1.2rem', margin: 0, fontWeight: '800' }}>{lesson.title}</h2>
                            <span style={{ fontSize: '0.8rem', color: 'var(--gray-500)', textTransform: 'uppercase', fontWeight: '700' }}>{lesson.type} • {lesson.level}</span>
                        </div>
                    </div>
                </div>

                <div style={{ padding: '3rem' }}>
                    {step === 'content' ? (
                        <div className="animate-fade-in">
                            <div className="lesson-content" dangerouslySetInnerHTML={{ __html: lesson.content }}></div>
                            <div style={{ marginTop: '3rem', pt: '2rem', borderTop: '1px solid var(--gray-100)', textAlign: 'right' }}>
                                <button onClick={nextStep} className="btn btn-primary" style={{ padding: '1rem 3rem', borderRadius: '15px', fontWeight: '700', fontSize: '1.1rem', display: 'inline-flex', alignItems: 'center', gap: '0.75rem' }}>
                                    Tiếp theo <ArrowRight size={22} />
                                </button>
                            </div>
                        </div>
                    ) : (
                        <div className="animate-fade-in">
                            <div style={{ marginBottom: '2rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                <span style={{ fontWeight: '800', fontSize: '1.1rem' }}>Câu hỏi {currentQuestion + 1}/{lesson.questions.length}</span>
                                <div style={{ width: '200px', height: '8px', background: 'var(--gray-100)', borderRadius: '4px', overflow: 'hidden' }}>
                                    <div style={{ width: `${((currentQuestion + 1) / lesson.questions.length) * 100}%`, height: '100%', background: 'var(--primary)', transition: 'width 0.3s ease' }}></div>
                                </div>
                            </div>

                            {lesson.questions[currentQuestion].passage && (
                                <div style={{
                                    marginBottom: '2rem',
                                    padding: '1.5rem',
                                    backgroundColor: '#f8fafc',
                                    borderRadius: '15px',
                                    border: '1px solid #e2e8f0',
                                    fontSize: '1.1rem',
                                    lineHeight: '1.6',
                                    color: '#334155'
                                }}>
                                    <div dangerouslySetInnerHTML={{ __html: lesson.questions[currentQuestion].passage.replace(/\n/g, '<br />') }} />
                                </div>
                            )}

                            <h3 style={{ fontSize: '1.8rem', fontWeight: '800', marginBottom: '2.5rem', lineHeight: '1.4' }}>
                                {lesson.questions[currentQuestion].question}
                            </h3>

                            {lesson.questions[currentQuestion].mediaUrl && (
                                <div style={{ marginBottom: '2rem', textAlign: 'center' }}>
                                    <audio
                                        key={`audio-${currentQuestion}`}
                                        controls
                                        src={lesson.questions[currentQuestion].mediaUrl}
                                        style={{ width: '100%', maxWidth: '400px' }}
                                    >
                                        Trình duyệt của bạn không hỗ trợ thẻ audio.
                                    </audio>
                                </div>
                            )}

                            <div style={{ marginBottom: '3rem' }}>
                                {(!lesson.questions[currentQuestion].type || lesson.questions[currentQuestion].type === 'multiple_choice' || lesson.questions[currentQuestion].type === 'reading_passage') && (
                                    <div style={{ display: 'grid', gap: '1rem' }}>
                                        {lesson.questions[currentQuestion].options?.map((option, idx) => (
                                            <button
                                                key={idx}
                                                onClick={() => handleOptionSelect(option)}
                                                style={{
                                                    padding: '1.5rem 2rem',
                                                    borderRadius: '20px',
                                                    border: '2px solid',
                                                    borderColor: selectedOption === option
                                                        ? (isCorrect === true ? '#10b981' : (isCorrect === false ? '#ef4444' : 'var(--primary)'))
                                                        : 'var(--gray-100)',
                                                    backgroundColor: selectedOption === option
                                                        ? (isCorrect === true ? '#ecfdf5' : (isCorrect === false ? '#fef2f2' : 'white'))
                                                        : 'white',
                                                    textAlign: 'left',
                                                    fontSize: '1.1rem',
                                                    fontWeight: '600',
                                                    cursor: isCorrect !== null ? 'default' : 'pointer',
                                                    transition: 'all 0.2s',
                                                    display: 'flex',
                                                    alignItems: 'center',
                                                    justifyContent: 'space-between',
                                                    color: selectedOption === option ? (isCorrect === true ? '#047857' : (isCorrect === false ? '#b91c1c' : 'var(--primary)')) : 'var(--gray-800)'
                                                }}
                                            >
                                                {option}
                                                {selectedOption === option && isCorrect === true && <CheckCircle2 size={24} color="#10b981" />}
                                            </button>
                                        ))}
                                    </div>
                                )}

                                {lesson.questions[currentQuestion].type === 'true_false' && (
                                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                                        {['True', 'False'].map((option, idx) => (
                                            <button
                                                key={idx}
                                                onClick={() => handleOptionSelect(option)}
                                                style={{
                                                    padding: '2rem',
                                                    borderRadius: '20px',
                                                    border: '2px solid',
                                                    borderColor: selectedOption === option
                                                        ? (isCorrect === true ? '#10b981' : (isCorrect === false ? '#ef4444' : 'var(--primary)'))
                                                        : 'var(--gray-200)',
                                                    backgroundColor: selectedOption === option
                                                        ? (isCorrect === true ? '#ecfdf5' : (isCorrect === false ? '#fef2f2' : (option === 'True' ? '#f0fdf4' : '#fef2f2')))
                                                        : 'white',
                                                    textAlign: 'center',
                                                    fontSize: '1.5rem',
                                                    fontWeight: '800',
                                                    cursor: isCorrect !== null ? 'default' : 'pointer',
                                                    transition: 'all 0.2s',
                                                    display: 'flex',
                                                    flexDirection: 'column',
                                                    alignItems: 'center',
                                                    justifyContent: 'center',
                                                    gap: '0.5rem',
                                                    color: selectedOption === option ? (isCorrect === true ? '#047857' : (isCorrect === false ? '#b91c1c' : 'var(--primary)')) : 'var(--gray-800)'
                                                }}
                                            >
                                                {option === 'True' ? '✅ True (Đúng)' : '❌ False (Sai)'}
                                                {selectedOption === option && isCorrect === true && <CheckCircle2 size={28} color="#10b981" style={{ marginTop: '0.5rem' }} />}
                                            </button>
                                        ))}
                                    </div>
                                )}

                                {lesson.questions[currentQuestion].type === 'fill_blank' && (
                                    <div style={{ display: 'flex', gap: '1rem', flexDirection: 'column' }}>
                                        <input
                                            type="text"
                                            placeholder="Gõ câu trả lời của bạn..."
                                            value={selectedOption || ''}
                                            onChange={(e) => {
                                                if (isCorrect === null) setSelectedOption(e.target.value);
                                            }}
                                            onKeyDown={(e) => {
                                                if (e.key === 'Enter' && selectedOption) {
                                                    handleOptionSelect(selectedOption.trim());
                                                }
                                            }}
                                            disabled={isCorrect !== null}
                                            style={{
                                                padding: '1.5rem',
                                                fontSize: '1.2rem',
                                                borderRadius: '15px',
                                                border: `2px solid ${isCorrect === true ? '#10b981' : (isCorrect === false ? '#ef4444' : 'var(--gray-200)')}`,
                                                backgroundColor: isCorrect === true ? '#ecfdf5' : (isCorrect === false ? '#fef2f2' : 'white'),
                                                outline: 'none',
                                                width: '100%'
                                            }}
                                        />
                                        {isCorrect === null && (
                                            <button
                                                onClick={() => handleOptionSelect(selectedOption?.trim() || '')}
                                                className="btn btn-primary"
                                                disabled={!selectedOption}
                                                style={{ alignSelf: 'flex-start', padding: '1rem 2rem', borderRadius: '12px', fontWeight: '700' }}
                                            >
                                                Kiểm tra
                                            </button>
                                        )}
                                    </div>
                                )}

                                {lesson.questions[currentQuestion].type === 'writing' && (
                                    <div style={{ display: 'flex', gap: '1rem', flexDirection: 'column' }}>
                                        <textarea
                                            placeholder="Viết câu trả lời chi tiết..."
                                            value={selectedOption || ''}
                                            onChange={(e) => {
                                                if (isCorrect === null) setSelectedOption(e.target.value);
                                            }}
                                            disabled={isCorrect !== null}
                                            rows="4"
                                            style={{
                                                padding: '1.5rem',
                                                fontSize: '1.1rem',
                                                borderRadius: '15px',
                                                border: `2px solid ${isCorrect === true ? '#10b981' : (isCorrect === false ? '#ef4444' : 'var(--gray-200)')}`,
                                                backgroundColor: isCorrect === true ? '#ecfdf5' : (isCorrect === false ? '#fef2f2' : 'white'),
                                                outline: 'none',
                                                width: '100%',
                                                resize: 'vertical'
                                            }}
                                        />
                                        {isCorrect === null && (
                                            <button
                                                onClick={() => handleOptionSelect(selectedOption?.trim() || '')}
                                                className="btn btn-primary"
                                                disabled={!selectedOption}
                                                style={{ alignSelf: 'flex-start', padding: '1rem 2rem', borderRadius: '12px', fontWeight: '700' }}
                                            >
                                                Kiểm tra đáp án
                                            </button>
                                        )}
                                    </div>
                                )}

                                {lesson.questions[currentQuestion].type === 'sort_sentence' && (
                                    <div>
                                        {/* Hiển thị vùng câu đã ghép */}
                                        <div style={{
                                            minHeight: '80px',
                                            padding: '1rem',
                                            border: `2px dashed ${isCorrect === null ? 'var(--gray-300)' : (isCorrect ? '#10b981' : '#ef4444')}`,
                                            borderRadius: '15px',
                                            marginBottom: '1.5rem',
                                            display: 'flex',
                                            flexWrap: 'wrap',
                                            gap: '0.5rem',
                                            backgroundColor: isCorrect === true ? '#ecfdf5' : (isCorrect === false ? '#fef2f2' : 'var(--gray-50)'),
                                            alignItems: 'center'
                                        }}>
                                            {!selectedOption && <span style={{ color: 'var(--gray-400)', fontStyle: 'italic' }}>Bấm vào các từ bên dưới để ghép câu...</span>}
                                            {selectedOption && selectedOption.split(',').map((word, idx) => (
                                                <span key={idx}
                                                    onClick={() => {
                                                        if (isCorrect !== null) return;
                                                        const parts = selectedOption.split(',');
                                                        parts.splice(idx, 1);
                                                        setSelectedOption(parts.join(','));
                                                    }}
                                                    style={{
                                                        padding: '0.5rem 1rem',
                                                        backgroundColor: 'var(--primary)',
                                                        color: 'white',
                                                        borderRadius: '8px',
                                                        fontWeight: '600',
                                                        cursor: isCorrect === null ? 'pointer' : 'default',
                                                        boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
                                                    }}>
                                                    {word}
                                                </span>
                                            ))}
                                        </div>

                                        {/* Hiển thị các từ để chọn */}
                                        {isCorrect === null && (
                                            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.75rem', marginBottom: '1.5rem' }}>
                                                {lesson.questions[currentQuestion].options?.filter(opt => !(selectedOption?.split(',') || []).includes(opt)).map((option, idx) => (
                                                    <button
                                                        key={idx}
                                                        onClick={() => {
                                                            const currentArr = selectedOption ? selectedOption.split(',') : [];
                                                            if (!currentArr.includes(option)) {
                                                                currentArr.push(option);
                                                                setSelectedOption(currentArr.join(','));
                                                            }
                                                        }}
                                                        style={{
                                                            padding: '0.75rem 1.25rem',
                                                            borderRadius: '10px',
                                                            border: '2px solid var(--gray-200)',
                                                            backgroundColor: 'white',
                                                            fontSize: '1.1rem',
                                                            fontWeight: '600',
                                                            cursor: 'pointer',
                                                            color: 'var(--gray-700)',
                                                            transition: 'all 0.2s'
                                                        }}
                                                    >
                                                        {option}
                                                    </button>
                                                ))}
                                            </div>
                                        )}
                                        {isCorrect === null && (
                                            <button
                                                onClick={() => handleOptionSelect(selectedOption || '')}
                                                className="btn btn-primary"
                                                disabled={!selectedOption}
                                                style={{ alignSelf: 'flex-start', padding: '1rem 2rem', borderRadius: '12px', fontWeight: '700' }}
                                            >
                                                Kiểm tra
                                            </button>
                                        )}
                                    </div>
                                )}
                            </div>

                            {isCorrect !== null && (
                                <div className="animate-fade-in" style={{
                                    padding: '2rem', borderRadius: '24px',
                                    backgroundColor: isCorrect ? '#ecfdf5' : '#fef2f2',
                                    border: `1px solid ${isCorrect ? '#10b981' : '#ef4444'}`,
                                    marginBottom: '2rem'
                                }}>
                                    <h4 style={{ color: isCorrect ? '#047857' : '#b91c1c', fontWeight: '800', marginBottom: '0.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                        {isCorrect ? 'Tuyệt vời, chính xác!' : 'Rất tiếc, sai mất rồi!'}
                                    </h4>
                                    <p style={{ color: 'var(--gray-700)', fontWeight: '500', margin: 0 }}>
                                        {lesson.questions[currentQuestion].explanation}
                                    </p>
                                </div>
                            )}

                            {isCorrect !== null && (
                                <div style={{ textAlign: 'right' }}>
                                    <button
                                        onClick={nextStep}
                                        disabled={completing}
                                        className="btn btn-primary"
                                        style={{
                                            padding: '1rem 3rem',
                                            borderRadius: '15px',
                                            fontWeight: '800',
                                            fontSize: '1.1rem',
                                            opacity: completing ? 0.7 : 1,
                                            cursor: completing ? 'not-allowed' : 'pointer'
                                        }}
                                    >
                                        {completing ? 'Đang lưu...' : (currentQuestion < lesson.questions.length - 1 ? 'Câu tiếp theo' : 'Hoàn thành bài học')}
                                    </button>
                                </div>
                            )}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default LessonDetail;
