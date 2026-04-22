import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { getAllDoctors, getDoctorAvailableSlots, createAppointment, completeSetup } from './firebase.service';

const BookAppointment = ({ onBookSuccess }) => {
  const [doctors, setDoctors] = useState([]);
  const [selectedDoctor, setSelectedDoctor] = useState('');
  const [selectedDate, setSelectedDate] = useState('');
  const [selectedTime, setSelectedTime] = useState('');
  const [availableSlots, setAvailableSlots] = useState([]);
  const [loadingSlots, setLoadingSlots] = useState(false);
  const [notes, setNotes] = useState('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [setupLoading, setSetupLoading] = useState(false);
  const patientId = localStorage.getItem('userId');

  const pageVariants = {
    initial: { opacity: 0, y: 20 },
    animate: { opacity: 1, y: 0 },
    exit: { opacity: 0, y: -20 },
  };

  const cardVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.6 } },
  };

  useEffect(() => {
    fetchDoctors();
  }, []);

  const fetchDoctors = async () => {
    try {
      console.log('[APPOINTMENT] Fetching doctors list...');
      const doctorsList = await getAllDoctors();
      setDoctors(doctorsList);
      console.log('[APPOINTMENT] ✓ Doctors fetched:', doctorsList.length);
    } catch (err) {
      console.error('Error fetching doctors:', err);
      setError('Failed to fetch doctors');
    }
  };

  const fetchAvailableSlots = async (doctorId, date) => {
    if (!doctorId || !date) return;

    setLoadingSlots(true);
    setAvailableSlots([]);
    setSelectedTime('');

    try {
      console.log('[APPOINTMENT] Fetching available slots for doctor:', doctorId, 'on date:', date);
      const slots = await getDoctorAvailableSlots(doctorId, date);
      
      if (slots && slots.length > 0) {
        setAvailableSlots(slots);
        console.log('[APPOINTMENT] ✓ Slots found:', slots.length);
      } else {
        setError('No available slots for this doctor on this date');
        console.log('[APPOINTMENT] No slots available');
        setAvailableSlots([]);
      }
    } catch (err) {
      console.error('Error fetching slots:', err);
      setError('Failed to fetch available slots');
      setAvailableSlots([]);
    } finally {
      setLoadingSlots(false);
    }
  };

  const handleDoctorChange = (e) => {
    setSelectedDoctor(e.target.value);
    setSelectedDate('');
    setAvailableSlots([]);
    setSelectedTime('');
    setError('');
  };

  const handleDateChange = (e) => {
    const date = e.target.value;
    setSelectedDate(date);
    setSelectedTime('');
    if (selectedDoctor && date) {
      fetchAvailableSlots(selectedDoctor, date);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setMessage('');

    if (!selectedDoctor || !selectedDate || !selectedTime) {
      setError('Please fill all fields');
      return;
    }

    setLoading(true);
    try {
      console.log('[APPOINTMENT] Booking appointment...');
      
      const result = await createAppointment({
        patientId,
        doctorId: selectedDoctor,
        date: selectedDate,
        time: selectedTime,
        notes: notes,
        status: 'pending'
      });

      if (result.success) {
        setMessage('Appointment booked successfully!');
        setSelectedDoctor('');
        setSelectedDate('');
        setSelectedTime('');
        setNotes('');
        console.log('[APPOINTMENT] ✓ Appointment booked:', result.id);

        if (onBookSuccess) {
          setTimeout(() => onBookSuccess(), 1500);
        }
      } else {
        setError(result.error || 'Failed to book appointment');
        console.error('[APPOINTMENT_ERROR]:', result.error);
      }
    } catch (err) {
      setError('Failed to book appointment');
      console.error('Error booking appointment:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleSetupDemo = async () => {
    setSetupLoading(true);
    setError('');
    setMessage('');
    
    try {
      console.log('[SETUP] Starting complete setup via BookAppointment...');
      const result = await completeSetup();
      
      console.log('[SETUP] Result:', result);
      
      if (result.success) {
        setMessage(`✅ Setup complete! Created ${result.doctorCount} doctors and ${result.slotsCreated} appointment slots. Refreshing...`);
        
        // Wait a bit then refresh doctors and page
        setTimeout(() => {
          window.location.reload();
        }, 2000);
      } else {
        setError('❌ Setup failed: ' + (result.error || 'Unknown error'));
        console.error('[SETUP] Failed:', result);
      }
    } catch (err) {
      console.error('[SETUP] Error:', err);
      setError('❌ Setup error: ' + err.message);
    } finally {
      setSetupLoading(false);
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
        variants={cardVariants}
        className="bg-gray-900/60 border border-cyan-500/10 rounded-2xl p-8 transition-all duration-300 backdrop-blur-xl"
      >
        <div className="flex justify-between items-start mb-8">
          <div>
            <h1 className="text-4xl font-black text-white mb-2">
              Book Appointment
            </h1>
            <div className="h-1 w-32 bg-gradient-to-r from-cyan-500 to-cyan-600 rounded-full"></div>
          </div>
          
          {/* Setup button - Always visible */}
          <motion.button
            onClick={handleSetupDemo}
            disabled={setupLoading}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="px-4 py-2 bg-yellow-600 hover:bg-yellow-700 disabled:opacity-50 text-white font-bold rounded-lg transition-all text-sm"
          >
            {setupLoading ? '⚙️ Setting...' : '🚀 Setup Demo'}
          </motion.button>
        </div>

        {/* Setup Demo Data Prompt - Only for first time */}
        {doctors.length === 0 && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-8 p-6 bg-yellow-500/20 border border-yellow-500/40 rounded-2xl"
          >
            <h2 className="text-xl font-bold text-yellow-400 mb-3">⚡ First Time Setup Required</h2>
            <p className="text-yellow-100 mb-4">
              No doctors found. Please click the Setup Demo button to load demo data (doctors, schedules, and medicines).
            </p>
          </motion.div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
            {/* Doctor Selection */}
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.1 }}
            >
              <label className="block text-cyan-400 font-semibold mb-3 text-sm uppercase tracking-widest">
                Select Doctor
              </label>
              <select
                value={selectedDoctor}
                onChange={handleDoctorChange}
                className="w-full px-4 py-3 bg-gray-800/50 border border-cyan-500/20 rounded-lg text-white focus:outline-none focus:border-cyan-500 focus:ring-2 focus:ring-cyan-500/20 transition-all duration-300"
              >
                <option value="">-- Choose a doctor --</option>
                {doctors.map((doc) => (
                  <option key={doc.id} value={doc.id}>
                    {doc.name} - {doc.specialization}
                  </option>
                ))}
              </select>
            </motion.div>

            {/* Date Selection */}
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.2 }}
            >
              <label className="block text-cyan-400 font-semibold mb-3 text-sm uppercase tracking-widest">
                Select Date
              </label>
              <input
                type="date"
                value={selectedDate}
                onChange={handleDateChange}
                disabled={!selectedDoctor}
                min={new Date().toISOString().split('T')[0]}
                className="w-full px-4 py-3 bg-gray-800/50 border border-cyan-500/20 rounded-lg text-white focus:outline-none focus:border-cyan-500 focus:ring-2 focus:ring-cyan-500/20 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
              />
            </motion.div>

            {/* Available Slots */}
            {selectedDate && (
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.3 }}
              >
                <label className="block text-cyan-400 font-semibold mb-3 text-sm uppercase tracking-widest">
                  Available Time Slots
                </label>
                {loadingSlots ? (
                  <div className="flex justify-center py-4">
                    <motion.div
                      animate={{ rotate: 360 }}
                      transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
                      className="text-cyan-400"
                    >
                      ⚙️
                    </motion.div>
                  </div>
                ) : availableSlots.length > 0 ? (
                  <div className="grid grid-cols-3 gap-2">
                    {availableSlots.map((slot) => (
                      <motion.button
                        key={slot.id || slot.startTime}
                        type="button"
                        onClick={() => setSelectedTime(slot.startTime)}
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        className={`px-3 py-2 rounded-lg font-semibold transition-all duration-300 text-sm ${
                          selectedTime === slot.startTime
                            ? 'bg-cyan-600 text-white'
                            : 'bg-gray-800/50 text-gray-300 hover:bg-gray-700/50 border border-cyan-500/20'
                        }`}
                      >
                        {slot.startTime} - {slot.endTime}
                      </motion.button>
                    ))}
                  </div>
                ) : (
                  <p className="text-gray-400 text-sm">No available slots for this date</p>
                )}
              </motion.div>
            )}

            {/* Notes */}
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.4 }}
            >
              <label className="block text-cyan-400 font-semibold mb-3 text-sm uppercase tracking-widest">
                Notes (Optional)
              </label>
              <textarea
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Describe your symptoms or reason for visit..."
                rows="4"
                className="w-full px-4 py-3 bg-gray-800/50 border border-cyan-500/20 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-cyan-500 focus:ring-2 focus:ring-cyan-500/20 transition-all duration-300"
              />
            </motion.div>

            {/* Messages */}
            {message && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className="p-4 bg-green-500/20 border border-green-500/30 rounded-lg text-green-400 font-semibold"
              >
                ✓ {message}
              </motion.div>
            )}

            {error && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className="p-4 bg-red-500/20 border border-red-500/30 rounded-lg text-red-400 font-semibold"
              >
                ✗ {error}
              </motion.div>
            )}

            {/* Submit Button */}
            <motion.button
              type="submit"
              disabled={loading || !selectedTime}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              className="w-full px-8 py-4 bg-cyan-600 hover:bg-cyan-700 text-white font-black rounded-lg transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed uppercase tracking-widest"
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
                'Book Appointment'
              )}
            </motion.button>
          </form>
      </motion.div>
    </motion.div>
  );
};

export default BookAppointment;
