import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { createDoctorSchedule, resolveDoctorIdByAuthUid } from './firebase.service';

const DoctorSetSchedule = ({ onScheduleSet }) => {
  const [date, setDate] = useState('');
  const [startTime, setStartTime] = useState('09:00');
  const [endTime, setEndTime] = useState('17:00');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const authDoctorId = localStorage.getItem('userId');

  const pageVariants = {
    initial: { opacity: 0, y: 20 },
    animate: { opacity: 1, y: 0 },
    exit: { opacity: 0, y: -20 },
  };

  const cardVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.6 } },
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
      const doctorId = await resolveDoctorIdByAuthUid(authDoctorId);
      if (!doctorId) {
        setError('Doctor profile not found. Please contact admin.');
        setLoading(false);
        return;
      }

      console.log('[SCHEDULE] Submitting schedule:', { doctorId, date, startTime, endTime });

      const result = await createDoctorSchedule(doctorId, {
        date,
        startTime,
        endTime,
      });

      if (result.success) {
        setMessage('Schedule set successfully!');
        setDate('');
        setStartTime('09:00');
        setEndTime('17:00');

        if (onScheduleSet) {
          setTimeout(() => {
            onScheduleSet();
          }, 1000);
        }
      } else {
        setError(result.error || 'Failed to set schedule');
        console.error('[SCHEDULE_ERROR]:', result.error);
      }
    } catch (err) {
      setError('Failed to set schedule');
      console.error('Error setting schedule:', err);
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
      className="w-full min-h-screen bg-gradient-to-b from-black to-gray-950 p-6 flex items-center justify-center"
    >
      <motion.div
        variants={cardVariants}
        initial="hidden"
        animate="visible"
        className="w-full max-w-md bg-gray-900 rounded-2xl p-8 border border-gray-800"
      >
        <h2 className="text-3xl font-bold text-white mb-6 text-center">
          Set Your Schedule
        </h2>

        <form onSubmit={handleSubmit} className="space-y-4">
          {message && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="p-4 bg-green-500/20 border border-green-500 rounded-lg text-green-400 text-sm"
            >
              {message}
            </motion.div>
          )}

          {error && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="p-4 bg-red-500/20 border border-red-500 rounded-lg text-red-400 text-sm"
            >
              {error}
            </motion.div>
          )}

          <div>
            <label className="block text-gray-300 text-sm font-medium mb-2">
              Date
            </label>
            <input
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              className="w-full px-4 py-3 rounded-lg bg-gray-800 border border-gray-700 text-white focus:outline-none focus:border-cyan-500 transition"
              min={new Date().toISOString().split('T')[0]}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-gray-300 text-sm font-medium mb-2">
                Start Time
              </label>
              <input
                type="time"
                value={startTime}
                onChange={(e) => setStartTime(e.target.value)}
                className="w-full px-4 py-3 rounded-lg bg-gray-800 border border-gray-700 text-white focus:outline-none focus:border-cyan-500 transition"
              />
            </div>

            <div>
              <label className="block text-gray-300 text-sm font-medium mb-2">
                End Time
              </label>
              <input
                type="time"
                value={endTime}
                onChange={(e) => setEndTime(e.target.value)}
                className="w-full px-4 py-3 rounded-lg bg-gray-800 border border-gray-700 text-white focus:outline-none focus:border-cyan-500 transition"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full mt-6 px-4 py-3 bg-gradient-to-r from-cyan-500 to-blue-500 text-white font-semibold rounded-lg hover:from-cyan-600 hover:to-blue-600 transition disabled:opacity-50"
          >
            {loading ? 'Setting Schedule...' : 'Set Schedule'}
          </button>
        </form>
      </motion.div>
    </motion.div>
  );
};

export default DoctorSetSchedule;
