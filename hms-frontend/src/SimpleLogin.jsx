import React, { useState } from 'react';

const SimpleLogin = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleLogin = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      console.log('[SIMPLE_LOGIN] Attempting login...');
      
      const response = await fetch(`${process.env.REACT_APP_API_URL}/api/login/`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password }),
      });

      const data = await response.json();
      console.log('[SIMPLE_LOGIN] Response:', data);

      if (response.ok && data.token) {
        console.log('[SIMPLE_LOGIN] Success! Role:', data.role);
        
        // Save to localStorage
        localStorage.setItem('authToken', data.token);
        localStorage.setItem('userRole', data.role);
        localStorage.setItem('user', JSON.stringify(data.user));

        console.log('[SIMPLE_LOGIN] Saved to localStorage');
        console.log('[SIMPLE_LOGIN] Redirecting to', data.role === 'doctor' ? 'doctor-dashboard' : 'patient-dashboard');

        // Redirect based on role
        if (data.role === 'doctor') {
          window.location = '/doctor-dashboard';
        } else if (data.role === 'patient') {
          window.location = '/patient-dashboard';
        } else if (data.role === 'admin') {
          window.location = '/admin-dashboard';
        }
      } else {
        setError(data.error || 'Login failed');
      }
    } catch (err) {
      console.error('[SIMPLE_LOGIN] Error:', err);
      setError('Connection error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{
      minHeight: '100vh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor: '#F8FAFC',
      padding: '20px',
      fontFamily: 'Inter, sans-serif'
    }}>
      <div style={{
        maxWidth: '400px',
        width: '100%',
        padding: '32px',
        backgroundColor: '#FFFFFF',
        border: '1px solid #E2E8F0',
        borderRadius: '12px',
        boxShadow: '0 4px 12px rgba(0, 0, 0, 0.05)'
      }}>
        <h1 style={{ textAlign: 'center', color: '#2563EB', marginBottom: '8px' }}>HMS</h1>
        <p style={{ textAlign: 'center', fontSize: '12px', color: '#64748B', marginBottom: '32px' }}>
          Hospital Management System
        </p>

        {error && (
          <p style={{
            color: '#dc2626',
            backgroundColor: '#fee2e2',
            padding: '12px',
            borderRadius: '8px',
            marginBottom: '16px',
            fontSize: '14px'
          }}>
            {error}
          </p>
        )}

        <form onSubmit={handleLogin}>
          <div style={{ marginBottom: '16px' }}>
            <label style={{ display: 'block', fontSize: '14px', fontWeight: 'bold', color: '#2563EB', marginBottom: '8px' }}>
              Username
            </label>
            <input
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder="Enter username"
              style={{
                width: '100%',
                padding: '10px 12px',
                border: '1px solid #E2E8F0',
                borderRadius: '8px',
                fontSize: '14px',
                boxSizing: 'border-box',
                transition: 'all 0.3s'
              }}
              onFocus={(e) => {
                e.target.style.borderColor = '#2563EB';
                e.target.style.boxShadow = '0 0 0 3px #2563EB20';
              }}
              onBlur={(e) => {
                e.target.style.borderColor = '#E2E8F0';
                e.target.style.boxShadow = 'none';
              }}
              required
            />
          </div>

          <div style={{ marginBottom: '24px' }}>
            <label style={{ display: 'block', fontSize: '14px', fontWeight: 'bold', color: '#2563EB', marginBottom: '8px' }}>
              Password
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Enter password"
              style={{
                width: '100%',
                padding: '10px 12px',
                border: '1px solid #E2E8F0',
                borderRadius: '8px',
                fontSize: '14px',
                boxSizing: 'border-box',
                transition: 'all 0.3s'
              }}
              onFocus={(e) => {
                e.target.style.borderColor = '#2563EB';
                e.target.style.boxShadow = '0 0 0 3px #2563EB20';
              }}
              onBlur={(e) => {
                e.target.style.borderColor = '#E2E8F0';
                e.target.style.boxShadow = 'none';
              }}
              required
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            style={{
              width: '100%',
              padding: '12px',
              backgroundColor: loading ? '#cbd5e1' : '#2563EB',
              color: 'white',
              border: 'none',
              borderRadius: '8px',
              cursor: loading ? 'not-allowed' : 'pointer',
              fontWeight: 'bold',
              fontSize: '14px',
              transition: 'all 0.3s'
            }}
            onMouseEnter={(e) => !loading && (e.target.style.backgroundColor = '#1d4ed8')}
            onMouseLeave={(e) => !loading && (e.target.style.backgroundColor = '#2563EB')}
          >
            {loading ? 'Logging in...' : 'Login'}
          </button>
        </form>

        <p style={{ marginTop: '24px', textAlign: 'center', fontSize: '14px', color: '#64748B' }}>
          <a href="/simple-signup" style={{ color: '#2563EB', textDecoration: 'none', fontWeight: '500' }}>
            Don't have an account? Sign up
          </a>
        </p>
        <hr style={{ margin: '24px 0', borderColor: '#E2E8F0' }} />
        <p style={{ fontSize: '12px', color: '#94A3B8', textAlign: 'center', marginTop: '16px' }}>
          Test Credentials: demo / demo123
        </p>
      </div>
    </div>
  );
};

export default SimpleLogin;
