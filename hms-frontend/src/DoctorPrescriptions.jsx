import React, { useState, useEffect, useCallback } from 'react';
import { motion } from 'framer-motion';

function DoctorPrescriptions() {
  const [appointments, setAppointments] = useState([]);
  const [medicines, setMedicines] = useState([]);
  const [selectedAppointment, setSelectedAppointment] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [successMsg, setSuccessMsg] = useState('');
  const [errorMsg, setErrorMsg] = useState('');
  const token = localStorage.getItem('authToken');

  const [formData, setFormData] = useState({
    medicine: '',
    quantity: '',
    notes: '',
  });

  const fetchAppointments = useCallback(async () => {
    try {
      const response = await fetch(
        `${process.env.REACT_APP_API_URL}/api/doctor/appointments/`,
        {
          headers: { 'Authorization': `Token ${token}` },
        }
      );
      const data = await response.json();
      console.log('Appointments data:', data);
      setAppointments(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error('Error fetching appointments:', error);
      setErrorMsg('Failed to load appointments');
    } finally {
      setLoading(false);
    }
  }, [token]);

  const fetchMedicines = useCallback(async () => {
    try {
      const response = await fetch(
        `${process.env.REACT_APP_API_URL}/api/medicines/`,
        {
          headers: { 'Authorization': `Token ${token}` },
        }
      );
      const data = await response.json();
      setMedicines(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error('Error fetching medicines:', error);
    }
  }, [token]);

  useEffect(() => {
    fetchAppointments();
    fetchMedicines();
  }, [fetchAppointments, fetchMedicines]);

  const handleAddPrescription = async (e) => {
    e.preventDefault();
    setErrorMsg('');
    setSuccessMsg('');

    if (!selectedAppointment) {
      setErrorMsg('Please select an appointment');
      return;
    }

    if (!formData.medicine || !formData.quantity) {
      setErrorMsg('Please fill all required fields');
      return;
    }

    try {
      // Get patient user ID from appointment - try multiple field names
      const patientUserId = selectedAppointment.patient_user_id || 
                            selectedAppointment.patient_user || 
                            selectedAppointment.patient_id;
      
      console.log('Selected Appointment:', selectedAppointment);
      console.log('Patient User ID:', patientUserId);
      
      if (!patientUserId) {
        setErrorMsg('Patient information missing - ID: ' + JSON.stringify(selectedAppointment));
        return;
      }

      const response = await fetch(
        `${process.env.REACT_APP_API_URL}/api/prescription/`,
        {
          method: 'POST',
          headers: {
            'Authorization': `Token ${token}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            patient_user: patientUserId,
            medicine: parseInt(formData.medicine),
            quantity: parseInt(formData.quantity),
            notes: formData.notes,
          }),
        }
      );

      const data = await response.json();
      console.log('Response:', data);

      if (response.ok) {
        setSuccessMsg('✓ Prescription created successfully!');
        setFormData({ medicine: '', quantity: '', notes: '' });
        setShowForm(false);
        setTimeout(() => {
          setSuccessMsg('');
          setSelectedAppointment(null);
        }, 3000);
      } else {
        setErrorMsg(data.error || data.message || 'Failed to create prescription');
      }
    } catch (error) {
      console.error('Error:', error);
      setErrorMsg('Connection error: ' + error.message);
    }
  };

  return (
    <div className="w-full min-h-screen bg-gradient-to-b from-black to-gray-950 p-6">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="max-w-6xl mx-auto"
      >
        <h1 className="text-4xl font-bold text-cyan-400 mb-2 flex items-center gap-2">
          💊 Prescriptions
        </h1>
        <p className="text-gray-400 mb-8">Create and manage patient prescriptions</p>

        {successMsg && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-green-900/30 border border-green-500/50 rounded-lg p-4 mb-6 text-green-300"
          >
            {successMsg}
          </motion.div>
        )}

        {errorMsg && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-red-900/30 border border-red-500/50 rounded-lg p-4 mb-6 text-red-300"
          >
            {errorMsg}
          </motion.div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Appointments List */}
          <div className="lg:col-span-2">
            <div className="bg-gradient-to-br from-purple-900/20 to-blue-900/20 border border-cyan-500/20 rounded-lg p-6">
              <h2 className="text-2xl font-bold text-cyan-400 mb-4">🏥 Appointments</h2>
              
              {loading ? (
                <div className="text-gray-400">Loading appointments...</div>
              ) : appointments.length === 0 ? (
                <div className="text-gray-400 py-8 text-center">No appointments found</div>
              ) : (
                <div className="space-y-3 max-h-96 overflow-y-auto">
                  {appointments.map((apt) => (
                    <motion.div
                      key={apt.id}
                      onClick={() => {
                        setSelectedAppointment(apt);
                        setShowForm(true);
                      }}
                      className={`p-4 rounded-lg border-2 cursor-pointer transition ${
                        selectedAppointment?.id === apt.id
                          ? 'border-cyan-400 bg-cyan-500/10'
                          : 'border-cyan-500/30 hover:border-cyan-400/60'
                      }`}
                    >
                      <div className="flex justify-between items-start">
                        <div>
                          <p className="font-semibold text-white">📋 {apt.patient_name || apt.patient || 'Patient'}</p>
                          <p className="text-xs text-cyan-300/90">@{apt.patient_username || 'unknown'}</p>
                          <p className="text-sm text-gray-400">
                            Date: {apt.appointment_date ? new Date(apt.appointment_date).toLocaleDateString() : 'N/A'}
                          </p>
                          <p className="text-sm text-gray-400">Symptoms: {apt.symptoms || 'N/A'}</p>
                        </div>
                        <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
                          apt.status === 'completed' 
                            ? 'bg-green-900/50 text-green-300'
                            : 'bg-yellow-900/50 text-yellow-300'
                        }`}>
                          {apt.status || 'pending'}
                        </span>
                      </div>
                    </motion.div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Prescription Form */}
          <div>
            <motion.div
              className="bg-gradient-to-br from-purple-900/20 to-blue-900/20 border border-cyan-500/20 rounded-lg p-6 sticky top-6"
            >
              <h2 className="text-2xl font-bold text-cyan-400 mb-4">💉 Add Prescription</h2>
              
              {selectedAppointment && showForm ? (
                <form onSubmit={handleAddPrescription} className="space-y-4">
                  <div className="mb-4 p-3 bg-cyan-500/10 border border-cyan-500/30 rounded">
                    <p className="text-sm text-gray-400">Patient:</p>
                    <p className="text-white font-semibold text-lg">
                      {selectedAppointment.patient_name || selectedAppointment.patient || 'Unknown Patient'}
                    </p>
                    <p className="text-xs text-cyan-300/90 mt-1">
                      Username: @{selectedAppointment.patient_username || 'unknown'}
                    </p>
                  </div>

                  <div>
                    <label className="text-sm text-cyan-400 font-semibold block mb-2">
                      Medicine *
                    </label>
                    <select
                      value={formData.medicine}
                      onChange={(e) => setFormData({ ...formData, medicine: e.target.value })}
                      className="w-full bg-gray-900 border border-cyan-500/30 rounded px-3 py-2 text-white focus:border-cyan-400 outline-none"
                      required
                    >
                      <option value="">
                        {medicines.length === 0 ? 'Loading medicines...' : 'Select Medicine'}
                      </option>
                      {medicines.map((med) => (
                        <option key={med.id} value={med.id}>
                          {med.name}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="text-sm text-cyan-400 font-semibold block mb-2">
                      Quantity * (tablets)
                    </label>
                    <input
                      type="number"
                      value={formData.quantity}
                      onChange={(e) => setFormData({ ...formData, quantity: e.target.value })}
                      className="w-full bg-gray-900 border border-cyan-500/30 rounded px-3 py-2 text-white focus:border-cyan-400 outline-none"
                      placeholder="e.g., 10"
                      min="1"
                    />
                  </div>

                  <div>
                    <label className="text-sm text-cyan-400 font-semibold block mb-2">
                      Instructions
                    </label>
                    <textarea
                      value={formData.notes}
                      onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                      className="w-full bg-gray-900 border border-cyan-500/30 rounded px-3 py-2 text-white focus:border-cyan-400 outline-none text-sm"
                      placeholder="e.g., Take twice daily with food"
                      rows="3"
                    />
                  </div>

                  <div className="flex gap-2">
                    <button
                      type="submit"
                      className="flex-1 bg-cyan-600 hover:bg-cyan-500 text-white font-bold py-2 px-4 rounded transition"
                    >
                      ✓ Save
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setShowForm(false);
                        setSelectedAppointment(null);
                        setFormData({ medicine: '', quantity: '', notes: '' });
                      }}
                      className="flex-1 bg-gray-700 hover:bg-gray-600 text-white font-bold py-2 px-4 rounded transition"
                    >
                      ✕ Cancel
                    </button>
                  </div>
                </form>
              ) : (
                <div className="text-gray-400 text-center py-8">
                  <p>Select an appointment to add a prescription</p>
                </div>
              )}
            </motion.div>
          </div>
        </div>
      </motion.div>
    </div>
  );
}

export default DoctorPrescriptions;
