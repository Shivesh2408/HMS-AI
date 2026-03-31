import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { clearAllAuthData, verifyAuthCleared } from './authUtils';

const Login = ({ onLoginSuccess }) => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // CRITICAL: Clear all previous auth data on login page load
  useEffect(() => {
    console.log('[LOGIN_INIT] Page loaded');
    clearAllAuthData();
    verifyAuthCleared();
    console.log('[LOGIN_INIT] Login form ready for authentication');
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    // Clear any stale auth data before fresh login
    console.log('[LOGIN_SUBMIT] User clicked login');
    clearAllAuthData();

    try {
      const response = await fetch(`${process.env.REACT_APP_API_URL}/api/login/`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ username, password }),
      });

      const data = await response.json();

      if (response.ok && data.token && data.role) {
        const role = data.role.toLowerCase().trim();

        localStorage.setItem('authToken', data.token);
        localStorage.setItem('user', JSON.stringify(data.user));
        localStorage.setItem('userRole', role);

        console.log('[LOGIN] ✓ Success. User:', data.user.username, 'Role:', role);

        // CRITICAL: Use window.location for hard redirect (not navigate)
        if (role === 'doctor') {
          console.log('[LOGIN] Redirecting to /doctor-dashboard');
          window.location = '/doctor-dashboard';
        } else if (role === 'patient') {
          console.log('[LOGIN] Redirecting to /patient-dashboard');
          window.location = '/patient-dashboard';
        } else if (role === 'admin') {
          console.log('[LOGIN] Redirecting to /admin-dashboard');
          window.location = '/admin-dashboard';
        } else {
          setError('Unknown role from server: ' + role);
        }

        if (onLoginSuccess) onLoginSuccess();
      } else {
        setError(data.message || data.error || 'Login failed. Please try again.');
        console.log('[LOGIN] ✗ Failed:', data);
      }
    } catch (err) {
      setError('Error connecting to server. Please try again.');
      console.error('Login error:', err);
    } finally {
      setLoading(false);
    }
  };

  const containerVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.6, ease: 'easeOut' },
    },
  };

  const inputVariants = {
    focus: {
      boxShadow: '0 0 25px rgba(34, 211, 238, 0.6), inset 0 0 10px rgba(34, 211, 238, 0.2)',
      transition: { duration: 0.3 },
    },
  };

  return (
    <div className="w-full min-h-screen bg-gradient-to-b from-black to-gray-950 flex items-center justify-center relative overflow-hidden px-4 py-8">
      {/* Background orbs */}
      <motion.div
        animate={{ x: [0, 50, 0], y: [0, 30, 0] }}
        transition={{ duration: 20, repeat: Infinity, ease: 'easeInOut' }}
        className="absolute top-10 sm:top-20 -right-20 sm:right-20 w-48 sm:w-96 h-48 sm:h-96 bg-cyan-500/10 rounded-full blur-3xl"
      />
      <motion.div
        animate={{ x: [0, -50, 0], y: [0, -30, 0] }}
        transition={{ duration: 25, repeat: Infinity, ease: 'easeInOut' }}
        className="absolute -bottom-20 sm:bottom-20 -left-20 sm:left-20 w-48 sm:w-96 h-48 sm:h-96 bg-purple-500/10 rounded-full blur-3xl"
      />

      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className="relative z-10 w-full max-w-md"
      >
        <div className="mb-8 sm:mb-12 text-center">
          <motion.h1
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2, duration: 0.5 }}
            className="text-3xl sm:text-5xl font-black mb-2"
          >
            <span className="bg-gradient-to-r from-cyan-400 to-blue-500 bg-clip-text text-transparent">
              HMS
            </span>
          </motion.h1>
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3, duration: 0.5 }}
            className="text-gray-400 text-xs sm:text-sm"
          >
            Hospital Management System
          </motion.p>
        </div>

        <div className="relative mb-6 sm:mb-8">
          <div className="absolute -inset-1 bg-gradient-to-r from-cyan-600/20 via-blue-600/20 to-purple-600/20 rounded-2xl opacity-0 group-hover:opacity-100 blur-2xl transition-all duration-500"></div>

          <motion.form
            onSubmit={handleSubmit}
            className="relative bg-gradient-to-br from-gray-900/80 to-gray-950/80 backdrop-blur-xl border border-cyan-500/20 rounded-2xl p-4 sm:p-8 space-y-4 sm:space-y-6"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.4, duration: 0.5 }}
          >
            <h2 className="text-lg sm:text-2xl font-black bg-gradient-to-r from-cyan-400 to-blue-500 bg-clip-text text-transparent">
              Login
            </h2>

            {/* Username Input */}
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5, duration: 0.4 }}
            >
              <label className="block text-xs sm:text-sm font-semibold text-cyan-400 mb-2">Username</label>
              <motion.input
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="Enter username"
                variants={inputVariants}
                whileFocus="focus"
                className="w-full bg-gray-900/50 border border-cyan-500/30 rounded-lg px-3 sm:px-4 py-2 sm:py-3 text-gray-100 placeholder-gray-600 focus:outline-none transition-all duration-300 text-sm"
                required
              />
            </motion.div>

            {/* Password Input */}
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.6, duration: 0.4 }}
            >
              <label className="block text-xs sm:text-sm font-semibold text-cyan-400 mb-2">Password</label>
              <motion.input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter password"
                variants={inputVariants}
                whileFocus="focus"
                className="w-full bg-gray-900/50 border border-cyan-500/30 rounded-lg px-3 sm:px-4 py-2 sm:py-3 text-gray-100 placeholder-gray-600 focus:outline-none transition-all duration-300 text-sm"
                required
              />
            </motion.div>

            {/* Error Message */}
            {error && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-red-500/20 border border-red-500/50 rounded-lg p-2 sm:p-3 text-red-400 text-xs sm:text-sm"
              >
                {error}
              </motion.div>
            )}

            {/* Submit Button */}
            <motion.button
              type="submit"
              disabled={loading}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              className="w-full bg-gradient-to-r from-cyan-500 to-blue-600 text-white font-bold py-2 sm:py-3 rounded-lg transition-all duration-300 hover:shadow-lg hover:shadow-cyan-500/50 disabled:opacity-50 text-sm sm:text-base"
            >
              {loading ? (
                <motion.div
                  animate={{ rotate: 360 }}
                  transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
                  className="inline-block w-5 h-5 border-2 border-white border-t-transparent rounded-full"
                />
              ) : (
                'Login'
              )}
            </motion.button>

            {/* Signup Link */}
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.8, duration: 0.4 }}
              className="text-center text-gray-400 text-xs sm:text-sm"
            >
              Don't have an account?{' '}
              <button
                onClick={() => window.location = '/signup'}
                className="text-cyan-400 hover:text-cyan-300 transition-colors font-semibold"
              >
                Sign up
              </button>
            </motion.p>
          </motion.form>
        </div>
      </motion.div>
    </div>
  );
};

export default Login;
