// src/components/Header.jsx
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const Header = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  return (
    <header className="app-header">
      <div className="header-content">
        <span className="header-brand">TrackInTrade</span>
        <div className="header-nav">
            <Link to="/dashboard" className="header-nav-link">Dashboard</Link>
            <Link to="/trades" className="header-nav-link">Trades</Link>
            <Link to="/broker" className="header-nav-link">Brokers</Link>
            
            {/* --- THE NEW PORTFOLIO LINK --- */}
            <Link to="/portfolio" className="header-nav-link" style={{ color: '#007bff', fontWeight: 'bold' }}>Portfolio</Link>
            
            <Link to="/notes" className="header-nav-link">Notes</Link>
            {user && <Link to="/insights" className="header-nav-link">AI Insights</Link>}
            <Link to="/goals" className="header-nav-link">Goals</Link>
            
            {/* Admin Panel Link (Only visible to Admins) */}
            {user && user.user_type === 'admin' && (
              <Link to="/admin" className="header-nav-link" style={{ color: '#d32f2f', fontWeight: 'bold' }}>Admin Panel</Link>
            )}
        </div>
        <div className="header-user-section">
          {user && user.name && <span className="welcome-message">Welcome, {user.name}</span>}
          <button onClick={handleLogout} className="logout-button">Logout</button>
        </div>
      </div>
    </header>
  );
};

export default Header;