import React, { useEffect } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { clearAllAuthData } from './authUtils';

const Home = () => {
  const navigate = useNavigate();

  // Clear any stale auth data on home page load
  useEffect(() => {
    console.log('[HOME_INIT] Clearing stale auth data for fresh access');
    clearAllAuthData();
  }, []);

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { staggerChildren: 0.2, delayChildren: 0.3 },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 30 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.6, ease: 'easeOut' },
    },
  };

  const cardVariants = {
    hidden: { opacity: 0, scale: 0.8 },
    visible: {
      opacity: 1,
      scale: 1,
      transition: { duration: 0.5, ease: 'easeOut' },
    },
    hover: {
      scale: 1.05,
      transition: { duration: 0.3 },
    },
  };

  return (
    <div className="w-full min-h-screen bg-black text-white overflow-hidden relative">
      {/* Ultra-Premium Animated Background */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <motion.div
          animate={{
            x: [0, 200, -100, 0],
            y: [0, -150, 100, 0],
            scale: [1, 1.3, 0.9, 1],
          }}
          transition={{ duration: 20, repeat: Infinity, ease: 'easeInOut' }}
          className="absolute top-0 left-0 w-[500px] h-[500px] bg-gradient-to-br from-cyan-600 via-blue-600 to-transparent rounded-full blur-3xl opacity-25"
        />
        <motion.div
          animate={{
            x: [0, -200, 100, 0],
            y: [0, 150, -100, 0],
            scale: [1, 0.9, 1.2, 1],
          }}
          transition={{ duration: 25, repeat: Infinity, ease: 'easeInOut' }}
          className="absolute bottom-0 right-0 w-[500px] h-[500px] bg-gradient-to-br from-purple-600 via-pink-600 to-transparent rounded-full blur-3xl opacity-25"
        />
        <motion.div
          animate={{ opacity: [0.3, 0.5, 0.3] }}
          transition={{ duration: 8, repeat: Infinity, ease: 'easeInOut' }}
          className="absolute inset-0 bg-[linear-gradient(rgba(34,211,238,0.04)_1px,transparent_1px),linear-gradient(90deg,rgba(34,211,238,0.04)_1px,transparent_1px)] bg-[length:50px_50px]"
        />
      </div>

      {/* Content */}
      <div className="relative z-10 flex flex-col items-center justify-center min-h-screen px-4 sm:px-6 py-8 sm:py-12">
        {/* Header */}
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className="text-center mb-8 sm:mb-16"
        >
          <motion.h1
            variants={itemVariants}
            className="text-4xl sm:text-6xl md:text-7xl font-black mb-2 sm:mb-4"
          >
            <span className="bg-gradient-to-r from-cyan-400 via-blue-500 to-purple-600 bg-clip-text text-transparent">
              HMS
            </span>
          </motion.h1>
          <motion.p
            variants={itemVariants}
            className="text-lg sm:text-2xl md:text-3xl text-gray-300 mb-1 sm:mb-2 font-semibold"
          >
            Hospital Management System
          </motion.p>
          <motion.p
            variants={itemVariants}
            className="text-gray-500 text-sm sm:text-lg"
          >
            AI-Powered Healthcare Solutions
          </motion.p>
        </motion.div>

        {/* Portal Selection Cards */}
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 lg:gap-8 w-full max-w-6xl"
        >
          {/* Patient Portal */}
          <motion.div
            variants={cardVariants}
            whileHover="hover"
            className="group relative"
          >
            <div className="absolute -inset-1 bg-gradient-to-r from-cyan-600/20 via-blue-600/20 to-purple-600/20 rounded-2xl opacity-0 group-hover:opacity-100 blur-2xl transition-all duration-500" />
            <div className="relative bg-gradient-to-br from-gray-900/60 to-gray-950/60 backdrop-blur-xl border border-cyan-500/20 rounded-2xl p-4 sm:p-8 transition-all duration-300 flex flex-col items-center text-center">
              <motion.div
                animate={{ scale: [1, 1.1, 1] }}
                transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
                className="text-4xl sm:text-6xl mb-2 sm:mb-4"
              >
                👤
              </motion.div>
              <h3 className="text-lg sm:text-2xl font-black bg-gradient-to-r from-cyan-400 to-blue-500 bg-clip-text text-transparent mb-2 sm:mb-3">
                Patient Portal
              </h3>
              <p className="text-gray-400 text-xs sm:text-sm mb-4 sm:mb-6">
                Book appointments, manage medical records, and access pharmacy services
              </p>
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => navigate('/login?role=patient')}
                className="px-4 sm:px-6 py-2 sm:py-3 bg-gradient-to-r from-cyan-500 to-blue-600 text-white font-bold rounded-lg hover:shadow-lg hover:shadow-cyan-500/50 transition-all duration-300 text-sm"
              >
                Access Patient Portal
              </motion.button>
            </div>
          </motion.div>

          {/* Doctor Portal */}
          <motion.div
            variants={cardVariants}
            whileHover="hover"
            className="group relative"
          >
            <div className="absolute -inset-1 bg-gradient-to-r from-purple-600/20 via-pink-600/20 to-rose-600/20 rounded-2xl opacity-0 group-hover:opacity-100 blur-2xl transition-all duration-500" />
            <div className="relative bg-gradient-to-br from-gray-900/60 to-gray-950/60 backdrop-blur-xl border border-purple-500/20 rounded-2xl p-4 sm:p-8 transition-all duration-300 flex flex-col items-center text-center">
              <motion.div
                animate={{ scale: [1, 1.1, 1] }}
                transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut', delay: 0.2 }}
                className="text-4xl sm:text-6xl mb-2 sm:mb-4"
              >
                👨‍⚕️
              </motion.div>
              <h3 className="text-lg sm:text-2xl font-black bg-gradient-to-r from-purple-400 to-pink-500 bg-clip-text text-transparent mb-2 sm:mb-3">
                Doctor Portal
              </h3>
              <p className="text-gray-400 text-xs sm:text-sm mb-4 sm:mb-6">
                View appointments, update diagnosis, and manage patient care
              </p>
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => navigate('/login?role=doctor')}
                className="px-4 sm:px-6 py-2 sm:py-3 bg-gradient-to-r from-purple-500 to-pink-600 text-white font-bold rounded-lg hover:shadow-lg hover:shadow-purple-500/50 transition-all duration-300 text-sm"
              >
                Access Doctor Portal
              </motion.button>
            </div>
          </motion.div>

          {/* Admin Portal */}
          <motion.div
            variants={cardVariants}
            whileHover="hover"
            className="group relative sm:col-span-2 lg:col-span-1"
          >
            <div className="absolute -inset-1 bg-gradient-to-r from-green-600/20 via-emerald-600/20 to-teal-600/20 rounded-2xl opacity-0 group-hover:opacity-100 blur-2xl transition-all duration-500" />
            <div className="relative bg-gradient-to-br from-gray-900/60 to-gray-950/60 backdrop-blur-xl border border-green-500/20 rounded-2xl p-4 sm:p-8 transition-all duration-300 flex flex-col items-center text-center">
              <motion.div
                animate={{ scale: [1, 1.1, 1] }}
                transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut', delay: 0.4 }}
                className="text-4xl sm:text-6xl mb-2 sm:mb-4"
              >
                🔐
              </motion.div>
              <h3 className="text-lg sm:text-2xl font-black bg-gradient-to-r from-green-400 to-emerald-500 bg-clip-text text-transparent mb-2 sm:mb-3">
                Admin Portal
              </h3>
              <p className="text-gray-400 text-xs sm:text-sm mb-4 sm:mb-6">
                Monitor system security, manage users, and view system logs
              </p>
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => navigate('/login?role=admin')}
                className="px-4 sm:px-6 py-2 sm:py-3 bg-gradient-to-r from-green-500 to-emerald-600 text-white font-bold rounded-lg hover:shadow-lg hover:shadow-green-500/50 transition-all duration-300 text-sm"
              >
                Access Admin Portal
              </motion.button>
            </div>
          </motion.div>
        </motion.div>

        {/* Footer */}
        <motion.p
          variants={itemVariants}
          className="mt-8 sm:mt-16 text-gray-600 text-center text-xs sm:text-sm"
        >
          v2.0 • Cyberpunk Edition • AI Powered
        </motion.p>

        {/* Debug/Test Links */}
        <motion.div
          variants={itemVariants}
          className="mt-6 sm:mt-8 text-center text-xs text-gray-500"
        >
          <p>
            <a href="/simple-login" className="text-cyan-400 hover:underline">
              Simple Login (Test)
            </a>
            {" | "}
            <a href="/simple-signup" className="text-cyan-400 hover:underline">
              Simple Signup (Test)
            </a>
          </p>
        </motion.div>
      </div>
    </div>
  );
};

export default Home;
