import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { CheckCircle2, ChevronLeft, Award, ArrowRight, Zap, PlayCircle, Info } from 'lucide-react';
import api from '../api/axios';

const LessonDetail = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const [lesson, setLesson] = useState(null);
    const [vocabularies, setVocabularies] = useState([]);
    const [loading, setLoading] = useState(true);
    const [step, setStep] = useState('content'); // 'content' or 'quiz'
    const [currentQuestion, setCurrentQuestion] = useState(0);
    const [selectedOption, setSelectedOption] = useState(null);
    const [isCorrect, setIsCorrect] = useState(null);
    const [completed, setCompleted] = useState(false);
    const [xpAwarded, setXpAwarded] = useState(0);
    const [correctCount, setCorrectCount] = useState(0);
    const [wrongCount, setWrongCount] = useState(0);

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

                // Fetch vocabularies associated with this lesson
                try {
                    const vocabRes = await api.get(`/vocabulary?lessonId=${id}`);
                    if (vocabRes.data && vocabRes.data.success) {
                        setVocabularies(vocabRes.data.data);
                    }
                } catch (vocabErr) {
                    console.error('Lỗi khi tải từ vựng', vocabErr);
                }
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

        if (correct) {
            setCorrectCount(prev => prev + 1);
            setTimeout(() => {
                nextStep(true);
            }, 1500);
        } else {
            setWrongCount(prev => prev + 1);
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
                    const totalQ = lesson.questions.length;
                    const correct = correctCount;
                    const wrong = wrongCount;
                    const scoreVal = totalQ > 0 ? Math.round((correct / totalQ) * 100) : 0;
                    const res = await api.post(`/lessons/${id}/complete`, {
                        score: scoreVal,
                        correctAnswers: correct,
                        wrongAnswers: wrong,
                        totalQuestions: totalQ,
                    });
                    setXpAwarded(res.data.xpAwarded || 0);
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

                            {vocabularies.length > 0 && (
                                <div style={{ marginTop: '3rem' }}>
                                    <h3 style={{ fontSize: '1.25rem', fontWeight: 'bold', marginBottom: '1rem', color: '#1f2937' }}>Từ vựng trong bài</h3>
                                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(250px, 1fr))', gap: '1rem' }}>
                                        {vocabularies.map(v => (
                                            <div key={v._id} className="glass-card" style={{ padding: '1rem', borderLeft: '4px solid #3b82f6' }}>
                                                <div style={{ fontWeight: 'bold', fontSize: '1.1rem', color: '#2563eb' }}>{v.word}</div>
                                                {v.pronunciation && <div style={{ fontStyle: 'italic', color: '#6b7280', fontSize: '0.9rem', marginBottom: '0.5rem' }}>/{v.pronunciation}/</div>}
                                                <div style={{ fontWeight: '500', marginTop: '0.25rem' }}>{v.meaning}</div>
                                                {v.example && <div style={{ marginTop: '0.75rem', fontSize: '0.9rem', color: '#4b5563', backgroundColor: '#f3f4f6', padding: '0.5rem', borderRadius: '4px' }}>VD: {v.example}</div>}
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}

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

                            {(() => {
                                const currentQuestionId = lesson.questions[currentQuestion]._id;
                                const qVocab = vocabularies.filter(v => v.questionId === currentQuestionId);
                                if (qVocab.length > 0) {
                                    return (
                                        <div style={{ marginBottom: '1.5rem', padding: '1rem', backgroundColor: '#eff6ff', borderRadius: '8px', border: '1px solid #bfdbfe' }}>
                                            <div style={{ fontWeight: 'bold', color: '#1e40af', marginBottom: '0.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                                <Info size={18} /> Gợi ý Từ vựng:
                                            </div>
                                            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                                                {qVocab.map(v => (
                                                    <div key={v._id} style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
                                                        <strong style={{ color: '#2563eb' }}>{v.word}</strong>
                                                        {v.pronunciation && <span style={{ color: '#6b7280', fontStyle: 'italic' }}>/{v.pronunciation}/</span>}
                                                        <span>: {v.meaning}</span>
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    );
                                }
                                return null;
                            })()}

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

            {/* ===== MODAL 11: K\u1ebft qu\u1ea3 b\u00e0i h\u1ecdc ===== */}
            {completed && (
                <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0,0,0,0.6)', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 60 }}>
                    <div className="glass-card animate-fade-in" style={{ padding: '3rem 2.5rem', maxWidth: '520px', width: '92%', textAlign: 'center', borderRadius: '24px', boxShadow: '0 30px 60px rgba(0,0,0,0.25)' }}>
                        <div style={{ width: '90px', height: '90px', backgroundColor: '#10b981', color: 'white', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 1.75rem', boxShadow: '0 20px 40px rgba(16, 185, 129, 0.3)' }}>
                            <CheckCircle2 size={50} />
                        </div>
                        <h2 style={{ fontSize: '2rem', fontWeight: '900', marginBottom: '0.5rem' }}>🎉 Tuyệt vời!</h2>
                        <p style={{ color: 'var(--gray-500)', fontSize: '1rem', marginBottom: '1.75rem' }}>
                            Bạn đã hoàn thành bài học <br /><strong style={{ color: '#1f2937' }}>{lesson.title}</strong>
                        </p>

                        {/* Stats row */}
                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '0.75rem', marginBottom: '1.5rem' }}>
                            <div style={{ padding: '1rem', backgroundColor: 'rgba(16,185,129,0.08)', borderRadius: '14px' }}>
                                <div style={{ fontSize: '1.6rem', fontWeight: '900', color: '#10b981' }}>{correctCount}</div>
                                <div style={{ fontSize: '0.75rem', color: 'var(--gray-500)', fontWeight: '600', marginTop: '2px' }}>Câu đúng</div>
                            </div>
                            <div style={{ padding: '1rem', backgroundColor: 'rgba(239,68,68,0.08)', borderRadius: '14px' }}>
                                <div style={{ fontSize: '1.6rem', fontWeight: '900', color: '#ef4444' }}>{wrongCount}</div>
                                <div style={{ fontSize: '0.75rem', color: 'var(--gray-500)', fontWeight: '600', marginTop: '2px' }}>Câu sai</div>
                            </div>
                            <div style={{ padding: '1rem', backgroundColor: 'rgba(74,144,226,0.08)', borderRadius: '14px' }}>
                                <div style={{ fontSize: '1.6rem', fontWeight: '900', color: 'var(--primary)' }}>
                                    {lesson.questions.length > 0 ? Math.round((correctCount / lesson.questions.length) * 100) : 0}%
                                </div>
                                <div style={{ fontSize: '0.75rem', color: 'var(--gray-500)', fontWeight: '600', marginTop: '2px' }}>Tỷ lệ đúng</div>
                            </div>
                        </div>

                        {/* XP banner */}
                        <div style={{ background: 'linear-gradient(135deg, var(--primary-light), #c7d2fe)', color: 'var(--primary)', padding: '1.25rem 2rem', borderRadius: '16px', display: 'inline-flex', alignItems: 'center', gap: '1rem', marginBottom: '2rem', boxShadow: '0 8px 20px rgba(74,144,226,0.15)', width: '100%', justifyContent: 'center' }}>
                            <Zap size={30} />
                            <div style={{ textAlign: 'left' }}>
                                <div style={{ fontSize: '0.85rem', fontWeight: '600' }}>Kinh nghiệm nhận được</div>
                                <div style={{ fontSize: '2rem', fontWeight: '900', lineHeight: 1 }}>+{xpAwarded} XP</div>
                            </div>
                        </div>

                        <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center', flexWrap: 'wrap' }}>
                            <button onClick={() => navigate('/learning-path')} style={{ padding: '0.9rem 1.8rem', borderRadius: '14px', border: '2px solid var(--primary)', backgroundColor: 'white', color: 'var(--primary)', fontWeight: '700', cursor: 'pointer', fontSize: '1rem' }}>
                                Lộ trình học
                            </button>
                            <button onClick={() => navigate('/dashboard')} className="btn btn-primary" style={{ padding: '0.9rem 1.8rem', borderRadius: '14px', fontWeight: '700', fontSize: '1rem' }}>
                                Về Dashboard
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default LessonDetail;


