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
      'Cardiology': 'from-red-50 to-red-100',
      'Dermatology': 'from-orange-50 to-orange-100',
      'Neurology': 'from-purple-50 to-purple-100',
      'Pediatrics': 'from-green-50 to-green-100',
      'Orthopedics': 'from-yellow-50 to-yellow-100',
      'Gynecology': 'from-pink-50 to-pink-100',
      'Ophthalmology': 'from-blue-50 to-blue-100',
      'Pulmonology': 'from-teal-50 to-teal-100',
      'General': 'from-slate-50 to-slate-100',
    };
    return colors[specialization] || 'from-blue-50 to-blue-100';
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
        <h1 className="text-4xl font-black text-cyan-400 mb-2">
          Available Doctors
        </h1>
        <div className="h-1 w-48 bg-[#2563EB] rounded-full mb-8"></div>
      </motion.div>

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
            className="w-12 h-12 rounded-full border-4 border-cyan-500/10 border-t-[#2563EB]"
          />
        </motion.div>
      ) : doctors.length === 0 ? (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-gray-900/60 border border-cyan-500/10 rounded-12 shadow-lg p-12 text-center"
        >
          <div className="text-6xl mb-4">👨‍⚕️</div>
          <p className="text-white text-lg">No doctors available.</p>
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
              {/* Card */}
              <motion.div
                whileHover={{ y: -5, transition: { duration: 0.3 } }}
                className="relative bg-gray-900/60 border border-cyan-500/10 group-hover:border-[#2563EB] rounded-12 p-6 transition-all duration-300 shadow-lg hover:shadow-lg-lg overflow-hidden"
              >
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
                    <span className="text-2xl text-gray-400">#{doctor.id}</span>
                  </div>

                  {/* Doctor Name */}
                  <h3 className="text-xl font-black mb-2">
                    <span className="text-cyan-400">
                      Dr. {doctor.first_name || doctor.last_name || doctor.username}
                    </span>
                  </h3>

                  {/* Specialization */}
                  <div className="mb-4">
                    <span
                      className={`inline-block px-4 py-2 rounded-lg text-sm font-bold bg-gradient-to-r ${getSpecializationColor(
                        doctor.specialization
                      )} text-gray-700`}
                    >
                      {doctor.specialization || 'General'}
                    </span>
                  </div>

                  {/* Username */}
                  <p className="text-gray-400 text-sm mb-1">
                    <span className="text-gray-400">Username:</span> @{doctor.username}
                  </p>

                  {/* Available badge */}
                  <motion.div
                    animate={{ opacity: [0.6, 1, 0.6] }}
                    transition={{
                      duration: 2,
                      repeat: Infinity,
                      ease: 'easeInOut',
                    }}
                    className="mt-4 flex items-center space-x-2 text-green-600"
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
