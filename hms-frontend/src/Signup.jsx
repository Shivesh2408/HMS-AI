import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { registerUser, createPatient, createDoctor } from './firebase.service';

const Signup = () => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [password2, setPassword2] = useState('');
  const [role, setRole] = useState('patient');
  const [phone, setPhone] = useState('');
  const [specialization, setSpecialization] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');

  // Firebase auth ready
  useEffect(() => {
    console.log('[SIGNUP_INIT] Page loaded - Firebase auth ready');
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setMessage('');

    console.log('[SIGNUP_SUBMIT] User clicked signup with role:', role);

    if (password !== password2) {
      setError('Passwords do not match');
      return;
    }

    if (password.length < 6) {
      setError('Password must be at least 6 characters');
      return;
    }

    if (!role || (role !== 'patient' && role !== 'doctor' && role !== 'admin')) {
      setError('Invalid role selected');
      return;
    }

    setLoading(true);

    try {
      // Register user with Firebase Auth
      const registerResult = await registerUser(email, password, {
        name,
        role,
        phone,
      });

      if (!registerResult.success) {
        setError(registerResult.error || 'Registration failed');
        console.log('[SIGNUP] ERROR:', registerResult.error);
        setLoading(false);
        return;
      }

      const userId = registerResult.uid;
      console.log('[SIGNUP] User created with UID:', userId);

      // Create patient or doctor profile based on role
      let profileResult;
      if (role === 'patient') {
        profileResult = await createPatient(userId, {
          name,
          phone,
          email,
        });
        console.log('[SIGNUP] Patient profile created');
      } else if (role === 'doctor') {
        profileResult = await createDoctor(userId, {
          name,
          phone,
          email,
          specialization: specialization || 'General',
        });
        console.log('[SIGNUP] Doctor profile created');
      }

      if (profileResult.success || profileResult.id) {
        setMessage('✓ Signup successful! Redirecting to login...');
        console.log('[SIGNUP] Profile created successfully');

        // Redirect to login after 2 seconds
        setTimeout(() => {
          console.log('[SIGNUP] Redirecting to login');
          window.location = '/login';
        }, 2000);
      } else {
        setError(profileResult.error || 'Failed to create profile');
        console.log('[SIGNUP] PROFILE ERROR:', profileResult);
      }
    } catch (err) {
      setError('Error during signup. Please try again.');
      console.error('[SIGNUP] ERROR:', err);
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

  return (
    <div className="w-full min-h-screen bg-gradient-to-b from-black to-gray-950 flex items-center justify-center relative overflow-hidden px-4 py-8">
      {/* Background orbs */}
      <motion.div
        animate={{ x: [0, 50, 0], y: [0, 30, 0] }}
        transition={{ duration: 20, repeat: Infinity, ease: 'easeInOut' }}
        className="absolute top-10 sm:top-20 -right-20 sm:right-20 w-48 sm:w-96 h-48 sm:h-96 bg-purple-500/10 rounded-full blur-3xl"
      />
      <motion.div
        animate={{ x: [0, -50, 0], y: [0, -30, 0] }}
        transition={{ duration: 25, repeat: Infinity, ease: 'easeInOut' }}
        className="absolute -bottom-20 sm:bottom-20 -left-20 sm:left-20 w-48 sm:w-96 h-48 sm:h-96 bg-cyan-500/10 rounded-full blur-3xl"
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
            <span className="bg-gradient-to-r from-purple-400 to-pink-500 bg-clip-text text-transparent">
              HMS
            </span>
          </motion.h1>
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3, duration: 0.5 }}
            className="text-gray-400 text-xs sm:text-sm"
          >
            Join Hospital Management System
          </motion.p>
        </div>

        <div className="relative mb-6 sm:mb-8">
          <div className="absolute -inset-1 bg-gradient-to-r from-purple-600/20 via-pink-600/20 to-cyan-600/20 rounded-2xl opacity-0 group-hover:opacity-100 blur-2xl transition-all duration-500"></div>

          <motion.form
            onSubmit={handleSubmit}
            className="relative bg-gradient-to-br from-gray-900/80 to-gray-950/80 backdrop-blur-xl border border-purple-500/20 rounded-2xl p-4 sm:p-8 space-y-3 sm:space-y-6"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.4, duration: 0.5 }}
          >
            <h2 className="text-lg sm:text-2xl font-black bg-gradient-to-r from-purple-400 to-pink-500 bg-clip-text text-transparent">
              Create Account
            </h2>

            {/* Name Input */}
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5, duration: 0.4 }}
            >
              <label className="block text-xs sm:text-sm font-semibold text-purple-400 mb-2">Full Name</label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Enter full name"
                className="w-full bg-gray-900/50 border border-purple-500/30 rounded-lg px-3 sm:px-4 py-2 sm:py-3 text-gray-100 placeholder-gray-600 focus:outline-none focus:border-purple-400 focus:ring-2 focus:ring-purple-400/20 transition-all duration-300 text-sm"
                required
              />
            </motion.div>

            {/* Email Input */}
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.6, duration: 0.4 }}
            >
              <label className="block text-xs sm:text-sm font-semibold text-purple-400 mb-2">Email</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Enter email"
                className="w-full bg-gray-900/50 border border-purple-500/30 rounded-lg px-3 sm:px-4 py-2 sm:py-3 text-gray-100 placeholder-gray-600 focus:outline-none focus:border-purple-400 focus:ring-2 focus:ring-purple-400/20 transition-all duration-300 text-sm"
                required
              />
            </motion.div>

            {/* Phone Input */}
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.62, duration: 0.4 }}
            >
              <label className="block text-xs sm:text-sm font-semibold text-purple-400 mb-2">Phone Number</label>
              <input
                type="tel"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="Your phone number"
                className="w-full bg-gray-900/50 border border-purple-500/30 rounded-lg px-3 sm:px-4 py-2 sm:py-3 text-gray-100 placeholder-gray-600 focus:outline-none focus:border-purple-400 focus:ring-2 focus:ring-purple-400/20 transition-all duration-300 text-sm"
              />
            </motion.div>

            {/* Specialization Input (only for doctors) */}
            {role === 'doctor' && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.64, duration: 0.4 }}
              >
                <label className="block text-xs sm:text-sm font-semibold text-purple-400 mb-2">Specialization</label>
                <input
                  type="text"
                  value={specialization}
                  onChange={(e) => setSpecialization(e.target.value)}
                  placeholder="e.g., Cardiology, Neurology"
                  className="w-full bg-gray-900/50 border border-purple-500/30 rounded-lg px-3 sm:px-4 py-2 sm:py-3 text-gray-100 placeholder-gray-600 focus:outline-none focus:border-purple-400 focus:ring-2 focus:ring-purple-400/20 transition-all duration-300 text-sm"
                />
              </motion.div>
            )}

            {/* Role Selection */}
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.65, duration: 0.4 }}
            >
              <label className="block text-xs sm:text-sm font-semibold text-purple-400 mb-2">Account Type</label>
              <select
                value={role}
                onChange={(e) => setRole(e.target.value)}
                className="w-full bg-gray-900/50 border border-purple-500/30 rounded-lg px-3 sm:px-4 py-2 sm:py-3 text-gray-100 focus:outline-none focus:border-purple-400 focus:ring-2 focus:ring-purple-400/20 transition-all duration-300 cursor-pointer text-sm"
              >
                <option value="patient">Patient</option>
                <option value="doctor">Doctor</option>
                <option value="admin">Admin</option>
              </select>
            </motion.div>

            {/* Password Input */}
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.7, duration: 0.4 }}
            >
              <label className="block text-xs sm:text-sm font-semibold text-purple-400 mb-2">Password</label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Create password"
                className="w-full bg-gray-900/50 border border-purple-500/30 rounded-lg px-3 sm:px-4 py-2 sm:py-3 text-gray-100 placeholder-gray-600 focus:outline-none focus:border-purple-400 focus:ring-2 focus:ring-purple-400/20 transition-all duration-300 text-sm"
                required
              />
            </motion.div>

            {/* Confirm Password Input */}
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.75, duration: 0.4 }}
            >
              <label className="block text-xs sm:text-sm font-semibold text-purple-400 mb-2">Confirm Password</label>
              <input
                type="password"
                value={password2}
                onChange={(e) => setPassword2(e.target.value)}
                placeholder="Confirm password"
                className="w-full bg-gray-900/50 border border-purple-500/30 rounded-lg px-3 sm:px-4 py-2 sm:py-3 text-gray-100 placeholder-gray-600 focus:outline-none focus:border-purple-400 focus:ring-2 focus:ring-purple-400/20 transition-all duration-300 text-sm"
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
                ✗ {error}
              </motion.div>
            )}

            {/* Success Message */}
            {message && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-green-500/20 border border-green-500/50 rounded-lg p-2 sm:p-3 text-green-400 text-xs sm:text-sm"
              >
                ✓ {message}
              </motion.div>
            )}

            {/* Submit Button */}
            <motion.button
              type="submit"
              disabled={loading}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              className="w-full bg-gradient-to-r from-purple-500 to-pink-600 text-white font-bold py-2 sm:py-3 rounded-lg transition-all duration-300 hover:shadow-lg hover:shadow-purple-500/50 disabled:opacity-50 text-sm sm:text-base"
            >
              {loading ? (
                <motion.div
                  animate={{ rotate: 360 }}
                  transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
                  className="inline-block w-5 h-5 border-2 border-white border-t-transparent rounded-full"
                />
              ) : (
                'Sign Up'
              )}
            </motion.button>

            {/* Login Link */}
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.9, duration: 0.4 }}
              className="text-center text-gray-400 text-xs sm:text-sm"
            >
              Already have an account?{' '}
              <button
                onClick={() => window.location = '/login'}
                className="text-purple-400 hover:text-purple-300 transition-colors font-semibold"
              >
                Login
              </button>
            </motion.p>
          </motion.form>
        </div>
      </motion.div>
    </div>
  );
};

export default Signup;
