import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import axios from 'axios';

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

  useEffect(() => {
    fetchDoctors();
  }, []);

  const fetchDoctors = async () => {
    try {
      const response = await axios.get(`${process.env.REACT_APP_API_URL}/api/doctors/`);
      setDoctors(response.data);
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
      const response = await axios.get(`${process.env.REACT_APP_API_URL}/api/available-slots/`, {
        params: {
          doctor_id: doctorId,
          date: date,
        },
      });

      setAvailableSlots(response.data.slots || []);
      if (!response.data.slots || response.data.slots.length === 0) {
        setError('No available slots for this doctor on this date');
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
      const response = await axios.post(
        `${process.env.REACT_APP_API_URL}/api/book-appointment/`,
        {
          doctor_id: parseInt(selectedDoctor),
          date: selectedDate,
          time: selectedTime,
          notes: notes,
        },
        {
          headers: {
            'Authorization': `Token ${token}`,
            'Content-Type': 'application/json',
          },
        }
      );

      setMessage('Appointment booked successfully!');
      setSelectedDoctor('');
      setSelectedDate('');
      setSelectedTime('');
      setNotes('');
      setAvailableSlots([]);
      
      if (onBookSuccess) {
        setTimeout(() => {
          onBookSuccess();
        }, 1000);
      }
    } catch (err) {
      if (err.response?.data?.non_field_errors) {
        setError('Slot is no longer available');
      } else if (err.response?.data?.doctor_id) {
        setError(err.response.data.doctor_id[0]);
      } else {
        setError('Failed to book appointment');
      }
      console.error('Error booking appointment:', err);
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
        variants={cardVariants}
        className="relative bg-gradient-to-br from-gray-900/60 to-gray-950/60 backdrop-blur-xl border border-cyan-500/10 hover:border-cyan-500/30 rounded-2xl shadow-2xl p-8 transition-all duration-300 ease-in-out"
        style={{
          boxShadow: '0 0 50px rgba(34, 211, 238, 0.05), inset 0 1px 0 rgba(34, 211, 238, 0.1)',
        }}
      >
        <div className="absolute -inset-1 bg-gradient-to-r from-cyan-600/20 via-blue-600/20 to-purple-600/20 rounded-2xl opacity-0 hover:opacity-75 blur-2xl transition-all duration-500 ease-in-out pointer-events-none"></div>

        <div className="relative">
          <h1 className="text-4xl font-black bg-gradient-to-r from-cyan-400 to-blue-500 bg-clip-text text-transparent mb-2">
            Book Appointment
          </h1>
          <div className="h-1 w-32 bg-gradient-to-r from-cyan-400 to-blue-500 rounded-full mb-8"></div>

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
                className="w-full px-4 py-3 bg-gray-800/50 border border-cyan-500/20 rounded-lg text-gray-200 focus:outline-none focus:border-cyan-400/50 focus:ring-2 focus:ring-cyan-400/20 transition-all duration-300 ease-in-out"
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
                className="w-full px-4 py-3 bg-gray-800/50 border border-cyan-500/20 rounded-lg text-gray-200 focus:outline-none focus:border-cyan-400/50 focus:ring-2 focus:ring-cyan-400/20 transition-all duration-300 ease-in-out disabled:opacity-50 disabled:cursor-not-allowed"
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
                        key={slot}
                        type="button"
                        onClick={() => setSelectedTime(slot)}
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        className={`px-3 py-2 rounded-lg font-semibold transition-all duration-300 text-sm ${
                          selectedTime === slot
                            ? 'bg-cyan-500 text-black'
                            : 'bg-gray-700 text-gray-200 hover:bg-gray-600'
                        }`}
                      >
                        {slot}
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
                className="w-full px-4 py-3 bg-gray-800/50 border border-cyan-500/20 rounded-lg text-gray-200 placeholder-gray-500 focus:outline-none focus:border-cyan-400/50 focus:ring-2 focus:ring-cyan-400/20 transition-all duration-300 ease-in-out"
              />
            </motion.div>

            {/* Messages */}
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

            {/* Submit Button */}
            <motion.button
              type="submit"
              disabled={loading || !selectedTime}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              className="w-full px-8 py-4 bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-black font-black rounded-lg transition-all duration-300 ease-in-out disabled:opacity-50 disabled:cursor-not-allowed uppercase tracking-widest"
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
        </div>
      </motion.div>
    </motion.div>
  );
};

export default BookAppointment;
