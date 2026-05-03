// src/pages/BrokerIntegrationPage.jsx
import { useState } from 'react';
import api from '../api';

const BrokerIntegrationPage = () => {
  const [brokerName, setBrokerName] = useState('Zerodha');
  const [apiKey, setApiKey] = useState('');
  const [apiSecret, setApiSecret] = useState('');
  const [statusMessage, setStatusMessage] = useState({ type: '', text: '' });
  const [isSyncing, setIsSyncing] = useState(false);

  const handleConnect = async (e) => {
    e.preventDefault();
    setStatusMessage({ type: '', text: '' });
    try {
      const response = await api.post('/broker/connect', {
        broker_name: brokerName,
        api_key: apiKey,
        api_secret: apiSecret
      });
      setStatusMessage({ type: 'success', text: response.data.message });
      setApiKey('');
      setApiSecret('');
    } catch (err) {
      setStatusMessage({ 
        type: 'error', 
        text: err.response?.data?.error || 'Failed to connect broker.' 
      });
    }
  };

  const handleSync = async () => {
    setIsSyncing(true);
    setStatusMessage({ type: '', text: '' });
    try {
      const response = await api.post('/broker/sync', { broker_name: brokerName });
      setStatusMessage({ type: 'success', text: response.data.message });
    } catch (err) {
      setStatusMessage({ 
        type: 'error', 
        text: err.response?.data?.error || 'Failed to sync trades.' 
      });
    } finally {
      setIsSyncing(false);
    }
  };

  return (
    <div style={{ padding: '40px', maxWidth: '800px', margin: '0 auto' }}>
      <h1>Broker Integration</h1>
      <p style={{ color: '#666', marginBottom: '30px' }}>
        Securely connect your broker to automatically import your trade history. Your API keys are encrypted at rest using AES-256.
      </p>

      {statusMessage.text && (
        <div style={{ 
          padding: '15px', 
          marginBottom: '20px', 
          borderRadius: '4px',
          backgroundColor: statusMessage.type === 'success' ? '#e8f5e9' : '#ffebee',
          color: statusMessage.type === 'success' ? '#2e7d32' : '#c62828'
        }}>
          {statusMessage.text}
        </div>
      )}

      <div style={{ background: '#f5f5f5', padding: '30px', borderRadius: '8px', marginBottom: '30px' }}>
        <h2>Connect Broker</h2>
        <form onSubmit={handleConnect} style={{ display: 'flex', flexDirection: 'column', gap: '15px', marginTop: '20px' }}>
          <div>
            <label style={{ display: 'block', marginBottom: '5px' }}>Select Broker</label>
            <select 
              value={brokerName} 
              onChange={(e) => setBrokerName(e.target.value)}
              style={{ width: '100%', padding: '10px', borderRadius: '4px', border: '1px solid #ccc' }}
            >
              <option value="Zerodha">Zerodha (Kite Connect)</option>
              <option value="Upstox">Upstox</option>
              <option value="AngelOne">Angel One</option>
            </select>
          </div>
          <div>
            <label style={{ display: 'block', marginBottom: '5px' }}>API Key</label>
            <input 
              type="text" 
              value={apiKey} 
              onChange={(e) => setApiKey(e.target.value)}
              required 
              style={{ width: '100%', padding: '10px', borderRadius: '4px', border: '1px solid #ccc' }}
            />
          </div>
          <div>
            <label style={{ display: 'block', marginBottom: '5px' }}>API Secret</label>
            <input 
              type="password" 
              value={apiSecret} 
              onChange={(e) => setApiSecret(e.target.value)}
              required 
              style={{ width: '100%', padding: '10px', borderRadius: '4px', border: '1px solid #ccc' }}
            />
          </div>
          <button type="submit" style={{ padding: '12px', background: '#007bff', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer', marginTop: '10px' }}>
            Save & Encrypt Keys
          </button>
        </form>
      </div>

      <div style={{ background: '#f5f5f5', padding: '30px', borderRadius: '8px' }}>
        <h2>Data Synchronization</h2>
        <p style={{ marginBottom: '20px' }}>Import your recent trades directly from {brokerName}.</p>
        <button 
          onClick={handleSync} 
          disabled={isSyncing}
          style={{ padding: '12px 24px', background: isSyncing ? '#ccc' : '#28a745', color: 'white', border: 'none', borderRadius: '4px', cursor: isSyncing ? 'not-allowed' : 'pointer' }}
        >
          {isSyncing ? 'Syncing...' : 'Fetch Recent Trades'}
        </button>
      </div>
    </div>
  );
};

export default BrokerIntegrationPage;