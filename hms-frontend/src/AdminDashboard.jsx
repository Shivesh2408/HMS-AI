import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { getAdminStats } from './firebase.service';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import Security from './Security';

const AdminDashboard = () => {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [loading, setLoading] = useState(true);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [error, setError] = useState('');
  const [stats, setStats] = useState({
    total_patients: 0,
    total_doctors: 0,
    total_appointments: 0,
    total_revenue: 0,
    status_breakdown: {},
    recent_bookings: [],
    recent_bills: [],
    daily_appointments: [],
    daily_revenue: [],
  });

  useEffect(() => {
    const token = localStorage.getItem('authToken');
    const userRole = localStorage.getItem('userRole');
    
    console.log('[ADMIN_DASHBOARD] Initialization check...');
    console.log('[ADMIN_DASHBOARD] Token:', token ? 'EXISTS' : 'MISSING');
    console.log('[ADMIN_DASHBOARD] Role in localStorage:', userRole);

    if (!token) {
      console.warn('[ADMIN_DASHBOARD] No token - redirecting to login');
      window.location.href = '/login';
      return;
    }

    if (userRole !== 'admin') {
      console.error('[ADMIN_DASHBOARD] ROLE MISMATCH! Expected admin, got:', userRole);
      localStorage.clear();
      window.location.href = '/login';
      return;
    }

    fetchStats();
  }, []);

  const fetchStats = async () => {
    try {
      setLoading(true);
      setError('');
      
      console.log('[ADMIN_DASHBOARD] Fetching stats...');
      
      const statsData = await getAdminStats();

      if (statsData.error) {
        setError('Failed to load dashboard data');
        console.error('[ADMIN_DASHBOARD] Error:', statsData.error);
      } else {
        console.log('[ADMIN_DASHBOARD] Stats fetched:', statsData);
        setStats(statsData);
        setError('');
      }
    } catch (err) {
      console.error('[ADMIN_DASHBOARD] Error fetching stats:', err);
      setError('Failed to load dashboard data');
    } finally {
      setLoading(false);
    }
  };

  const navItems = [
    { id: 'dashboard', label: 'Overview', icon: '📊' },
    { id: 'activity', label: 'Recent Activity', icon: '📈' },
    { id: 'recent', label: 'Recent Bookings', icon: '📋' },
    { id: 'security', label: 'Security Logs', icon: '🔐' },
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
    window.location = '/';
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
          className="absolute top-0 left-0 w-[500px] h-[500px] bg-gradient-to-br from-teal-600 via-cyan-600 to-transparent rounded-full blur-3xl opacity-25"
        />
        <motion.div
          animate={{ opacity: [0.3, 0.5, 0.3] }}
          transition={{ duration: 8, repeat: Infinity, ease: 'easeInOut' }}
          className="absolute inset-0 bg-[linear-gradient(rgba(20,184,166,0.04)_1px,transparent_1px),linear-gradient(90deg,rgba(20,184,166,0.04)_1px,transparent_1px)] bg-[length:50px_50px]"
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
          className={`fixed md:static top-0 left-0 h-screen w-64 sm:w-72 bg-gradient-to-b from-black via-gray-950 to-black backdrop-blur-2xl border-r border-teal-500/5 flex flex-col shadow-2xl z-40 ${
            sidebarOpen ? 'translate-x-0' : '-translate-x-full'
          } md:translate-x-0 transition-transform duration-300 ease-in-out`}
        >
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.15, duration: 0.6, ease: 'easeOut' }}
            className="px-6 sm:px-8 py-6 sm:py-8 border-b border-teal-500/5"
          >
            <motion.div
              animate={{ scale: [1, 1.08, 1] }}
              transition={{ duration: 2.5, repeat: Infinity, ease: 'easeInOut' }}
              className="text-2xl sm:text-3xl font-black text-white tracking-tight"
            >
              HMS
            </motion.div>
            <p className="text-xs text-teal-400 mt-2 font-medium tracking-widest">ADMIN</p>
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
                  className={`w-full text-left px-3 sm:px-4 py-2 sm:py-3 rounded-lg font-semibold transition-all duration-300 flex items-center space-x-3 relative overflow-hidden group ${
                    activeTab === item.id ? 'text-white bg-teal-600/20 border border-teal-500/30' : 'text-gray-400 hover:text-gray-200 hover:bg-gray-800/50'
                  }`}
                >
                  {activeTab === item.id && (
                    <>
                      <motion.div
                        layoutId="activeBg"
                        className="absolute inset-0 bg-teal-600/10"
                        transition={{ type: 'spring', stiffness: 380, damping: 40 }}
                      />
                      <motion.div
                        layoutId="activeBorder"
                        className="absolute left-0 top-0 bottom-0 w-1 bg-teal-500"
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

          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.6, duration: 0.6 }} className="px-6 sm:px-8 py-4 sm:py-6 border-t border-teal-500/5">
            <motion.button
              onClick={handleLogout}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="w-full px-4 py-2 bg-red-600/20 border border-red-500/30 rounded-lg text-red-400 font-semibold hover:bg-red-600/30 transition-all duration-300 text-sm sm:text-base"
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
            className="bg-gray-950 border-b border-teal-500/10 px-4 sm:px-6 lg:px-8 py-4 sm:py-6 flex justify-between items-center shadow-lg"
          >
            <h1 className="text-xl sm:text-2xl lg:text-4xl font-black text-white truncate">Admin Dashboard</h1>
            <div className="flex items-center gap-2 sm:gap-4">
              <motion.button
                onClick={fetchStats}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                disabled={loading}
                className="hidden sm:block px-3 sm:px-4 py-2 bg-teal-600/30 border border-teal-500/50 text-teal-300 rounded-lg font-semibold hover:bg-teal-600/40 transition-all duration-300 disabled:opacity-50 text-sm"
              >
                {loading ? '⏳ Loading...' : '🔄 Refresh'}
              </motion.button>
              {/* Hamburger Menu */}
              <button
                onClick={() => setSidebarOpen(!sidebarOpen)}
                className="md:hidden p-2 hover:bg-gray-800 rounded-lg transition-colors text-teal-400"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={sidebarOpen ? "M6 18L18 6M6 6l12 12" : "M4 6h16M4 12h16M4 18h16"} />
                </svg>
              </button>
            </div>
          </motion.div>

          {/* Content */}
          <div className={`flex-1 overflow-auto ${activeTab === 'security' ? '' : 'p-4 sm:p-6 lg:p-8'} bg-black`}>
            <AnimatePresence mode="wait">
              {error && (
                <motion.div
                  initial={{ opacity: 0, y: -20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  className="mb-4 sm:mb-6 p-3 sm:p-4 bg-red-500/20 border border-red-500/40 rounded-lg text-red-300 text-xs sm:text-sm"
                >
                  ⚠️ {error}
                </motion.div>
              )}

              {loading ? (
                <motion.div
                  key="loading"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="flex items-center justify-center h-full"
                >
                  <motion.div
                    animate={{ rotate: 360 }}
                    transition={{ duration: 2, repeat: Infinity, ease: 'linear' }}
                    className="text-4xl"
                  >
                    ⏳
                  </motion.div>
                </motion.div>
              ) : (
                <>
                  {activeTab === 'dashboard' && (
                    <motion.div key="dashboard" variants={pageVariants} initial="initial" animate="animate" exit="exit">
                      <motion.div variants={containerVariants} initial="hidden" animate="visible">
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 mb-8 sm:mb-12">
                          {[
                            { title: 'Total Patients', value: stats.total_patients, icon: '👥', color: 'from-blue-600 to-cyan-600' },
                            { title: 'Total Doctors', value: stats.total_doctors, icon: '👨‍⚕️', color: 'from-purple-600 to-blue-600' },
                            { title: 'Total Appointments', value: stats.total_appointments, icon: '📅', color: 'from-indigo-600 to-blue-600' },
                            { title: 'Total Revenue', value: `$${stats.total_revenue.toFixed(2)}`, icon: '💰', color: 'from-green-600 to-emerald-600' },
                          ].map((stat, idx) => (
                            <motion.div key={idx} custom={idx} variants={cardVariants} className="relative p-4 sm:p-8">
                              <div className="absolute -inset-1 bg-gradient-to-r from-teal-600/20 via-cyan-600/20 to-teal-600/20 rounded-2xl opacity-0 hover:opacity-100 blur-2xl transition-opacity duration-300" />
                              <div className="relative bg-gradient-to-br from-gray-900/60 to-gray-950/60 backdrop-blur-xl border border-teal-500/10 rounded-2xl p-4 sm:p-8 overflow-hidden">
                                <div className="flex justify-between items-start mb-4 sm:mb-6">
                                  <span className="text-3xl sm:text-4xl lg:text-5xl">{stat.icon}</span>
                                  <motion.div animate={{ scale: [1, 1.05, 1] }} transition={{ duration: 2, repeat: Infinity }} className={`text-2xl sm:text-3xl lg:text-4xl font-black bg-gradient-to-r ${stat.color} bg-clip-text text-transparent`}>
                                    {stat.value}
                                  </motion.div>
                                </div>
                                <p className="text-gray-400 text-xs sm:text-sm font-semibold">{stat.title}</p>
                              </div>
                            </motion.div>
                          ))}
                        </div>

                        {/* Status Breakdown */}
                        <motion.div custom={4} variants={cardVariants} className="relative p-4 sm:p-8 mb-8 sm:mb-12">
                          <div className="absolute -inset-1 bg-gradient-to-r from-teal-600/20 via-cyan-600/20 to-teal-600/20 rounded-2xl opacity-0 hover:opacity-100 blur-2xl transition-opacity duration-300" />
                          <div className="relative bg-gradient-to-br from-gray-900/60 to-gray-950/60 backdrop-blur-xl border border-teal-500/10 rounded-2xl p-4 sm:p-8">
                            <h3 className="text-lg sm:text-xl font-bold mb-4 sm:mb-6 text-teal-400">Appointment Status Breakdown</h3>
                            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-2 sm:gap-4">
                              {Object.entries(stats.status_breakdown || {}).map(([status, count], idx) => (
                                <motion.div
                                  key={status}
                                  initial={{ opacity: 0, scale: 0.9 }}
                                  animate={{ opacity: 1, scale: 1 }}
                                  transition={{ delay: idx * 0.1 }}
                                  className="text-center p-3 sm:p-4 bg-gray-800/50 rounded-lg border border-teal-500/20"
                                >
                                  <div className="text-xl sm:text-2xl font-bold text-teal-400">{count}</div>
                                  <div className="text-xs text-gray-400 capitalize mt-2">{status}</div>
                                </motion.div>
                              ))}
                            </div>
                          </div>
                        </motion.div>
                      </motion.div>
                    </motion.div>
                  )}

                  {activeTab === 'activity' && (
                    <motion.div key="activity" variants={pageVariants} initial="initial" animate="animate" exit="exit">
                      <motion.div variants={containerVariants} initial="hidden" animate="visible">
                        {/* Recent Bills Section */}
                        <motion.div custom={0} variants={cardVariants} className="relative p-4 sm:p-8 mb-8 sm:mb-12">
                          <div className="absolute -inset-1 bg-gradient-to-r from-teal-600/20 via-cyan-600/20 to-teal-600/20 rounded-2xl opacity-0 hover:opacity-100 blur-2xl transition-opacity duration-300" />
                          <div className="relative bg-gradient-to-br from-gray-900/60 to-gray-950/60 backdrop-blur-xl border border-teal-500/10 rounded-2xl p-4 sm:p-8">
                            <h3 className="text-lg sm:text-xl font-bold mb-4 sm:mb-6 text-teal-400">Recent Purchases</h3>
                            {stats.recent_bills && stats.recent_bills.length > 0 ? (
                              <div className="space-y-2 sm:space-y-3">
                                {stats.recent_bills.map((bill, idx) => (
                                  <motion.div
                                    key={bill.id}
                                    initial={{ opacity: 0, x: -20 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    transition={{ delay: idx * 0.05 }}
                                    className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-2 p-3 sm:p-4 bg-gray-800/50 rounded-lg border border-teal-500/20 hover:border-teal-500/40 transition-all"
                                  >
                                    <div className="flex-1">
                                      <p className="text-xs sm:text-sm text-gray-400">{bill.patient}</p>
                                      <p className="text-xs text-gray-500">{new Date(bill.date).toLocaleDateString()}</p>
                                    </div>
                                    <p className="text-base sm:text-lg font-bold text-emerald-400">${bill.total_amount.toFixed(2)}</p>
                                  </motion.div>
                                ))}
                              </div>
                            ) : (
                              <div className="text-center py-8 sm:py-12 text-gray-400">
                                <p className="text-base sm:text-lg">📭 No purchases found</p>
                              </div>
                            )}
                          </div>
                        </motion.div>

                        {/* Chart Data Containers */}
                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6 mb-8 sm:mb-12">
                          {/* Daily Appointments Chart Container */}
                          <motion.div custom={1} variants={cardVariants} className="relative p-4 sm:p-8">
                            <div className="absolute -inset-1 bg-gradient-to-r from-teal-600/20 via-cyan-600/20 to-teal-600/20 rounded-2xl opacity-0 hover:opacity-100 blur-2xl transition-opacity duration-300" />
                            <div className="relative bg-gradient-to-br from-gray-900/60 to-gray-950/60 backdrop-blur-xl border border-teal-500/10 rounded-2xl p-4 sm:p-8 min-h-[250px] sm:min-h-[300px]">
                              <h3 className="text-base sm:text-xl font-bold mb-4 sm:mb-6 text-teal-400">Appointments Over Time</h3>
                              {stats.daily_appointments && stats.daily_appointments.length > 0 ? (
                                <ResponsiveContainer width="100%" height={200}>
                                  <LineChart data={stats.daily_appointments} margin={{ top: 5, right: 10, left: -30, bottom: 5 }}>
                                    <CartesianGrid strokeDasharray="3 3" stroke="rgba(20, 184, 166, 0.1)" />
                                    <XAxis dataKey="date" stroke="rgba(156, 163, 175, 0.5)" style={{ fontSize: '10px' }} />
                                    <YAxis stroke="rgba(156, 163, 175, 0.5)" style={{ fontSize: '10px' }} />
                                    <Tooltip 
                                      contentStyle={{ backgroundColor: 'rgba(31, 41, 55, 0.9)', border: '1px solid rgba(20, 184, 166, 0.3)', borderRadius: '8px' }}
                                      labelStyle={{ color: '#14b8a6' }}
                                    />
                                    <Legend />
                                    <Line 
                                      type="monotone" 
                                      dataKey="count" 
                                      stroke="#14b8a6" 
                                      dot={{ fill: '#14b8a6', r: 4 }}
                                      activeDot={{ r: 6 }}
                                      name="Appointments"
                                      isAnimationActive={true}
                                    />
                                  </LineChart>
                                </ResponsiveContainer>
                              ) : (
                                <div className="flex items-center justify-center h-[200px] text-gray-400">
                                  <p className="text-sm">📭 No data available</p>
                                </div>
                              )}
                            </div>
                          </motion.div>

                          {/* Daily Revenue Chart Container */}
                          <motion.div custom={2} variants={cardVariants} className="relative p-4 sm:p-8">
                            <div className="absolute -inset-1 bg-gradient-to-r from-teal-600/20 via-cyan-600/20 to-teal-600/20 rounded-2xl opacity-0 hover:opacity-100 blur-2xl transition-opacity duration-300" />
                            <div className="relative bg-gradient-to-br from-gray-900/60 to-gray-950/60 backdrop-blur-xl border border-teal-500/10 rounded-2xl p-4 sm:p-8 min-h-[250px] sm:min-h-[300px]">
                              <h3 className="text-base sm:text-xl font-bold mb-4 sm:mb-6 text-teal-400">Revenue Over Time</h3>
                              {stats.daily_revenue && stats.daily_revenue.length > 0 ? (
                                <ResponsiveContainer width="100%" height={200}>
                                  <LineChart data={stats.daily_revenue} margin={{ top: 5, right: 10, left: -30, bottom: 5 }}>
                                    <CartesianGrid strokeDasharray="3 3" stroke="rgba(20, 184, 166, 0.1)" />
                                    <XAxis dataKey="date" stroke="rgba(156, 163, 175, 0.5)" style={{ fontSize: '10px' }} />
                                    <YAxis stroke="rgba(156, 163, 175, 0.5)" style={{ fontSize: '10px' }} />
                                    <Tooltip 
                                      contentStyle={{ backgroundColor: 'rgba(31, 41, 55, 0.9)', border: '1px solid rgba(20, 184, 166, 0.3)', borderRadius: '8px' }}
                                      labelStyle={{ color: '#14b8a6' }}
                                      formatter={(value) => `$${value.toFixed(2)}`}
                                    />
                                    <Legend />
                                    <Line 
                                      type="monotone" 
                                      dataKey="total" 
                                      stroke="#10b981" 
                                      dot={{ fill: '#10b981', r: 4 }}
                                      activeDot={{ r: 6 }}
                                      name="Revenue"
                                      isAnimationActive={true}
                                    />
                                  </LineChart>
                                </ResponsiveContainer>
                              ) : (
                                <div className="flex items-center justify-center h-[200px] text-gray-400">
                                  <p className="text-sm">📭 No data available</p>
                                </div>
                              )}
                            </div>
                          </motion.div>
                        </div>
                      </motion.div>
                    </motion.div>
                  )}

                  {activeTab === 'recent' && (
                    <motion.div key="recent" variants={pageVariants} initial="initial" animate="animate" exit="exit">
                      <h2 className="text-lg sm:text-2xl font-bold mb-4 sm:mb-6 text-teal-400">Recent Bookings</h2>
                      {stats.recent_bookings && stats.recent_bookings.length > 0 ? (
                        <motion.div variants={containerVariants} initial="hidden" animate="visible" className="space-y-3 sm:space-y-4">
                          {stats.recent_bookings.map((booking, idx) => (
                            <motion.div
                              key={booking.id}
                              custom={idx}
                              variants={cardVariants}
                              className="relative p-4 sm:p-6"
                            >
                              <div className="absolute -inset-1 bg-gradient-to-r from-teal-600/20 via-cyan-600/20 to-teal-600/20 rounded-2xl opacity-0 hover:opacity-100 blur-2xl transition-opacity duration-300" />
                              <div className="relative bg-gradient-to-br from-gray-900/60 to-gray-950/60 backdrop-blur-xl border border-teal-500/10 rounded-2xl p-4 sm:p-6">
                                <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3 sm:gap-4">
                                  <div>
                                    <p className="text-xs text-gray-400">Patient</p>
                                    <p className="font-semibold text-white text-xs sm:text-sm">{booking.patient}</p>
                                  </div>
                                  <div>
                                    <p className="text-xs text-gray-400">Doctor</p>
                                    <p className="font-semibold text-white text-xs sm:text-sm">{booking.doctor}</p>
                                  </div>
                                  <div>
                                    <p className="text-xs text-gray-400">Date</p>
                                    <p className="font-semibold text-white text-xs sm:text-sm">{booking.date}</p>
                                  </div>
                                  <div>
                                    <p className="text-xs text-gray-400">Time</p>
                                    <p className="font-semibold text-white text-xs sm:text-sm">{booking.time}</p>
                                  </div>
                                  <div>
                                    <p className="text-xs text-gray-400">Status</p>
                                    <p className={`font-semibold capitalize text-xs sm:text-sm ${
                                      booking.status === 'pending' ? 'text-yellow-400' :
                                      booking.status === 'accepted' ? 'text-green-400' :
                                      booking.status === 'rejected' ? 'text-red-400' :
                                      'text-teal-400'
                                    }`}>
                                      {booking.status}
                                    </p>
                                  </div>
                                </div>
                              </div>
                            </motion.div>
                          ))}
                        </motion.div>
                      ) : (
                        <div className="text-center py-8 sm:py-12 text-gray-400">
                          <p className="text-base sm:text-lg">📭 No bookings found</p>
                        </div>
                      )}
                    </motion.div>
                  )}

                  {activeTab === 'security' && <Security />}
                </>
              )}
            </AnimatePresence>
          </div>
        </div>
      </div>

      {/* Mobile Bottom Navigation */}
      <div className="fixed bottom-0 left-0 right-0 md:hidden bg-gradient-to-t from-black via-gray-950 to-transparent border-t border-teal-500/5 backdrop-blur-2xl">
        <nav className="flex justify-around items-center px-2 py-3 space-x-1">
          {navItems.map((item) => (
            <motion.button
              key={item.id}
              onClick={() => setActiveTab(item.id)}
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.95 }}
              className={`flex flex-col items-center space-y-1 p-2 rounded-lg transition-all duration-300 ${
                activeTab === item.id ? 'text-teal-400 bg-teal-500/10' : 'text-gray-400 hover:text-gray-200'
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

export default AdminDashboard;
