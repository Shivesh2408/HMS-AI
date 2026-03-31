import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import axios from 'axios';

const DoctorsList = () => {
  const [doctors, setDoctors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const pageVariants = {
    initial: { opacity: 0, y: 20 },
    animate: { opacity: 1, y: 0 },
    exit: { opacity: 0, y: -20 },
  };

  const cardVariants = {
    hidden: { opacity: 0, y: 30 },
    visible: (idx) => ({
      opacity: 1,
      y: 0,
      transition: { delay: idx * 0.1, duration: 0.5 },
    }),
  };

  useEffect(() => {
    fetchDoctors();
  }, []);

  const fetchDoctors = async () => {
    try {
      setLoading(true);
      const response = await axios.get(`${process.env.REACT_APP_API_URL}/api/doctors/`);
      setDoctors(response.data);
      setError('');
    } catch (err) {
      console.error('Error fetching doctors:', err);
      setError('Failed to fetch doctors');
    } finally {
      setLoading(false);
    }
  };

  const getSpecializationColor = (specialization) => {
    const colors = {
      'Cardiology': 'from-red-500 to-pink-600',
      'Dermatology': 'from-orange-500 to-yellow-600',
      'Neurology': 'from-purple-500 to-blue-600',
      'Pediatrics': 'from-green-500 to-emerald-600',
      'Orthopedics': 'from-yellow-500 to-orange-600',
      'Gynecology': 'from-pink-500 to-rose-600',
      'Ophthalmology': 'from-blue-500 to-cyan-600',
      'Pulmonology': 'from-teal-500 to-cyan-600',
      'General': 'from-gray-500 to-slate-600',
    };
    return colors[specialization] || 'from-cyan-500 to-blue-600';
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
        initial="hidden"
        animate="visible"
        custom={0}
        className="relative mb-8"
      >
        <h1 className="text-4xl font-black bg-gradient-to-r from-purple-400 to-pink-500 bg-clip-text text-transparent mb-2">
          Available Doctors
        </h1>
        <div className="h-1 w-48 bg-gradient-to-r from-purple-400 to-pink-500 rounded-full mb-8"></div>
      </motion.div>

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
            className="w-12 h-12 rounded-full border-4 border-purple-500/20 border-t-purple-500"
            style={{
              boxShadow: '0 0 20px rgba(168, 85, 247, 0.6)',
            }}
          />
        </motion.div>
      ) : doctors.length === 0 ? (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="relative bg-gradient-to-br from-gray-900/60 to-gray-950/60 backdrop-blur-xl border border-purple-500/10 rounded-2xl shadow-2xl p-12 text-center"
          style={{
            boxShadow: '0 0 50px rgba(168, 85, 247, 0.05), inset 0 1px 0 rgba(168, 85, 247, 0.1)',
          }}
        >
          <div className="text-6xl mb-4">👨‍⚕️</div>
          <p className="text-gray-400 text-lg">No doctors available.</p>
        </motion.div>
      ) : (
        <motion.div
          initial="hidden"
          animate="visible"
          variants={{
            visible: {
              transition: {
                staggerChildren: 0.1,
              },
            },
          }}
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
        >
          {doctors.map((doctor, idx) => (
            <motion.div
              key={doctor.id}
              custom={idx}
              variants={cardVariants}
              className="group relative cursor-pointer"
            >
              {/* Glow background */}
              <div className="absolute -inset-1 bg-gradient-to-r from-purple-600/20 via-pink-600/20 to-blue-600/20 rounded-2xl opacity-0 group-hover:opacity-100 blur-2xl transition-all duration-500 ease-in-out"></div>

              {/* Card */}
              <motion.div
                whileHover={{ y: -5, transition: { duration: 0.3 } }}
                className="relative bg-gradient-to-br from-gray-900/60 to-gray-950/60 backdrop-blur-xl border border-purple-500/10 group-hover:border-purple-500/30 rounded-2xl p-6 transition-all duration-300 ease-in-out overflow-hidden"
              >
                {/* Grid pattern */}
                <div className="absolute inset-0 opacity-5 group-hover:opacity-10 transition-opacity duration-300 ease-in-out">
                  <div className="absolute inset-0 bg-[radial-gradient(circle_at_1px_1px,white_1px,transparent_1px)] bg-[length:40px_40px]"></div>
                </div>

                <div className="relative">
                  {/* Header */}
                  <div className="flex items-center justify-between mb-4">
                    <motion.div
                      animate={{ scale: [1, 1.1, 1] }}
                      transition={{
                        duration: 2,
                        repeat: Infinity,
                        ease: 'easeInOut',
                      }}
                      className="text-5xl"
                    >
                      👨‍⚕️
                    </motion.div>
                    <span className="text-2xl">#{doctor.id}</span>
                  </div>

                  {/* Doctor Name */}
                  <h3 className="text-xl font-black mb-2">
                    <span className="bg-gradient-to-r from-purple-400 to-pink-500 bg-clip-text text-transparent">
                      Dr. {doctor.first_name || doctor.last_name || doctor.username}
                    </span>
                  </h3>

                  {/* Specialization */}
                  <div className="mb-4">
                    <span
                      className={`inline-block px-4 py-2 rounded-lg text-sm font-bold bg-gradient-to-r ${getSpecializationColor(
                        doctor.specialization
                      )} text-white`}
                    >
                      {doctor.specialization || 'General'}
                    </span>
                  </div>

                  {/* Username */}
                  <p className="text-gray-400 text-sm mb-1">
                    <span className="text-gray-500">Username:</span> @{doctor.username}
                  </p>

                  {/* Available badge */}
                  <motion.div
                    animate={{ opacity: [0.6, 1, 0.6] }}
                    transition={{
                      duration: 2,
                      repeat: Infinity,
                      ease: 'easeInOut',
                    }}
                    className="mt-4 flex items-center space-x-2 text-green-400"
                  >
                    <span className="w-2 h-2 rounded-full bg-green-400"></span>
                    <span className="text-xs font-semibold">Available for booking</span>
                  </motion.div>
                </div>
              </motion.div>
            </motion.div>
          ))}
        </motion.div>
      )}
    </motion.div>
  );
};

export default DoctorsList;
