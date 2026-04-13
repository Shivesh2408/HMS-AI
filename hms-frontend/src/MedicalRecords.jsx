import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';

function MedicalRecords() {
  const [prescriptions, setPrescriptions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const token = localStorage.getItem('authToken');

  /* eslint-disable-next-line react-hooks/exhaustive-deps */
  useEffect(() => {
    fetchPrescriptions();
  }, []);

  const fetchPrescriptions = async () => {
    try {
      const response = await fetch(
        `${process.env.REACT_APP_API_URL}/api/prescription/`,
        {
          headers: {
            'Authorization': `Token ${token}`,
            'Content-Type': 'application/json',
          },
        }
      );
      
      if (!response.ok) {
        setError('Failed to load prescriptions');
        return;
      }
      
      const data = await response.json();
      setPrescriptions(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error('Error fetching prescriptions:', error);
      setError('Connection error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full min-h-screen bg-gray-800/50 p-6">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="max-w-4xl mx-auto"
      >
        <h1 className="text-4xl font-bold text-cyan-400 mb-8 flex items-center gap-2">
          📁 Medical Records & Prescriptions
        </h1>

        {error && (
          <div className="bg-red-500/20 border border-red-500/30 rounded-lg p-4 mb-6 text-red-400">
            {error}
          </div>
        )}

        {loading ? (
          <motion.div 
            animate={{ opacity: [0.5, 1] }}
            transition={{ duration: 1.5, repeat: Infinity }}
            className="text-center text-gray-400 py-12 text-lg"
          >
            Loading your medical records...
          </motion.div>
        ) : prescriptions.length === 0 ? (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center py-12 bg-gray-900/60 border border-cyan-500/10 rounded-lg shadow-lg"
          >
            <p className="text-gray-400 text-lg">No medical records found</p>
            <p className="text-[#94a3b8] text-sm mt-2">Your prescriptions will appear here</p>
          </motion.div>
        ) : (
          <div className="grid gap-4">
            {prescriptions.map((prescription, idx) => (
              <motion.div
                key={prescription.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: idx * 0.05 }}
                className="bg-gray-900/60 border border-cyan-500/10 rounded-lg p-6 hover:border-cyan-500/40 transition hover:shadow-lg-lg"
              >
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="border-r border-cyan-500/10 pr-4">
                    <p className="text-gray-400 text-xs font-semibold uppercase tracking-wider mb-1">Medicine</p>
                    <p className="text-white text-lg font-bold">
                      {prescription.medicine_name || 'N/A'}
                    </p>
                  </div>
                  
                  <div>
                    <p className="text-gray-400 text-xs font-semibold uppercase tracking-wider mb-1">Quantity</p>
                    <p className="text-cyan-400 text-lg font-semibold">
                      {prescription.quantity} {prescription.unit || 'tablets'}
                    </p>
                  </div>

                  <div className="border-r border-cyan-500/10 pr-4">
                    <p className="text-gray-400 text-xs font-semibold uppercase tracking-wider mb-1">Date Prescribed</p>
                    <p className="text-white">
                      {new Date(prescription.date).toLocaleDateString('en-US', {
                        year: 'numeric',
                        month: 'short',
                        day: 'numeric'
                      })}
                    </p>
                  </div>

                  <div>
                    <p className="text-gray-400 text-xs font-semibold uppercase tracking-wider mb-1">Doctor</p>
                    <p className="text-white">
                      {prescription.doctor_name || 'Dr. Not Specified'}
                    </p>
                  </div>
                </div>

                {prescription.notes && (
                  <div className="mt-4 pt-4 border-t border-cyan-500/10">
                    <p className="text-gray-400 text-xs font-semibold uppercase tracking-wider mb-2">Notes</p>
                    <p className="text-[#475569] text-sm">{prescription.notes}</p>
                  </div>
                )}
              </motion.div>
            ))}
          </div>
        )}
      </motion.div>
    </div>
  );
}

export default MedicalRecords;
