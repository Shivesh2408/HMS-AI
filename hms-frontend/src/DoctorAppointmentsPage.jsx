import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { subscribeDoctorAppointments, updateAppointment } from './firebase.service';

const DoctorAppointmentsPage = () => {
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const doctorId = localStorage.getItem('userId');

  const pageVariants = {
    initial: { opacity: 0, y: 20 },
    animate: { opacity: 1, y: 0 },
    exit: { opacity: 0, y: -20 },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.4 } },
    exit: { opacity: 0, y: -20 },
  };

  useEffect(() => {
    let unsubscribe = () => {};

    const startSubscription = async () => {
      setLoading(true);
      setError('');

      try {
        console.log('[DOCTOR_APPOINTMENTS] Subscribing appointments for doctor auth ID:', doctorId);
        unsubscribe = await subscribeDoctorAppointments(
          doctorId,
          (appointmentsList) => {
            setAppointments(appointmentsList || []);
            setLoading(false);
            console.log('[DOCTOR_APPOINTMENTS] ✓ Realtime appointments:', (appointmentsList || []).length);
          },
          (subscriptionError) => {
            setError('Failed to fetch appointments');
            setLoading(false);
            console.error('[DOCTOR_APPOINTMENTS] Subscription error:', subscriptionError);
          }
        );
      } catch (err) {
        setError('Failed to fetch appointments');
        setLoading(false);
        console.error('[DOCTOR_APPOINTMENTS] Error:', err);
      }
    };

    if (doctorId) {
      startSubscription();
    } else {
      setLoading(false);
      setError('Doctor ID not found. Please login again.');
    }

    return () => {
      if (typeof unsubscribe === 'function') {
        unsubscribe();
      }
    };
  }, [doctorId]);

  const handleStatusUpdate = async (appointmentId, newStatus) => {
    try {
      setMessage('');
      setError('');

      console.log('[DOCTOR_APPOINTMENTS] Updating appointment:', appointmentId, 'to:', newStatus);
      const success = await updateAppointment(appointmentId, { status: newStatus });

      if (success) {
        setMessage(`Appointment ${newStatus} successfully!`);
        
        // Update the appointment in the list
        setAppointments(prev =>
          prev.map(apt =>
            apt.id === appointmentId ? { ...apt, status: newStatus } : apt
          )
        );

        setTimeout(() => setMessage(''), 3000);
      } else {
        setError('Failed to update appointment');
      }
    } catch (err) {
      setError('Failed to update appointment');
      console.error('Error:', err);
    }
  };

  const filteredAppointments = filterStatus === 'all'
    ? appointments
    : appointments.filter(apt => apt.status === filterStatus);

  const getStatusColor = (status) => {
    switch (status) {
      case 'pending':
        return 'bg-yellow-500/20 border-yellow-500/50 text-yellow-400';
      case 'approved':
        return 'bg-green-500/20 border-green-500/50 text-green-400';
      case 'rejected':
        return 'bg-red-500/20 border-red-500/50 text-red-400';
      case 'completed':
        return 'bg-blue-500/20 border-blue-500/50 text-blue-400';
      default:
        return 'bg-gray-500/20 border-gray-500/50 text-gray-400';
    }
  };

  const getStatusEmoji = (status) => {
    switch (status) {
      case 'pending':
        return '⏳';
      case 'approved':
        return '✅';
      case 'rejected':
        return '❌';
      case 'completed':
        return '🎉';
      default:
        return '❓';
    }
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
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-8"
      >
        <h1 className="text-4xl font-black bg-gradient-to-r from-purple-400 to-pink-500 bg-clip-text text-transparent mb-4">
          Patient Appointments
        </h1>
        <div className="h-1 w-32 bg-gradient-to-r from-purple-400 to-pink-500 rounded-full mb-6"></div>

        {message && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="p-4 bg-green-500/20 border border-green-500/50 rounded-lg text-green-400 font-semibold mb-6"
          >
            ✓ {message}
          </motion.div>
        )}

        {error && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="p-4 bg-red-500/20 border border-red-500/50 rounded-lg text-red-400 font-semibold mb-6"
          >
            ✗ {error}
          </motion.div>
        )}

        {/* Filter Buttons */}
        <div className="flex gap-2 flex-wrap">
          {['all', 'pending', 'approved', 'rejected', 'completed'].map((status) => (
            <motion.button
              key={status}
              onClick={() => setFilterStatus(status)}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className={`px-4 py-2 rounded-lg font-semibold transition-all capitalize ${
                filterStatus === status
                  ? 'bg-gradient-to-r from-purple-500 to-pink-600 text-white'
                  : 'bg-gray-800 text-gray-300 hover:bg-gray-700'
              }`}
            >
              {status}
            </motion.button>
          ))}
        </div>
      </motion.div>

      {loading ? (
        <div className="flex justify-center items-center py-24">
          <motion.div animate={{ rotate: 360 }} transition={{ duration: 1, repeat: Infinity }} className="text-4xl">
            ⚙️
          </motion.div>
        </div>
      ) : filteredAppointments.length === 0 ? (
        <motion.div
          variants={itemVariants}
          className="text-center py-24 bg-gray-900/30 rounded-2xl border border-purple-500/10"
        >
          <p className="text-2xl text-gray-400">No appointments found</p>
        </motion.div>
      ) : (
        <div className="grid gap-6">
          <AnimatePresence mode="popLayout">
            {filteredAppointments.map((appointment, idx) => (
              <motion.div
                key={appointment.id}
                variants={itemVariants}
                initial="hidden"
                animate="visible"
                exit="exit"
                transition={{ delay: idx * 0.1 }}
                className="relative bg-gradient-to-br from-gray-900/60 to-gray-950/60 backdrop-blur-xl border border-purple-500/20 rounded-2xl shadow-2xl overflow-hidden"
                style={{
                  boxShadow: '0 0 30px rgba(168, 85, 247, 0.05), inset 0 1px 0 rgba(168, 85, 247, 0.1)',
                }}
              >
                <div className="p-6">
                  <div className="flex justify-between items-start mb-4">
                    <div>
                      <h3 className="text-2xl font-black text-white mb-2">{appointment.patient_name}</h3>
                      <p className="text-purple-400 font-semibold">{appointment.doctor_specialization}</p>
                    </div>
                    <motion.span
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      className={`px-4 py-2 rounded-lg border font-bold text-lg ${getStatusColor(appointment.status)}`}
                    >
                      {getStatusEmoji(appointment.status)} {appointment.status}
                    </motion.span>
                  </div>

                  <div className="grid grid-cols-3 gap-4 mb-6 p-4 bg-purple-500/10 rounded-lg border border-purple-500/20">
                    <div>
                      <p className="text-purple-400 text-sm font-semibold">Date</p>
                      <p className="text-white font-bold text-lg">{appointment.date}</p>
                    </div>
                    <div>
                      <p className="text-purple-400 text-sm font-semibold">Time</p>
                      <p className="text-white font-bold text-lg">{appointment.time}</p>
                    </div>
                    <div>
                      <p className="text-purple-400 text-sm font-semibold">Booked</p>
                      <p className="text-white font-bold text-lg">
                        {appointment.created_at?.toDate
                          ? appointment.created_at.toDate().toLocaleDateString()
                          : appointment.createdAt?.toDate
                            ? appointment.createdAt.toDate().toLocaleDateString()
                            : appointment.created_at || appointment.createdAt
                              ? new Date(appointment.created_at || appointment.createdAt).toLocaleDateString()
                              : '—'}
                      </p>
                    </div>
                  </div>

                  {appointment.status === 'pending' && (
                    <div className="flex gap-3">
                      <motion.button
                        onClick={() => handleStatusUpdate(appointment.id, 'approved')}
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        className="flex-1 px-4 py-3 bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-400 hover:to-emerald-500 text-white font-bold rounded-lg transition-all"
                      >
                        ✓ Approve
                      </motion.button>
                      <motion.button
                        onClick={() => handleStatusUpdate(appointment.id, 'rejected')}
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        className="flex-1 px-4 py-3 bg-gradient-to-r from-red-500 to-rose-600 hover:from-red-400 hover:to-rose-500 text-white font-bold rounded-lg transition-all"
                      >
                        ✗ Reject
                      </motion.button>
                    </div>
                  )}
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      )}
    </motion.div>
  );
};

export default DoctorAppointmentsPage;
