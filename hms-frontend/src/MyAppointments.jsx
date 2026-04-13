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
        <h1 className="text-4xl font-black text-white mb-2">
          My Appointments
        </h1>
        <div className="h-1 w-48 bg-gradient-to-r from-cyan-500 to-blue-500 rounded-full mb-8"></div>

        {/* Error Message */}
        {error && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="p-4 bg-red-500/20 border border-red-500/30 rounded-lg text-red-400 font-semibold mb-6"
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
            />
          </motion.div>
        ) : appointments.length === 0 ? (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-gray-900/60 border border-cyan-500/10 rounded-2xl p-12 text-center backdrop-blur-xl"
          >
            <div className="text-6xl mb-4">📋</div>
            <p className="text-white text-lg font-semibold">No appointments scheduled yet.</p>
            <p className="text-gray-400 text-sm mt-2">Book your first appointment to get started!</p>
          </motion.div>
        ) : (
          <motion.div
            variants={cardVariants}
            className="bg-gray-900/60 border border-cyan-500/10 rounded-2xl overflow-hidden backdrop-blur-xl"
          >
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="bg-gray-800/50 border-b border-cyan-500/10">
                    <th className="px-8 py-4 text-left text-cyan-400 font-bold text-xs uppercase tracking-widest">
                      Doctor
                    </th>
                    <th className="px-8 py-4 text-left text-cyan-400 font-bold text-xs uppercase tracking-widest">
                      Specialization
                    </th>
                    <th className="px-8 py-4 text-left text-cyan-400 font-bold text-xs uppercase tracking-widest">
                      Date
                    </th>
                    <th className="px-8 py-4 text-left text-cyan-400 font-bold text-xs uppercase tracking-widest">
                      Time
                    </th>
                    <th className="px-8 py-4 text-left text-cyan-400 font-bold text-xs uppercase tracking-widest">
                      Status
                    </th>
                    <th className="px-8 py-4 text-left text-cyan-400 font-bold text-xs uppercase tracking-widest">
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
                      className="border-b border-cyan-500/10 hover:bg-cyan-500/5 transition-colors duration-200"
                    >
                      <td className="px-8 py-4 text-white font-semibold">
                        {apt.doctor_name || 'N/A'}
                      </td>
                      <td className="px-8 py-4 text-gray-400 text-sm">
                        {apt.doctor_specialization || 'General'}
                      </td>
                      <td className="px-8 py-4 text-white font-mono">
                        {formatDate(apt.date)}
                      </td>
                      <td className="px-8 py-4 text-cyan-400 font-mono font-semibold">
                        {apt.time}
                      </td>
                      <td className="px-8 py-4">
                        <span className={`px-3 py-1 rounded-full text-xs font-bold border ${getStatusColor(apt.status)}`}>
                          {getStatusBadge(apt.status)} {apt.status}
                        </span>
                      </td>
                      <td className="px-8 py-4 text-gray-400 text-sm max-w-xs truncate">
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
