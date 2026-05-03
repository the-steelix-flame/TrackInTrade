// src/pages/PortfolioPage.jsx
import { useState, useEffect } from 'react';
import api from '../api';

const PortfolioPage = () => {
  const [positions, setPositions] = useState([]);
  const [investments, setInvestments] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchPortfolio();
  }, []);

  const fetchPortfolio = async () => {
    try {
      const [posRes, invRes] = await Promise.all([
        api.get('/broker/positions'),
        api.get('/broker/investments')
      ]);
      setPositions(posRes.data);
      setInvestments(invRes.data);
    } catch (err) {
      console.error("Failed to load portfolio data:", err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <div style={{ padding: '40px', textAlign: 'center' }}>Loading live broker data...</div>;
  }

  return (
    <div style={{ padding: '40px', maxWidth: '1200px', margin: '0 auto' }}>
      <h1>Live Portfolio</h1>
      
      {/* --- ACTIVE POSITIONS TABLE --- */}
      <h2 style={{ marginTop: '40px', borderBottom: '2px solid #eee', paddingBottom: '10px' }}>
        Active Positions (Intraday/Swing)
      </h2>
      
      {positions.length === 0 ? (
        <p>No active positions synced.</p>
      ) : (
        <table style={{ width: '100%', textAlign: 'left', borderCollapse: 'collapse', marginTop: '20px' }}>
          <thead>
            <tr style={{ background: '#f8f9fa' }}>
              <th style={{ padding: '12px', borderBottom: '2px solid #dee2e6' }}>Symbol</th>
              <th style={{ padding: '12px', borderBottom: '2px solid #dee2e6' }}>Direction</th>
              <th style={{ padding: '12px', borderBottom: '2px solid #dee2e6' }}>Qty</th>
              <th style={{ padding: '12px', borderBottom: '2px solid #dee2e6' }}>Avg Price</th>
              <th style={{ padding: '12px', borderBottom: '2px solid #dee2e6' }}>Live P&L (MTM)</th>
            </tr>
          </thead>
          <tbody>
            {positions.map(p => (
              <tr key={p.id} style={{ borderBottom: '1px solid #eee' }}>
                <td style={{ padding: '12px', fontWeight: 'bold' }}>{p.stock_name}</td>
                <td style={{ padding: '12px', color: p.direction === 'LONG' ? 'green' : 'red' }}>{p.direction}</td>
                <td style={{ padding: '12px' }}>{p.quantity}</td>
                <td style={{ padding: '12px' }}>₹{p.average_price?.toFixed(2)}</td>
                <td style={{ padding: '12px', color: p.mtm_pnl >= 0 ? 'green' : 'red', fontWeight: 'bold' }}>
                  ₹{p.mtm_pnl?.toFixed(2)}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}

      {/* --- LONG-TERM INVESTMENTS TABLE --- */}
      <h2 style={{ marginTop: '60px', borderBottom: '2px solid #eee', paddingBottom: '10px' }}>
        Holdings (Long-Term Investments)
      </h2>
      
      {investments.length === 0 ? (
        <p>No holdings synced.</p>
      ) : (
        <table style={{ width: '100%', textAlign: 'left', borderCollapse: 'collapse', marginTop: '20px' }}>
          <thead>
            <tr style={{ background: '#f8f9fa' }}>
              <th style={{ padding: '12px', borderBottom: '2px solid #dee2e6' }}>Asset</th>
              <th style={{ padding: '12px', borderBottom: '2px solid #dee2e6' }}>Type</th>
              <th style={{ padding: '12px', borderBottom: '2px solid #dee2e6' }}>Qty</th>
              <th style={{ padding: '12px', borderBottom: '2px solid #dee2e6' }}>Buy Price</th>
              <th style={{ padding: '12px', borderBottom: '2px solid #dee2e6' }}>Current Value</th>
              <th style={{ padding: '12px', borderBottom: '2px solid #dee2e6' }}>Total P&L</th>
            </tr>
          </thead>
          <tbody>
            {investments.map(i => (
              <tr key={i.id} style={{ borderBottom: '1px solid #eee' }}>
                <td style={{ padding: '12px', fontWeight: 'bold' }}>{i.stock_name}</td>
                <td style={{ padding: '12px' }}>
                  <span style={{ 
                    padding: '4px 8px', 
                    background: i.asset_class === 'ETF' ? '#e3f2fd' : '#f3e5f5', 
                    borderRadius: '4px', 
                    fontSize: '12px' 
                  }}>
                    {i.asset_class}
                  </span>
                </td>
                <td style={{ padding: '12px' }}>{i.quantity}</td>
                <td style={{ padding: '12px' }}>₹{i.buy_price?.toFixed(2)}</td>
                <td style={{ padding: '12px' }}>₹{i.current_value?.toFixed(2)}</td>
                <td style={{ padding: '12px', color: i.pnl >= 0 ? 'green' : 'red', fontWeight: 'bold' }}>
                  ₹{i.pnl?.toFixed(2)}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
};

export default PortfolioPage;