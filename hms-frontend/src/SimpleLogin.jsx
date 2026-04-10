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
    <div style={{ maxWidth: '400px', margin: '50px auto', padding: '20px', border: '1px solid #ccc' }}>
      <h1>Login</h1>
      {error && <p style={{ color: 'red' }}>{error}</p>}
      <form onSubmit={handleLogin}>
        <div style={{ marginBottom: '10px' }}>
          <label>Username:</label>
          <input
            type="text"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            style={{ width: '100%', padding: '8px' }}
            required
          />
        </div>
        <div style={{ marginBottom: '10px' }}>
          <label>Password:</label>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            style={{ width: '100%', padding: '8px' }}
            required
          />
        </div>
        <button
          type="submit"
          disabled={loading}
          style={{
            width: '100%',
            padding: '10px',
            backgroundColor: loading ? '#ccc' : '#007bff',
            color: 'white',
            border: 'none',
            cursor: loading ? 'not-allowed' : 'pointer',
          }}
        >
          {loading ? 'Logging in...' : 'Login'}
        </button>
      </form>
      <p style={{ marginTop: '20px' }}>
        <a href="/simple-signup">Don't have an account? Sign up</a>
      </p>
      <hr />
      <p style={{ fontSize: '12px', color: '#666' }}>
        TEST CREDENTIALS:
        <br />
        Username: testfix999
        <br />
        Password: pass123456
      </p>
    </div>
  );
};

export default SimpleLogin;
