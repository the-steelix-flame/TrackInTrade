// src/pages/VerifyEmail.jsx
import { useEffect, useState } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import api from '../api';

const VerifyEmail = () => {
    const [searchParams] = useSearchParams();
    const token = searchParams.get('token');
    const navigate = useNavigate();
    const [status, setStatus] = useState('Verifying your email...');

    useEffect(() => {
        if (!token) {
            setStatus('Invalid or missing verification link.');
            return;
        }

        const verifyToken = async () => {
            try {
                // Call our backend verify route
                const response = await api.get(`/auth/verify/${token}`);

                if (response.status === 200) {
                    setStatus('Email verified successfully! Redirecting to login...');
                    // Redirect to login after 3 seconds
                    setTimeout(() => navigate('/login'), 3000);
                }
            } catch (err) {
                if (err.response && err.response.data && err.response.data.msg) {
                    setStatus(err.response.data.msg);
                } else {
                    setStatus('Server error during verification. Link may be expired.');
                }
            }
        };

        verifyToken();
    }, [token, navigate]);

    return (
        <div style={{
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            height: '100vh',
            textAlign: 'center',
            fontFamily: 'sans-serif'
        }}>
            <div style={{ padding: '40px', borderRadius: '8px', boxShadow: '0 4px 12px rgba(0,0,0,0.1)', backgroundColor: '#fff' }}>
                <h2>{status}</h2>
            </div>
        </div>
    );
};

export default VerifyEmail;