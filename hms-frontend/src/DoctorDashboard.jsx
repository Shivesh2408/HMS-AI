import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import DoctorProfilePage from './DoctorProfilePage';
import DoctorSchedulePage from './DoctorSchedulePage';
import DoctorAppointmentsPage from './DoctorAppointmentsPage';
import DoctorPrescriptions from './DoctorPrescriptions';

const DoctorDashboard = () => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('dashboard');
  const [sidebarOpen, setSidebarOpen] = useState(false);

  useEffect(() => {
    const token = localStorage.getItem('authToken');
    const userRole = localStorage.getItem('userRole');
    
    console.log('[DOCTOR_DASHBOARD] Token:', token ? 'EXISTS' : 'MISSING');
    console.log('[DOCTOR_DASHBOARD] Role in localStorage:', userRole);

    if (!token) {
      console.warn('[DOCTOR_DASHBOARD] No token - redirecting to login');
      window.location.href = '/login';
      return;
    }

    // STRICT role verification - Must be doctor
    if (userRole !== 'doctor') {
      console.error('[DOCTOR_DASHBOARD] ROLE MISMATCH! Expected doctor, got:', userRole);
      localStorage.clear();
      window.location.href = '/login';
      return;
    }
  }, [navigate]);

  const navItems = [
    { id: 'dashboard', label: 'Dashboard', icon: '📊' },
    { id: 'profile', label: 'My Profile', icon: '👤' },
    { id: 'schedule', label: 'My Schedule', icon: '📅' },
    { id: 'appointments', label: 'Appointments', icon: '📋' },
    { id: 'prescriptions', label: 'Prescriptions', icon: '💊' },
  ];

  const pageVariants = {
    initial: { opacity: 0, y: 20 },
    animate: { opacity: 1, y: 0, transition: { duration: 0.5, ease: 'easeOut' } },
    exit: { opacity: 0, y: 20, transition: { duration: 0.3 } },
  };

  const handleLogout = () => {
    localStorage.removeItem('authToken');
    localStorage.removeItem('user');
    localStorage.removeItem('userRole');
    navigate('/');
  };

  return (
    <div className="min-h-screen bg-black text-white overflow-hidden relative">
      {/* Background */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <motion.div
          animate={{
            x: [0, 200, -100, 0],
            y: [0, -150, 100, 0],
            scale: [1, 1.3, 0.9, 1],
          }}
          transition={{ duration: 20, repeat: Infinity, ease: 'easeInOut' }}
          className="absolute top-0 left-0 w-[500px] h-[500px] bg-gradient-to-br from-purple-600 via-pink-600 to-transparent rounded-full blur-3xl opacity-25"
        />
        <motion.div
          animate={{ opacity: [0.3, 0.5, 0.3] }}
          transition={{ duration: 8, repeat: Infinity, ease: 'easeInOut' }}
          className="absolute inset-0 bg-[linear-gradient(rgba(168,85,247,0.04)_1px,transparent_1px),linear-gradient(90deg,rgba(168,85,247,0.04)_1px,transparent_1px)] bg-[length:50px_50px]"
        />
      </div>

      {/* Mobile Sidebar Overlay */}
      <AnimatePresence>
        {sidebarOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setSidebarOpen(false)}
            className="fixed inset-0 bg-black/50 z-30 md:hidden"
          />
        )}
      </AnimatePresence>

      <div className="relative z-10 flex flex-col md:flex-row h-screen gap-0">
        {/* Sidebar - Hidden on mobile, visible on md and up */}
        <motion.div
          initial={{ x: -300, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          transition={{ duration: 0.7, ease: 'easeOut', type: 'spring', stiffness: 100 }}
          className={`fixed md:static top-0 left-0 h-screen w-64 sm:w-72 bg-gradient-to-b from-black via-gray-950 to-black backdrop-blur-2xl border-r border-purple-500/5 flex flex-col shadow-2xl z-40 ${
            sidebarOpen ? 'translate-x-0' : '-translate-x-full'
          } md:translate-x-0 transition-transform duration-300 ease-in-out`}
        >
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.15, duration: 0.6, ease: 'easeOut' }}
            className="px-6 sm:px-8 py-6 sm:py-8 border-b border-purple-500/5"
          >
            <motion.div
              animate={{ scale: [1, 1.08, 1] }}
              transition={{ duration: 2.5, repeat: Infinity, ease: 'easeInOut' }}
              className="text-2xl sm:text-3xl font-black bg-gradient-to-r from-purple-400 to-pink-500 bg-clip-text text-transparent tracking-tight"
            >
              HMS
            </motion.div>
            <p className="text-xs text-purple-400/50 mt-2 font-medium tracking-widest">DOCTOR</p>
          </motion.div>

          <nav className="flex-1 px-3 sm:px-4 py-6 sm:py-8 space-y-1 overflow-y-auto">
            {navItems.map((item, idx) => (
              <motion.div key={item.id} initial={{ opacity: 0, x: -30 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.15 + idx * 0.1, duration: 0.5, ease: 'easeOut' }}>
                <motion.button
                  onClick={() => {
                    setActiveTab(item.id);
                    setSidebarOpen(false);
                  }}
                  whileHover={{ x: 8, transition: { duration: 0.2 } }}
                  whileTap={{ scale: 0.95 }}
                  className={`w-full text-left px-3 sm:px-4 py-2 sm:py-3 rounded-xl font-semibold transition-all duration-300 flex items-center space-x-3 relative overflow-hidden group ${
                    activeTab === item.id ? 'text-white' : 'text-gray-400 hover:text-gray-200'
                  }`}
                >
                  {activeTab === item.id && (
                    <>
                      <motion.div
                        layoutId="activeBg"
                        className="absolute inset-0 bg-gradient-to-r from-purple-600/20 via-pink-600/20 to-rose-600/10 rounded-xl"
                        transition={{ type: 'spring', stiffness: 380, damping: 40 }}
                      />
                      <motion.div
                        layoutId="activeBorder"
                        className="absolute left-0 top-0 bottom-0 w-1 bg-gradient-to-b from-purple-400 to-pink-600 rounded-r"
                        transition={{ type: 'spring', stiffness: 380, damping: 40 }}
                      />
                    </>
                  )}
                  <span className="text-lg sm:text-xl relative z-10">{item.icon}</span>
                  <span className="relative z-10 text-sm sm:text-base">{item.label}</span>
                </motion.button>
              </motion.div>
            ))}
          </nav>

          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.6, duration: 0.6 }} className="px-6 sm:px-8 py-4 sm:py-6 border-t border-purple-500/5">
            <motion.button
              onClick={handleLogout}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="w-full px-4 py-2 bg-red-500/20 border border-red-500/40 rounded-lg text-red-400 font-semibold hover:bg-red-500/30 transition-all duration-300 text-sm sm:text-base"
            >
              Logout
            </motion.button>
          </motion.div>
        </motion.div>

        {/* Main Content */}
        <div className="flex-1 flex flex-col w-full md:pb-0 pb-20">
          {/* Navbar */}
          <motion.div
            initial={{ y: -100, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ duration: 0.7, ease: 'easeOut', type: 'spring', stiffness: 100 }}
            className="bg-gradient-to-r from-black via-gray-950/50 to-black backdrop-blur-2xl border-b border-purple-500/5 px-4 sm:px-6 lg:px-8 py-4 sm:py-6 flex items-center justify-between"
          >
            <h1 className="text-xl sm:text-2xl lg:text-4xl font-black bg-gradient-to-r from-purple-400 to-pink-500 bg-clip-text text-transparent truncate">Doctor Dashboard</h1>
            {/* Hamburger Menu */}
            <button
              onClick={() => setSidebarOpen(!sidebarOpen)}
              className="md:hidden p-2 hover:bg-purple-500/10 rounded-lg transition-colors"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={sidebarOpen ? "M6 18L18 6M6 6l12 12" : "M4 6h16M4 12h16M4 18h16"} />
              </svg>
            </button>
          </motion.div>

          {/* Content */}
          <div className="flex-1 overflow-auto p-4 sm:p-6 lg:p-8 bg-gradient-to-b from-black to-gray-950">
            <AnimatePresence mode="wait">
              {activeTab === 'dashboard' && (
                <motion.div key="dashboard" variants={pageVariants} initial="initial" animate="animate" exit="exit" className="text-center py-12 sm:py-24">
                  <motion.div animate={{ scale: [1, 1.1, 1], y: [0, -10, 0] }} transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }} className="text-5xl sm:text-7xl mb-4 sm:mb-6">
                    👨‍⚕️
                  </motion.div>
                  <p className="text-lg sm:text-2xl bg-gradient-to-r from-purple-400 to-pink-500 bg-clip-text text-transparent font-black">Doctor Portal</p>
                  <p className="text-xs sm:text-sm text-gray-500 mt-3">Select an option from the sidebar to get started</p>
                </motion.div>
              )}

              {activeTab === 'profile' && (
                <motion.div key="profile" variants={pageVariants} initial="initial" animate="animate" exit="exit">
                  <DoctorProfilePage />
                </motion.div>
              )}

              {activeTab === 'schedule' && (
                <motion.div key="schedule" variants={pageVariants} initial="initial" animate="animate" exit="exit">
                  <DoctorSchedulePage onScheduleAdded={() => setActiveTab('dashboard')} />
                </motion.div>
              )}

              {activeTab === 'appointments' && (
                <motion.div key="appointments" variants={pageVariants} initial="initial" animate="animate" exit="exit">
                  <DoctorAppointmentsPage />
                </motion.div>
              )}

              {activeTab === 'prescriptions' && (
                <motion.div key="prescriptions" variants={pageVariants} initial="initial" animate="animate" exit="exit">
                  <DoctorPrescriptions />
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </div>

      {/* Mobile Bottom Navigation */}
      <div className="fixed bottom-0 left-0 right-0 md:hidden bg-gradient-to-t from-black via-gray-950 to-transparent border-t border-purple-500/5 backdrop-blur-2xl">
        <nav className="flex items-center px-4 py-3 gap-2 overflow-x-auto no-scrollbar">
          {navItems.map((item) => (
            <motion.button
              key={item.id}
              onClick={() => setActiveTab(item.id)}
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.95 }}
              className={`flex flex-col items-center justify-center min-w-[72px] space-y-1 p-2 rounded-lg transition-all duration-300 ${
                activeTab === item.id ? 'text-purple-400 bg-purple-500/10' : 'text-gray-400 hover:text-gray-200'
              }`}
            >
              <span className="text-lg sm:text-xl">{item.icon}</span>
              <span className="text-xs font-semibold hidden xs:inline">{item.label.split(' ')[0]}</span>
            </motion.button>
          ))}
        </nav>
      </div>
    </div>
  );
};

export default DoctorDashboard;
