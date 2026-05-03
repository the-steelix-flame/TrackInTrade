// src/pages/AdminDashboard.jsx
import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import api from '../api';

const AdminDashboard = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [stats, setStats] = useState({ total_users: 0, total_trades: 0 });
  const [users, setUsers] = useState([]);
  const [error, setError] = useState('');

  useEffect(() => {
    // Double security check on the frontend
    if (!user || user.user_type !== 'admin') {
      navigate('/dashboard');
      return;
    }
    fetchAdminData();
  }, [user, navigate]);

  const fetchAdminData = async () => {
    try {
      const [statsRes, usersRes] = await Promise.all([
        api.get('/admin/stats'),
        api.get('/admin/users')
      ]);
      setStats(statsRes.data);
      setUsers(usersRes.data);
    } catch (err) {
      setError('Failed to load admin data. Check your permissions.');
    }
  };

  const handleDeleteUser = async (userId, userName) => {
    if (window.confirm(`Are you absolutely sure you want to delete ${userName}? This cannot be undone.`)) {
      try {
        await api.delete(`/admin/users/${userId}`);
        setUsers(users.filter(u => u.id !== userId));
      } catch (err) {
        alert('Failed to delete user.');
      }
    }
  };

  if (!user || user.user_type !== 'admin') return null;

  return (
    <div style={{ padding: '40px', maxWidth: '1200px', margin: '0 auto' }}>
      <h1>Platform Control Room</h1>
      {error && <p style={{ color: 'red' }}>{error}</p>}

      <div style={{ display: 'flex', gap: '20px', marginBottom: '40px' }}>
        <div style={{ padding: '20px', background: '#f5f5f5', borderRadius: '8px', flex: 1 }}>
          <h3>Total Users</h3>
          <p style={{ fontSize: '32px', margin: '10px 0' }}>{stats.total_users}</p>
        </div>
        <div style={{ padding: '20px', background: '#f5f5f5', borderRadius: '8px', flex: 1 }}>
          <h3>Total Trades Logged</h3>
          <p style={{ fontSize: '32px', margin: '10px 0' }}>{stats.total_trades}</p>
        </div>
      </div>

      <h2>Manage Users</h2>
      <table style={{ width: '100%', textAlign: 'left', borderCollapse: 'collapse' }}>
        <thead>
          <tr style={{ borderBottom: '2px solid #ddd' }}>
            <th style={{ padding: '12px' }}>Name</th>
            <th style={{ padding: '12px' }}>Email</th>
            <th style={{ padding: '12px' }}>Role</th>
            <th style={{ padding: '12px' }}>Provider</th>
            <th style={{ padding: '12px' }}>Actions</th>
          </tr>
        </thead>
        <tbody>
          {users.map(u => (
            <tr key={u.id} style={{ borderBottom: '1px solid #eee' }}>
              <td style={{ padding: '12px' }}>{u.name}</td>
              <td style={{ padding: '12px' }}>{u.email}</td>
              <td style={{ padding: '12px' }}>
                <span style={{ 
                  background: u.user_type === 'admin' ? '#ffebee' : '#e8f5e9',
                  color: u.user_type === 'admin' ? '#c62828' : '#2e7d32',
                  padding: '4px 8px', borderRadius: '4px', fontSize: '14px' 
                }}>
                  {u.user_type.toUpperCase()}
                </span>
              </td>
              <td style={{ padding: '12px' }}>{u.auth_provider}</td>
              <td style={{ padding: '12px' }}>
                <button 
                  onClick={() => handleDeleteUser(u.id, u.name)}
                  style={{ background: '#d32f2f', color: 'white', border: 'none', padding: '6px 12px', borderRadius: '4px', cursor: 'pointer' }}
                  disabled={u.user_type === 'admin'} // Prevent deleting other admins
                >
                  Delete
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default AdminDashboard;