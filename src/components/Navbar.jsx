// src/components/Navbar.jsx
import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const Navbar = () => {
    const [scrolled, setScrolled] = useState(false);
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
    
    // Pull the user state and logout function from our Auth Context
    const { user, logout } = useAuth();
    const navigate = useNavigate();

    useEffect(() => {
        const handleScroll = () => {
            const isScrolled = window.scrollY > 10;
            if (isScrolled !== scrolled) {
                setScrolled(isScrolled);
            }
        };

        document.addEventListener('scroll', handleScroll);
        return () => {
            document.removeEventListener('scroll', handleScroll);
        };
    }, [scrolled]);

    const toggleMobileMenu = () => {
        setIsMobileMenuOpen(!isMobileMenuOpen);
    };

    const handleLogout = () => {
        logout();
        navigate('/login');
    };

    return (
        <nav className={`navbar ${scrolled ? 'scrolled' : ''}`}>
            {/* Switched from <a> to <Link> to prevent page reloads */}
            <Link to="/" className="navbar-brand">
                <span>TrackInTrade</span>
            </Link>

            <button className="mobile-nav-button" onClick={toggleMobileMenu}>
                ☰
            </button>

            <div className={`nav-links ${isMobileMenuOpen ? 'mobile-open' : ''}`}>
                <Link to="/documentation" className="nav-link">Documentation</Link>

                {/* Conditional Rendering: What to show if logged OUT vs logged IN */}
                {!user ? (
                    <>
                        <a href="/#features" className="nav-link">Features</a>
                        <Link to="/login" className="nav-link">Login</Link>
                        <Link to="/register" className="nav-button">Register</Link>
                    </>
                ) : (
                    <>
                        <Link to="/dashboard" className="nav-link">Dashboard</Link>
                        
                        {/* --- THE ADMIN MAGIC --- */}
                        {user.user_type === 'admin' && (
                            <Link to="/admin" className="nav-link" style={{ color: '#d32f2f', fontWeight: 'bold' }}>
                                Admin Panel
                            </Link>
                        )}

                        <button 
                            onClick={handleLogout} 
                            className="nav-button" 
                            style={{ background: 'transparent', color: 'inherit', border: '1px solid currentColor', cursor: 'pointer' }}
                        >
                            Logout
                        </button>
                    </>
                )}
            </div>
        </nav>
    );
};

export default Navbar;