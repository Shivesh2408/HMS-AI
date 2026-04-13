import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import Chat from './Chat';
import BookAppointment from './BookAppointment';
import MyAppointments from './MyAppointments';
import Pharmacy from './Pharmacy';
import MyBills from './MyBills';
import MedicalRecords from './MedicalRecords';

const PatientDashboard = () => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('dashboard');
  const [loading, setLoading] = useState(true);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [stats, setStats] = useState({
    appointments: 0,
    doctors: 0,
    upcoming: 0,
  });
  const [error, setError] = useState('');
  const [refreshAppointments, setRefreshAppointments] = useState(0);

  useEffect(() => {
    const token = localStorage.getItem('authToken');
    const userRole = localStorage.getItem('userRole');
    
    console.log('[PATIENT_DASHBOARD] Token:', token ? 'EXISTS' : 'MISSING');
    console.log('[PATIENT_DASHBOARD] Role in localStorage:', userRole);

    if (!token) {
      console.warn('[PATIENT_DASHBOARD] No token - redirecting to login');
      window.location.href = '/login';
      return;
    }

    // STRICT role verification - Must be patient
    if (userRole !== 'patient') {
      console.error('[PATIENT_DASHBOARD] ROLE MISMATCH! Expected patient, got:', userRole);
      localStorage.clear();
      window.location.href = '/login';
      return;
    }

    fetchStats();
  }, [navigate]);

  const fetchStats = async () => {
    try {
      const token = localStorage.getItem('authToken');
      const response = await axios.get(`${process.env.REACT_APP_API_URL}/api/patient-stats/`, {
        headers: {
          'Authorization': `Token ${token}`,
          'Content-Type': 'application/json',
        },
      });
      setStats(response.data);
      setError('');
      setLoading(false);
    } catch (err) {
      console.error('Error fetching stats:', err);
      setError('Failed to load dashboard data');
      setLoading(false);
    }
  };

  const navItems = [
    { id: 'dashboard', label: 'Dashboard', icon: '📊' },
    { id: 'book-appointment', label: 'Book', icon: '📝' },
    { id: 'my-appointments', label: 'My Appointments', icon: '📋' },
    { id: 'pharmacy', label: 'Pharmacy', icon: '💊' },
    { id: 'my-bills', label: 'My Bills', icon: '🧾' },
    { id: 'medical-records', label: 'My Records', icon: '📁' },
    { id: 'chatbot', label: 'Chatbot', icon: '🤖' },
  ];

  const pageVariants = {
    initial: { opacity: 0, y: 20 },
    animate: { opacity: 1, y: 0, transition: { duration: 0.5, ease: 'easeOut' } },
    exit: { opacity: 0, y: 20, transition: { duration: 0.3 } },
  };

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { staggerChildren: 0.12, delayChildren: 0.2 },
    },
  };

  const cardVariants = {
    hidden: { opacity: 0, y: 50, scale: 0.9 },
    visible: (idx) => ({
      opacity: 1,
      y: 0,
      scale: 1,
      transition: { duration: 0.6, ease: 'easeOut', delay: idx * 0.12 },
    }),
  };

  const handleLogout = () => {
    localStorage.removeItem('authToken');
    localStorage.removeItem('user');
    localStorage.removeItem('userRole');
    navigate('/');
  };

  if (loading) {
    return (
      <div className="w-full h-screen bg-black flex items-center justify-center">
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 2, repeat: Infinity, ease: 'linear' }}
          className="w-12 h-12 rounded-full border-4 border-cyan-500/20 border-t-cyan-500"
        />
      </div>
    );
  }

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
          className="absolute top-0 left-0 w-[500px] h-[500px] bg-gradient-to-br from-cyan-600 via-blue-600 to-transparent rounded-full blur-3xl opacity-25"
        />
        <motion.div
          animate={{ opacity: [0.3, 0.5, 0.3] }}
          transition={{ duration: 8, repeat: Infinity, ease: 'easeInOut' }}
          className="absolute inset-0 bg-[linear-gradient(rgba(34,211,238,0.04)_1px,transparent_1px),linear-gradient(90deg,rgba(34,211,238,0.04)_1px,transparent_1px)] bg-[length:50px_50px]"
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
          className={`fixed md:static top-0 left-0 h-screen w-64 sm:w-72 bg-gradient-to-b from-black via-gray-950 to-black backdrop-blur-2xl border-r border-cyan-500/5 flex flex-col shadow-2xl z-40 ${
            sidebarOpen ? 'translate-x-0' : '-translate-x-full'
          } md:translate-x-0 transition-transform duration-300 ease-in-out`}
        >
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.15, duration: 0.6, ease: 'easeOut' }}
            className="px-6 sm:px-8 py-6 sm:py-8 border-b border-cyan-500/5"
          >
            <motion.div
              animate={{ scale: [1, 1.08, 1] }}
              transition={{ duration: 2.5, repeat: Infinity, ease: 'easeInOut' }}
              className="text-2xl sm:text-3xl font-black bg-gradient-to-r from-cyan-400 via-blue-500 to-purple-600 bg-clip-text text-transparent tracking-tight"
            >
              HMS
            </motion.div>
            <p className="text-xs text-cyan-400/50 mt-2 font-medium tracking-widest">PATIENT</p>
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
                        className="absolute inset-0 bg-gradient-to-r from-cyan-600/20 via-blue-600/20 to-purple-600/10 rounded-xl"
                        transition={{ type: 'spring', stiffness: 380, damping: 40 }}
                      />
                      <motion.div
                        layoutId="activeBorder"
                        className="absolute left-0 top-0 bottom-0 w-1 bg-gradient-to-b from-cyan-400 to-blue-600 rounded-r"
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

          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.6, duration: 0.6 }} className="px-6 sm:px-8 py-4 sm:py-6 border-t border-cyan-500/5">
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
            className="bg-gradient-to-r from-black via-gray-950/50 to-black backdrop-blur-2xl border-b border-cyan-500/5 px-4 sm:px-6 lg:px-8 py-4 sm:py-6 flex items-center justify-between"
          >
            <h1 className="text-xl sm:text-2xl lg:text-4xl font-black bg-gradient-to-r from-cyan-400 via-blue-500 to-purple-600 bg-clip-text text-transparent truncate">Patient Dashboard</h1>
            {/* Hamburger Menu */}
            <button
              onClick={() => setSidebarOpen(!sidebarOpen)}
              className="md:hidden p-2 hover:bg-cyan-500/10 rounded-lg transition-colors"
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
                <motion.div key="dashboard" variants={pageVariants} initial="initial" animate="animate" exit="exit">
                  {error && (
                    <motion.div
                      initial={{ opacity: 0, y: -10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="p-3 sm:p-4 bg-red-500/20 border border-red-500/50 rounded-lg text-red-400 font-semibold mb-6 text-xs sm:text-sm"
                    >
                      ✗ {error}
                    </motion.div>
                  )}
                  <motion.div variants={containerVariants} initial="hidden" animate="visible">
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 mb-8 sm:mb-12">
                      {[
                        { title: 'Total Appointments', value: stats.appointments, icon: '📅', color: 'from-cyan-500 to-blue-600' },
                        { title: 'Upcoming', value: stats.upcoming, icon: '📆', color: 'from-green-500 to-emerald-600' },
                        { title: 'Available Doctors', value: stats.doctors, icon: '👨‍⚕️', color: 'from-purple-500 to-pink-600' },
                      ].map((stat, idx) => (
                        <motion.div key={idx} custom={idx} variants={cardVariants} className="relative">
                          <div className="absolute -inset-1 bg-gradient-to-r from-cyan-600/20 via-blue-600/20 to-purple-600/20 rounded-2xl opacity-0 group-hover:opacity-100 blur-2xl"  />
                          <div className="relative bg-gradient-to-br from-gray-900/60 to-gray-950/60 backdrop-blur-xl border border-cyan-500/10 rounded-2xl p-4 sm:p-6 lg:p-8 overflow-hidden group">
                            <div className="relative flex justify-between items-start mb-4 sm:mb-6">
                              <span className="text-3xl sm:text-4xl lg:text-5xl">{stat.icon}</span>
                              <motion.div animate={{ scale: [1, 1.05, 1] }} transition={{ duration: 2, repeat: Infinity }} className={`text-2xl sm:text-3xl lg:text-4xl font-black bg-gradient-to-r ${stat.color} bg-clip-text text-transparent`}>
                                {stat.value}
                              </motion.div>
                            </div>
                            <p className="text-gray-300 text-xs sm:text-sm font-semibold">{stat.title}</p>
                          </div>
                        </motion.div>
                      ))}
                    </div>
                  </motion.div>
                </motion.div>
              )}

              {activeTab === 'book-appointment' && <BookAppointment onBookSuccess={() => { setRefreshAppointments(refreshAppointments + 1); fetchStats(); }} />}
              {activeTab === 'my-appointments' && <MyAppointments refreshTrigger={refreshAppointments} />}
              {activeTab === 'pharmacy' && <Pharmacy />}
              {activeTab === 'my-bills' && <MyBills />}
              {activeTab === 'medical-records' && <MedicalRecords />}
              {activeTab === 'chatbot' && <Chat />}
            </AnimatePresence>
          </div>
        </div>
      </div>

      {/* Mobile Bottom Navigation */}
      <div className="fixed bottom-0 left-0 right-0 md:hidden bg-gradient-to-t from-black via-gray-950 to-transparent border-t border-cyan-500/5 backdrop-blur-2xl">
        <nav className="flex justify-around items-center px-2 py-3 space-x-1">
          {navItems.map((item) => (
            <motion.button
              key={item.id}
              onClick={() => setActiveTab(item.id)}
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.95 }}
              className={`flex flex-col items-center space-y-1 p-2 rounded-lg transition-all duration-300 ${
                activeTab === item.id ? 'text-cyan-400 bg-cyan-500/10' : 'text-gray-400 hover:text-gray-200'
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

export default PatientDashboard;
