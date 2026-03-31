import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';

const Security = () => {
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    totalLogins: 0,
    failedAttempts: 0,
  });

  useEffect(() => {
    fetchSecurityLogs();
  }, []);

  const fetchSecurityLogs = async () => {
    try {
      const response = await fetch(`${process.env.REACT_APP_API_URL}/api/security-logs/`);
      const data = await response.json();
      setLogs(data.logs || []);

      // Calculate stats
      const logins = data.logs.filter((log) => log.action === 'login').length;
      const failed = data.logs.filter((log) => log.action === 'failed_login').length;

      setStats({
        totalLogins: logins,
        failedAttempts: failed,
      });
    } catch (error) {
      console.error('Error fetching security logs:', error);
    } finally {
      setLoading(false);
    }
  };

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
        delayChildren: 0.2,
      },
    },
  };

  const cardVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.5,
        ease: 'easeOut',
      },
    },
  };

  const tableRowVariants = {
    hidden: { opacity: 0, x: -20 },
    visible: (custom) => ({
      opacity: 1,
      x: 0,
      transition: {
        delay: custom * 0.05,
        duration: 0.4,
      },
    }),
  };

  const getActionColor = (action) => {
    if (action === 'failed_login') return 'bg-red-500/20 border-red-500/50';
    if (action === 'login') return 'bg-green-500/20 border-green-500/50';
    if (action === 'logout') return 'bg-blue-500/20 border-blue-500/50';
    return 'bg-gray-500/20 border-gray-500/50';
  };

  const getActionTextColor = (action) => {
    if (action === 'failed_login') return 'text-red-400';
    if (action === 'login') return 'text-green-400';
    if (action === 'logout') return 'text-blue-400';
    return 'text-gray-400';
  };

  const formatTime = (timestamp) => {
    const date = new Date(timestamp);
    return date.toLocaleString();
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.3 }}
      className="w-full h-full flex flex-col"
    >
      {/* Header */}
      <div className="mb-8">
        <motion.h1
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="text-4xl font-black bg-gradient-to-r from-red-400 via-red-500 to-red-600 bg-clip-text text-transparent mb-2"
        >
          🔐 Security Dashboard
        </motion.h1>
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2, duration: 0.5 }}
          className="text-gray-400 text-sm"
        >
          System activity & security monitoring
        </motion.p>
      </div>

      {/* Stats Cards */}
      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className="grid grid-cols-2 gap-6 mb-8"
      >
        <motion.div
          variants={cardVariants}
          whileHover={{ scale: 1.05 }}
          className="relative group"
        >
          <div className="absolute -inset-1 bg-gradient-to-r from-green-600/20 via-green-600/10 to-transparent rounded-2xl opacity-0 group-hover:opacity-100 blur-2xl transition-all duration-500 ease-in-out"></div>
          <div className="relative bg-gradient-to-br from-gray-900/60 to-gray-950/60 backdrop-blur-xl border border-green-500/20 group-hover:border-green-500/40 rounded-2xl p-6 transition-all duration-300">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-green-400/70 text-sm font-semibold mb-2">Total Logins</p>
                <p className="text-4xl font-black bg-gradient-to-r from-green-400 to-green-500 bg-clip-text text-transparent">
                  {stats.totalLogins}
                </p>
              </div>
              <span className="text-5xl opacity-20">✓</span>
            </div>
          </div>
        </motion.div>

        <motion.div
          variants={cardVariants}
          whileHover={{ scale: 1.05 }}
          className="relative group"
        >
          <div className="absolute -inset-1 bg-gradient-to-r from-red-600/20 via-red-600/10 to-transparent rounded-2xl opacity-0 group-hover:opacity-100 blur-2xl transition-all duration-500 ease-in-out"></div>
          <div className="relative bg-gradient-to-br from-gray-900/60 to-gray-950/60 backdrop-blur-xl border border-red-500/20 group-hover:border-red-500/40 rounded-2xl p-6 transition-all duration-300">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-red-400/70 text-sm font-semibold mb-2">Failed Attempts</p>
                <p className="text-4xl font-black bg-gradient-to-r from-red-400 to-red-500 bg-clip-text text-transparent">
                  {stats.failedAttempts}
                </p>
              </div>
              <span className="text-5xl opacity-20">⚠</span>
            </div>
          </div>
        </motion.div>
      </motion.div>

      {/* Logs Table */}
      <motion.div
        variants={cardVariants}
        initial="hidden"
        animate="visible"
        className="relative flex-1 flex flex-col"
      >
        <div className="absolute -inset-1 bg-gradient-to-r from-red-600/20 via-red-600/10 to-purple-600/20 rounded-2xl opacity-0 hover:opacity-75 blur-2xl transition-all duration-500 ease-in-out pointer-events-none"></div>

        <div className="relative bg-gradient-to-br from-gray-900/60 to-gray-950/60 backdrop-blur-xl border border-red-500/10 hover:border-red-500/30 rounded-2xl shadow-2xl overflow-hidden flex flex-col transition-all duration-300">
          {/* Header */}
          <div className="px-8 py-6 border-b border-red-500/10 bg-gradient-to-r from-gray-900/80 via-red-900/20 to-purple-900/20">
            <h2 className="text-2xl font-black bg-gradient-to-r from-red-400 to-red-500 bg-clip-text text-transparent">
              Security Logs
            </h2>
          </div>

          {/* Content */}
          {loading ? (
            <div className="p-20 text-center">
              <motion.div
                animate={{ rotate: 360 }}
                transition={{ duration: 2, repeat: Infinity, ease: 'linear' }}
                className="w-12 h-12 rounded-full border-4 border-red-500/20 border-t-red-500 mx-auto"
                style={{
                  boxShadow: '0 0 20px rgba(239, 68, 68, 0.6)',
                }}
              />
            </div>
          ) : logs.length > 0 ? (
            <div className="overflow-x-auto flex-1">
              <table className="w-full">
                <thead>
                  <tr className="bg-gradient-to-r from-red-900/20 via-red-900/10 to-purple-900/20 border-b border-red-500/10 transition-all duration-300">
                    <th className="px-8 py-4 text-left text-red-400 font-black text-xs uppercase tracking-widest">
                      User ID
                    </th>
                    <th className="px-8 py-4 text-left text-red-400 font-black text-xs uppercase tracking-widest">
                      Action
                    </th>
                    <th className="px-8 py-4 text-left text-red-400 font-black text-xs uppercase tracking-widest">
                      IP Address
                    </th>
                    <th className="px-8 py-4 text-left text-red-400 font-black text-xs uppercase tracking-widest">
                      Timestamp
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {logs.map((log, idx) => (
                    <motion.tr
                      key={log.id}
                      custom={idx}
                      variants={tableRowVariants}
                      initial="hidden"
                      animate="visible"
                      whileHover={{
                        scale: 1.01,
                        transition: { duration: 0.2 },
                      }}
                      className={`relative border-b border-red-500/10 hover:border-red-500/30 transition-all duration-300 group ${getActionColor(
                        log.action
                      )} hover:bg-red-500/10`}
                    >
                      <td className="px-8 py-4 text-gray-100 font-semibold">
                        {log.user_id || 'N/A'}
                      </td>
                      <td className={`px-8 py-4 font-bold uppercase tracking-wide ${getActionTextColor(log.action)}`}>
                        {log.action === 'failed_login' && '⚠ '}
                        {log.action === 'login' && '✓ '}
                        {log.action === 'logout' && '→ '}
                        {log.action}
                      </td>
                      <td className="px-8 py-4 text-gray-400 font-mono text-sm">
                        {log.ip_address}
                      </td>
                      <td className="px-8 py-4 text-gray-400 text-sm">
                        {formatTime(log.timestamp)}
                      </td>
                    </motion.tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="p-20 text-center">
              <p className="text-gray-400 text-lg">No security logs found</p>
            </div>
          )}
        </div>
      </motion.div>
    </motion.div>
  );
};

export default Security;
