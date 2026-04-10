import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import axios from 'axios';

const MyAppointments = ({ refreshTrigger }) => {
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const token = localStorage.getItem('authToken');

  const pageVariants = {
    initial: { opacity: 0, y: 20 },
    animate: { opacity: 1, y: 0 },
    exit: { opacity: 0, y: -20 },
  };

  const cardVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.6 } },
  };

  const tableRowVariants = {
    hidden: { opacity: 0, x: -20 },
    visible: (idx) => ({
      opacity: 1,
      x: 0,
      transition: { delay: idx * 0.1, duration: 0.4 },
    }),
  };

  useEffect(() => {
    const fetchAppointments = async () => {
      try {
        setLoading(true);
        
        if (!token) {
          setError('No authentication token found. Please login again.');
          setLoading(false);
          return;
        }

        const response = await axios.get(`${process.env.REACT_APP_API_URL}/api/my-appointments/`, {
          headers: {
            'Authorization': `Token ${token}`,
            'Content-Type': 'application/json',
          },
        });
        
        setAppointments(response.data || []);
        setError('');
      } catch (err) {
        console.error('Error fetching appointments:', err);
        if (err.response?.status === 401) {
          setError('Authentication failed. Please login again.');
        } else if (err.response?.status === 403) {
          setError('Access denied. Please check your permissions.');
        } else {
          setError('Failed to fetch appointments');
        }
      } finally {
        setLoading(false);
      }
    };
    fetchAppointments();
  }, [refreshTrigger, token]);

  const getStatusColor = (status) => {
    switch (status) {
      case 'pending':
        return 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30';
      case 'accepted':
        return 'bg-green-500/20 text-green-400 border-green-500/30';
      case 'rejected':
        return 'bg-red-500/20 text-red-400 border-red-500/30';
      case 'completed':
        return 'bg-blue-500/20 text-blue-400 border-blue-500/30';
      case 'cancelled':
        return 'bg-orange-500/20 text-orange-400 border-orange-500/30';
      default:
        return 'bg-gray-500/20 text-gray-400 border-gray-500/30';
    }
  };

  const getStatusBadge = (status) => {
    const icons = {
      pending: '⏳',
      accepted: '✓',
      rejected: '✗',
      completed: '🎉',
      cancelled: '❌',
    };
    return icons[status] || '•';
  };

  const formatDate = (dateStr) => {
    return new Date(dateStr).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  return (
    <motion.div
      variants={pageVariants}
      initial="initial"
      animate="animate"
      exit="exit"
      className="p-8"
    >
      <motion.div
        variants={cardVariants}
        className="relative"
      >
        <h1 className="text-4xl font-black bg-gradient-to-r from-cyan-400 to-blue-500 bg-clip-text text-transparent mb-2">
          My Appointments
        </h1>
        <div className="h-1 w-48 bg-gradient-to-r from-cyan-400 to-blue-500 rounded-full mb-8"></div>

        {/* Error Message */}
        {error && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="p-4 bg-red-500/20 border border-red-500/50 rounded-lg text-red-400 font-semibold mb-6"
          >
            ✗ {error}
          </motion.div>
        )}

        {/* Loading State */}
        {loading ? (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="flex justify-center items-center py-20"
          >
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ duration: 2, repeat: Infinity, ease: 'linear' }}
              className="w-12 h-12 rounded-full border-4 border-cyan-500/20 border-t-cyan-500"
              style={{
                boxShadow: '0 0 20px rgba(34, 211, 238, 0.6)',
              }}
            />
          </motion.div>
        ) : appointments.length === 0 ? (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="relative bg-gradient-to-br from-gray-900/60 to-gray-950/60 backdrop-blur-xl border border-cyan-500/10 rounded-2xl shadow-2xl p-12 text-center"
            style={{
              boxShadow: '0 0 50px rgba(34, 211, 238, 0.05), inset 0 1px 0 rgba(34, 211, 238, 0.1)',
            }}
          >
            <div className="absolute -inset-1 bg-gradient-to-r from-cyan-600/20 via-blue-600/20 to-purple-600/20 rounded-2xl opacity-0 hover:opacity-75 blur-2xl transition-all duration-500 ease-in-out pointer-events-none"></div>
            <div className="relative">
              <div className="text-6xl mb-4">📋</div>
              <p className="text-gray-200 text-lg">No appointments scheduled yet.</p>
              <p className="text-gray-300 text-sm mt-2">Book your first appointment to get started!</p>
            </div>
          </motion.div>
        ) : (
          <motion.div
            variants={cardVariants}
            className="relative bg-gradient-to-br from-gray-900/60 to-gray-950/60 backdrop-blur-xl border border-cyan-500/10 hover:border-cyan-500/30 rounded-2xl shadow-2xl overflow-hidden transition-all duration-300 ease-in-out"
            style={{
              boxShadow: '0 0 50px rgba(34, 211, 238, 0.05), inset 0 1px 0 rgba(34, 211, 238, 0.1)',
            }}
          >
            <div className="absolute -inset-1 bg-gradient-to-r from-cyan-600/20 via-blue-600/20 to-purple-600/20 rounded-2xl opacity-0 hover:opacity-75 blur-2xl transition-all duration-500 ease-in-out pointer-events-none"></div>

            <div className="relative overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="bg-gradient-to-r from-blue-900/20 via-purple-900/20 to-pink-900/20 border-b border-cyan-500/10 transition-all duration-300 ease-in-out">
                    <th className="px-8 py-4 text-left text-cyan-400 font-black text-xs uppercase tracking-widest">
                      Doctor
                    </th>
                    <th className="px-8 py-4 text-left text-cyan-400 font-black text-xs uppercase tracking-widest">
                      Specialization
                    </th>
                    <th className="px-8 py-4 text-left text-cyan-400 font-black text-xs uppercase tracking-widest">
                      Date
                    </th>
                    <th className="px-8 py-4 text-left text-cyan-400 font-black text-xs uppercase tracking-widest">
                      Time
                    </th>
                    <th className="px-8 py-4 text-left text-cyan-400 font-black text-xs uppercase tracking-widest">
                      Status
                    </th>
                    <th className="px-8 py-4 text-left text-cyan-400 font-black text-xs uppercase tracking-widest">
                      Notes
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {appointments.map((apt, idx) => (
                    <motion.tr
                      key={apt.id}
                      custom={idx}
                      variants={tableRowVariants}
                      initial="hidden"
                      animate="visible"
                      whileHover={{
                        scale: 1.01,
                        transition: { duration: 0.2 },
                      }}
                      className="relative border-b border-cyan-500/10 hover:border-cyan-500/30 transition-all duration-300 ease-in-out group hover:bg-gradient-to-r hover:from-cyan-500/5 hover:via-purple-500/5 hover:to-pink-500/5"
                    >
                      <td className="px-8 py-4 text-white font-semibold transition-colors duration-300 ease-in-out">
                        {apt.doctor_name || 'N/A'}
                      </td>
                      <td className="px-8 py-4 text-gray-100 transition-colors duration-300 ease-in-out text-sm">
                        {apt.doctor_specialization || 'General'}
                      </td>
                      <td className="px-8 py-4 text-gray-100 font-mono transition-colors duration-300 ease-in-out">
                        {formatDate(apt.date)}
                      </td>
                      <td className="px-8 py-4 text-cyan-400 font-mono font-semibold transition-colors duration-300 ease-in-out">
                        {apt.time}
                      </td>
                      <td className="px-8 py-4 transition-colors duration-300 ease-in-out">
                        <span className={`px-3 py-1 rounded-full text-xs font-bold border ${getStatusColor(apt.status)}`}>
                          {getStatusBadge(apt.status)} {apt.status}
                        </span>
                      </td>
                      <td className="px-8 py-4 text-gray-100 text-sm transition-colors duration-300 ease-in-out max-w-xs truncate">
                        {apt.notes || apt.diagnosis || '—'}
                      </td>
                    </motion.tr>
                  ))}
                </tbody>
              </table>
            </div>
          </motion.div>
        )}
      </motion.div>
    </motion.div>
  );
};

export default MyAppointments;
