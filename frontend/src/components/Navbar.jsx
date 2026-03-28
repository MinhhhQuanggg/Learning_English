import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { LogOut, User, BookOpen, LayoutDashboard, ZoomIn, ZoomOut, Maximize, Swords } from 'lucide-react';
import oppIcon from '../assets/opportunity.png';

const Navbar = () => {
    const navigate = useNavigate();
    const user = JSON.parse(localStorage.getItem('user') || '{}');
    const [zoom, setZoom] = useState(parseFloat(localStorage.getItem('zoom') || '1'));

    useEffect(() => {
        document.documentElement.style.setProperty('--zoom-level', zoom);
        localStorage.setItem('zoom', zoom);
    }, [zoom]);

    useEffect(() => {
        const handleWheel = (e) => {
            if (e.ctrlKey) {
                e.preventDefault();
                if (e.deltaY < 0) {
                    setZoom(prev => Math.min(prev + 0.05, 1.5));
                } else {
                    setZoom(prev => Math.max(prev - 0.05, 0.5));
                }
            }
        };

        const handleKeyDown = (e) => {
            // Kiểm tra phím Ctrl (hoặc Cmd trên Mac) và phím 0 (cả phím số hàng trên và Numpad)
            if ((e.ctrlKey || e.metaKey) && (e.key === '0' || e.code === 'Digit0' || e.code === 'Numpad0')) {
                e.preventDefault();
                setZoom(1);
            }
        };

        window.addEventListener('wheel', handleWheel, { passive: false });
        window.addEventListener('keydown', handleKeyDown);
        return () => {
            window.removeEventListener('wheel', handleWheel);
            window.removeEventListener('keydown', handleKeyDown);
        };
    }, []);

    const handleLogout = () => {
        localStorage.clear();
        navigate('/login');
    };

    return (
        <nav className="glass-card" style={{
            margin: '1rem',
            padding: '0.75rem 2rem',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            position: 'sticky',
            top: '1rem',
            zIndex: 1000,
            borderRadius: '16px'
        }}>
            <Link to="/dashboard" style={{
                display: 'flex',
                alignItems: 'center',
                gap: '0.75rem',
                textDecoration: 'none',
                color: 'var(--primary)',
                fontSize: '1.5rem',
                fontWeight: '900'
            }}>
                <img src={oppIcon} alt="EngPath Logo" style={{ width: '45px', height: '45px', borderRadius: '10px' }} />
                <span>EngPath</span>
            </Link>

            <div style={{ display: 'flex', alignItems: 'center', gap: '2rem' }}>
                <div style={{ display: 'flex', gap: '1.5rem' }}>
                    <Link to="/dashboard" className="nav-link" style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '0.4rem',
                        textDecoration: 'none',
                        color: 'var(--gray-800)',
                        fontWeight: '500'
                    }}>
                        <LayoutDashboard size={18} /> Dashboard
                    </Link>
                    <Link to="/learning-path" className="nav-link" style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '0.4rem',
                        textDecoration: 'none',
                        color: 'var(--gray-800)',
                        fontWeight: '500'
                    }}>
                        <BookOpen size={18} /> Lộ trình
                    </Link>
                    {/* <Link to="/battle" className="nav-link" style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '0.4rem',
                        textDecoration: 'none',
                        color: 'var(--gray-800)',
                        fontWeight: '500'
                    }}>
                        <Swords size={18} /> Đấu 1vs1
                    </Link> */}
                </div>

                <div style={{ height: '24px', width: '1px', backgroundColor: 'var(--gray-200)' }}></div>

                <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                    <div style={{ textAlign: 'right', display: 'none', md: 'block' }}>
                        <div style={{ fontSize: '0.875rem', fontWeight: '700', color: 'var(--dark)' }}>{user.fullName || 'Người dùng'}</div>
                        <div style={{ fontSize: '0.75rem', color: 'var(--primary)', fontWeight: '600' }}>{user.level || 'Học viên'}</div>
                    </div>

                    <Link to="/profile" style={{
                        width: '45px',
                        height: '45px',
                        borderRadius: '14px',
                        backgroundColor: 'var(--gray-100)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        color: 'var(--primary)',
                        cursor: 'pointer',
                        overflow: 'hidden',
                        border: '2px solid var(--white)',
                        boxShadow: '0 4px 10px rgba(0,0,0,0.05)'
                    }}>
                        {user.avatar ? (
                            <img src={user.avatar} alt="Avatar" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                        ) : (
                            <User size={24} />
                        )}
                    </Link>

                    <button
                        onClick={handleLogout}
                        style={{
                            background: 'none',
                            border: 'none',
                            color: 'var(--error)',
                            cursor: 'pointer',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '0.4rem',
                            fontWeight: '600',
                            padding: '0.5rem',
                            borderRadius: '8px',
                            transition: 'background 0.2s'
                        }}
                        className="logout-btn"
                    >
                        <LogOut size={18} /> <span>Đăng xuất</span>
                    </button>
                </div>
            </div>
        </nav>
    );
};

export default Navbar;
