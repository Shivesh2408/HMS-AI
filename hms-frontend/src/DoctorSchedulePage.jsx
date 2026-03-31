import React, { useState } from 'react';
import { motion } from 'framer-motion';
import axios from 'axios';

const DoctorSchedulePage = ({ onScheduleAdded }) => {
  const [date, setDate] = useState('');
  const [startTime, setStartTime] = useState('09:00');
  const [endTime, setEndTime] = useState('17:00');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const token = localStorage.getItem('authToken');

  const pageVariants = {
    initial: { opacity: 0, y: 20 },
    animate: { opacity: 1, y: 0 },
    exit: { opacity: 0, y: -20 },
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setMessage('');

    if (!date || !startTime || !endTime) {
      setError('Please fill all fields');
      return;
    }

    if (startTime >= endTime) {
      setError('Start time must be before end time');
      return;
    }

    setLoading(true);

    try {
      const response = await axios.post(
        `${process.env.REACT_APP_API_URL}/api/add-schedule/`,
        {
          date,
          start_time: startTime,
          end_time: endTime,
        },
        {
          headers: { 'Authorization': `Token ${token}` },
        }
      );

      setMessage('Schedule added successfully!');
      setDate('');
      setStartTime('09:00');
      setEndTime('17:00');

      if (onScheduleAdded) {
        setTimeout(() => onScheduleAdded(), 1000);
      }
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to add schedule');
      console.error('Error:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <motion.div
      variants={pageVariants}
      initial="initial"
      animate="animate"
      exit="exit"
      className="p-8 max-w-2xl mx-auto"
    >
      <motion.div
        className="relative bg-gradient-to-br from-gray-900/60 to-gray-950/60 backdrop-blur-xl border border-purple-500/20 rounded-2xl shadow-2xl p-8"
        style={{
          boxShadow: '0 0 50px rgba(168, 85, 247, 0.1), inset 0 1px 0 rgba(168, 85, 247, 0.1)',
        }}
      >
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <h1 className="text-4xl font-black bg-gradient-to-r from-purple-400 to-pink-500 bg-clip-text text-transparent mb-2">
            Set Your Schedule
          </h1>
          <div className="h-1 w-32 bg-gradient-to-r from-purple-400 to-pink-500 rounded-full"></div>
        </motion.div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {message && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className="p-4 bg-green-500/20 border border-green-500/50 rounded-lg text-green-400 font-semibold"
            >
              ✓ {message}
            </motion.div>
          )}

          {error && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className="p-4 bg-red-500/20 border border-red-500/50 rounded-lg text-red-400 font-semibold"
            >
              ✗ {error}
            </motion.div>
          )}

          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.1 }}
          >
            <label className="block text-purple-400 font-semibold mb-2 text-sm uppercase">Select Date</label>
            <input
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              min={new Date().toISOString().split('T')[0]}
              className="w-full px-4 py-3 bg-gray-800/50 border border-purple-500/20 rounded-lg text-gray-200 focus:outline-none focus:border-purple-400/50 focus:ring-2 focus:ring-purple-400/20"
            />
          </motion.div>

          <div className="grid grid-cols-2 gap-4">
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.2 }}
            >
              <label className="block text-purple-400 font-semibold mb-2 text-sm uppercase">Start Time</label>
              <input
                type="time"
                value={startTime}
                onChange={(e) => setStartTime(e.target.value)}
                className="w-full px-4 py-3 bg-gray-800/50 border border-purple-500/20 rounded-lg text-gray-200 focus:outline-none focus:border-purple-400/50 focus:ring-2 focus:ring-purple-400/20"
              />
            </motion.div>

            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.2 }}
            >
              <label className="block text-purple-400 font-semibold mb-2 text-sm uppercase">End Time</label>
              <input
                type="time"
                value={endTime}
                onChange={(e) => setEndTime(e.target.value)}
                className="w-full px-4 py-3 bg-gray-800/50 border border-purple-500/20 rounded-lg text-gray-200 focus:outline-none focus:border-purple-400/50 focus:ring-2 focus:ring-purple-400/20"
              />
            </motion.div>
          </div>

          <motion.button
            type="submit"
            disabled={loading}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            className="w-full px-8 py-4 mt-6 bg-gradient-to-r from-purple-500 to-pink-600 hover:from-purple-400 hover:to-pink-500 text-white font-black rounded-lg transition-all duration-300 ease-in-out disabled:opacity-50 uppercase tracking-widest"
          >
            {loading ? (
              <motion.span
                animate={{ rotate: 360 }}
                transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
                className="inline-block"
              >
                ⚙️
              </motion.span>
            ) : (
              'Set Schedule'
            )}
          </motion.button>
        </form>
      </motion.div>
    </motion.div>
  );
};

export default DoctorSchedulePage;
