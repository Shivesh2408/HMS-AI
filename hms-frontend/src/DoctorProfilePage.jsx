import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { getDoctorById, updateDoctor, resolveDoctorIdByAuthUid } from './firebase.service';

const DoctorProfilePage = () => {
  const [profileData, setProfileData] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const authDoctorId = localStorage.getItem('userId');
  const [doctorId, setDoctorId] = useState(null);

  const [formData, setFormData] = useState({
    name: '',
    specialization: '',
    phone: '',
    experience: 0,
    qualification: '',
    bio: '',
  });

  const pageVariants = {
    initial: { opacity: 0, y: 20 },
    animate: { opacity: 1, y: 0 },
    exit: { opacity: 0, y: -20 },
  };

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const resolvedDoctorId = await resolveDoctorIdByAuthUid(authDoctorId);
        if (!resolvedDoctorId) {
          setError('Doctor profile not found. Please contact admin.');
          return;
        }

        setDoctorId(resolvedDoctorId);
        console.log('[DOCTOR_PROFILE] Fetching profile for doctor profile ID:', resolvedDoctorId);
        const profile = await getDoctorById(resolvedDoctorId);
        setProfileData(profile);
        setFormData(profile || {});
        console.log('[DOCTOR_PROFILE] ✓ Profile fetched');
      } catch (err) {
        setError('Failed to fetch profile');
        console.error('Error:', err);
      }
    };
    if (authDoctorId) {
      fetchProfile();
    }
  }, [authDoctorId]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSave = async () => {
    setLoading(true);
    setError('');
    setMessage('');

    try {
      const updateData = {
        name: formData.name,
        specialization: formData.specialization,
        phone: formData.phone,
        experience: parseInt(formData.experience) || 0,
        qualification: formData.qualification,
        bio: formData.bio,
      };

      console.log('[DOCTOR_PROFILE] Updating profile...');
      const success = await updateDoctor(doctorId, updateData);

      if (success) {
        setProfileData(updateData);
        setMessage('Profile updated successfully!');
        setIsEditing(false);
        console.log('[DOCTOR_PROFILE] ✓ Profile updated');
      } else {
        setError('Failed to update profile');
      }
    } catch (err) {
      setError('Failed to update profile');
      console.error('Error:', err);
    } finally {
      setLoading(false);
    }
  };

  if (!profileData) {
    return (
      <div className="flex justify-center items-center h-screen">
        <motion.div animate={{ rotate: 360 }} transition={{ duration: 1, repeat: Infinity }} className="text-4xl">
          ⚙️
        </motion.div>
      </div>
    );
  }

  return (
    <motion.div
      variants={pageVariants}
      initial="initial"
      animate="animate"
      exit="exit"
      className="p-8 max-w-3xl mx-auto"
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
            Doctor Profile
          </h1>
          <div className="h-1 w-32 bg-gradient-to-r from-purple-400 to-pink-500 rounded-full"></div>
        </motion.div>

        {message && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-6 p-4 bg-green-500/20 border border-green-500/50 rounded-lg text-green-400 font-semibold"
          >
            ✓ {message}
          </motion.div>
        )}

        {error && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-6 p-4 bg-red-500/20 border border-red-500/50 rounded-lg text-red-400 font-semibold"
          >
            ✗ {error}
          </motion.div>
        )}

        {isEditing ? (
          <div className="space-y-6">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-purple-400 font-semibold mb-2 text-sm">First Name</label>
                <input
                  type="text"
                  name="first_name"
                  value={formData.first_name}
                  onChange={handleInputChange}
                  className="w-full px-4 py-3 bg-gray-800/50 border border-purple-500/20 rounded-lg text-gray-200 focus:outline-none focus:border-purple-400/50"
                />
              </div>
              <div>
                <label className="block text-purple-400 font-semibold mb-2 text-sm">Last Name</label>
                <input
                  type="text"
                  name="last_name"
                  value={formData.last_name}
                  onChange={handleInputChange}
                  className="w-full px-4 py-3 bg-gray-800/50 border border-purple-500/20 rounded-lg text-gray-200 focus:outline-none focus:border-purple-400/50"
                />
              </div>
            </div>

            <div>
              <label className="block text-purple-400 font-semibold mb-2 text-sm">Full Name</label>
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleInputChange}
                className="w-full px-4 py-3 bg-gray-800/50 border border-purple-500/20 rounded-lg text-gray-200 focus:outline-none focus:border-purple-400/50"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-purple-400 font-semibold mb-2 text-sm">Specialization</label>
                <input
                  type="text"
                  name="specialization"
                  value={formData.specialization}
                  onChange={handleInputChange}
                  className="w-full px-4 py-3 bg-gray-800/50 border border-purple-500/20 rounded-lg text-gray-200 focus:outline-none focus:border-purple-400/50"
                />
              </div>
              <div>
                <label className="block text-purple-400 font-semibold mb-2 text-sm">Phone</label>
                <input
                  type="tel"
                  name="phone"
                  value={formData.phone}
                  onChange={handleInputChange}
                  className="w-full px-4 py-3 bg-gray-800/50 border border-purple-500/20 rounded-lg text-gray-200 focus:outline-none focus:border-purple-400/50"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-purple-400 font-semibold mb-2 text-sm">Experience (Years)</label>
                <input
                  type="number"
                  name="experience"
                  value={formData.experience}
                  onChange={handleInputChange}
                  className="w-full px-4 py-3 bg-gray-800/50 border border-purple-500/20 rounded-lg text-gray-200 focus:outline-none focus:border-purple-400/50"
                />
              </div>
              <div>
                <label className="block text-purple-400 font-semibold mb-2 text-sm">Qualification</label>
                <input
                  type="text"
                  name="qualification"
                  value={formData.qualification}
                  onChange={handleInputChange}
                  placeholder="e.g., MBBS, MD"
                  className="w-full px-4 py-3 bg-gray-800/50 border border-purple-500/20 rounded-lg text-gray-200 focus:outline-none focus:border-purple-400/50"
                />
              </div>
            </div>

            <div>
              <label className="block text-purple-400 font-semibold mb-2 text-sm">Bio</label>
              <textarea
                name="bio"
                value={formData.bio}
                onChange={handleInputChange}
                rows="4"
                className="w-full px-4 py-3 bg-gray-800/50 border border-purple-500/20 rounded-lg text-gray-200 focus:outline-none focus:border-purple-400/50"
              />
            </div>

            <div className="flex gap-4">
              <motion.button
                onClick={handleSave}
                disabled={loading}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="flex-1 px-8 py-3 bg-gradient-to-r from-green-500 to-emerald-600 text-white font-bold rounded-lg disabled:opacity-50"
              >
                {loading ? '⚙️ Saving...' : 'Save Changes'}
              </motion.button>
              <motion.button
                onClick={() => {
                  setIsEditing(false);
                  setFormData(profileData);
                }}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="flex-1 px-8 py-3 bg-gray-700 text-white font-bold rounded-lg"
              >
                Cancel
              </motion.button>
            </div>
          </div>
        ) : (
          <div className="space-y-6">
            <div className="grid grid-cols-2 gap-6">
              <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} className="p-4 bg-purple-500/10 rounded-lg border border-purple-500/20">
                <p className="text-purple-400 text-sm font-semibold">Username</p>
                <p className="text-2xl text-white font-bold mt-1">{profileData.username}</p>
              </motion.div>
              <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="p-4 bg-purple-500/10 rounded-lg border border-purple-500/20">
                <p className="text-purple-400 text-sm font-semibold">Email</p>
                <p className="text-lg text-gray-300 mt-1">{profileData.email}</p>
              </motion.div>
            </div>

            <div className="grid grid-cols-2 gap-6">
              <div className="p-4 bg-purple-500/10 rounded-lg border border-purple-500/20">
                <p className="text-purple-400 text-sm font-semibold">Name</p>
                <p className="text-xl text-white font-bold mt-1">{profileData.name}</p>
              </div>
              <div className="p-4 bg-purple-500/10 rounded-lg border border-purple-500/20">
                <p className="text-purple-400 text-sm font-semibold">Specialization</p>
                <p className="text-xl text-white font-bold mt-1">{profileData.specialization}</p>
              </div>
            </div>

            <div className="grid grid-cols-3 gap-6">
              <div className="p-4 bg-purple-500/10 rounded-lg border border-purple-500/20">
                <p className="text-purple-400 text-sm font-semibold">Experience</p>
                <p className="text-2xl text-white font-bold mt-1">{profileData.experience} yrs</p>
              </div>
              <div className="p-4 bg-purple-500/10 rounded-lg border border-purple-500/20">
                <p className="text-purple-400 text-sm font-semibold">Qualification</p>
                <p className="text-lg text-white font-bold mt-1">{profileData.qualification || 'N/A'}</p>
              </div>
              <div className="p-4 bg-purple-500/10 rounded-lg border border-purple-500/20">
                <p className="text-purple-400 text-sm font-semibold">Phone</p>
                <p className="text-lg text-white font-bold mt-1">{profileData.phone}</p>
              </div>
            </div>

            <div className="p-4 bg-purple-500/10 rounded-lg border border-purple-500/20">
              <p className="text-purple-400 text-sm font-semibold mb-2">Bio</p>
              <p className="text-gray-300 leading-relaxed">{profileData.bio || 'No bio added yet'}</p>
            </div>

            <motion.button
              onClick={() => setIsEditing(true)}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="w-full px-8 py-3 bg-gradient-to-r from-purple-500 to-pink-600 text-white font-bold rounded-lg"
            >
              Edit Profile
            </motion.button>
          </div>
        )}
      </motion.div>
    </motion.div>
  );
};

export default DoctorProfilePage;
