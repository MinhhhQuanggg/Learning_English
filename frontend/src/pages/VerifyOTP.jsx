import { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Mail, CheckCircle } from 'lucide-react';
import api from '../api/axios';

const VerifyOTP = () => {
    const [code, setCode] = useState('');
    const [email, setEmail] = useState('');
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');
    const [loading, setLoading] = useState(false);
    const [timer, setTimer] = useState(60);
    const [canResend, setCanResend] = useState(false);
    const navigate = useNavigate();
    const location = useLocation();

    useEffect(() => {
        // Lấy email từ state khi điều hướng từ trang Register sang
        if (location.state?.email) {
            setEmail(location.state.email);
        }
    }, [location]);

    useEffect(() => {
        let interval;
        if (timer > 0) {
            interval = setInterval(() => {
                setTimer((prev) => prev - 1);
            }, 1000);
        } else {
            setCanResend(true);
        }
        return () => clearInterval(interval);
    }, [timer]);

    const handleResend = async () => {
        if (!canResend) return;
        setError('');
        setSuccess('');
        setLoading(true);
        try {
            await api.post('/auth/resend-otp', { email });
            setSuccess('Mã mới đã được gửi!');
            setTimer(60);
            setCanResend(false);
        } catch (err) {
            setError(err.response?.data?.message || 'Không thể gửi lại mã. Vui lòng thử lại sau.');
        } finally {
            setLoading(false);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setSuccess('');

        if (code.length !== 6) {
            return setError('Mã xác nhận phải có 6 chữ số');
        }

        setLoading(true);
        try {
            const response = await api.post('/auth/verify-email', { email, code });
            setSuccess(response.data.message);
            // Đợi 2 giây rồi chuyển hướng sang Login
            setTimeout(() => {
                navigate('/login');
            }, 2000);
        } catch (err) {
            setError(err.response?.data?.message || 'Xác nhận mã thất bại. Vui lòng thử lại.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="container flex justify-center items-center" style={{ minHeight: '80vh' }}>
            <div className="glass-card animate-fade-in" style={{ padding: '2.5rem', width: '100%', maxWidth: '450px' }}>
                <div style={{ textAlign: 'center', marginBottom: '1.5rem' }}>
                    <div style={{
                        backgroundColor: 'rgba(79, 70, 229, 0.1)',
                        width: '60px',
                        height: '60px',
                        borderRadius: '50%',
                        display: 'inline-flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        marginBottom: '1rem'
                    }}>
                        <Mail size={30} color="var(--primary)" />
                    </div>
                    <h2 style={{ color: 'var(--primary)', marginBottom: '0.5rem' }}>Xác thực Email</h2>
                    <p style={{ color: 'var(--gray-500)', fontSize: '0.875rem' }}>
                        Chúng tôi đã gửi mã xác nhận đến: <br />
                        <strong style={{ color: 'var(--dark)' }}>{email || 'Email của bạn'}</strong>
                    </p>
                </div>

                {error && (
                    <div style={{ backgroundColor: '#fee2e2', color: 'var(--error)', padding: '0.75rem', borderRadius: '8px', marginBottom: '1.5rem', fontSize: '0.875rem', textAlign: 'center' }}>
                        {error}
                    </div>
                )}

                {success && (
                    <div style={{ backgroundColor: '#ecfdf5', color: 'var(--success)', padding: '0.75rem', borderRadius: '8px', marginBottom: '1.5rem', fontSize: '0.875rem', textAlign: 'center', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem' }}>
                        <CheckCircle size={18} /> {success}
                    </div>
                )}

                <form onSubmit={handleSubmit}>
                    <div className="input-group">
                        <label htmlFor="code" style={{ textAlign: 'center' }}>Nhập mã 6 chữ số</label>
                        <input
                            type="text"
                            id="code"
                            value={code}
                            onChange={(e) => setCode(e.target.value.replace(/[^0-9]/g, '').slice(0, 6))}
                            placeholder="000000"
                            style={{
                                textAlign: 'center',
                                fontSize: '1.5rem',
                                letterSpacing: '0.5rem',
                                fontWeight: 'bold',
                                padding: '1rem'
                            }}
                            required
                        />
                    </div>

                    <button type="submit" className="btn btn-primary" style={{ width: '100%' }} disabled={loading}>
                        {loading ? 'Đang xác nhận...' : 'Xác nhận OTP'}
                    </button>
                </form>

                <p style={{ textAlign: 'center', marginTop: '1.5rem', fontSize: '0.875rem', color: 'var(--gray-500)' }}>
                    {canResend ? (
                        <>
                            Không nhận được mã?{' '}
                            <span
                                style={{ color: 'var(--primary)', fontWeight: '600', cursor: 'pointer' }}
                                onClick={handleResend}
                            >
                                Gửi lại mã
                            </span>
                        </>
                    ) : (
                        <>
                            Gửi lại mã sau: <span style={{ color: 'var(--primary)', fontWeight: '600' }}>
                                {Math.floor(timer / 60)}:{(timer % 60).toString().padStart(2, '0')}
                            </span>
                        </>
                    )}
                </p>
            </div>
        </div>
    );
};

export default VerifyOTP;
