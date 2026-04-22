// Firebase Service Module for Frontend
import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
  updateProfile,
} from "firebase/auth";
import {
  collection,
  addDoc,
  setDoc,
  getDoc,
  getDocs,
  updateDoc,
  doc,
  query,
  where,
  orderBy,
  Timestamp,
  onSnapshot,
} from "firebase/firestore";
import { auth, db, storage } from "./firebase.config";
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";

// ==================== AUTHENTICATION ====================

/**
 * Register a new user
 * @param {string} email - User email
 * @param {string} password - User password
 * @param {object} userData - Additional user data (name, role, etc.)
 * @returns {Promise<object>} User object with uid
 */
export const registerUser = async (email, password, userData) => {
  try {
    console.log('🔐 [AUTH] Starting registration for:', email);
    const userCredential = await createUserWithEmailAndPassword(auth, email, password);
    const user = userCredential.user;
    console.log('✅ [AUTH] User created:', user.uid);

    // Update user profile with display name
    if (userData.name) {
      await updateProfile(user, {
        displayName: userData.name,
      });
    }

    // Store user data in Firestore
    console.log('📝 [FIRESTORE] Writing user profile to Firestore...');
    await setDoc(doc(db, "users", user.uid), {
      uid: user.uid,
      email: email,
      name: userData.name || "",
      role: userData.role || "patient",
      phone: userData.phone || "",
      createdAt: Timestamp.now(),
      updatedAt: Timestamp.now(),
      ...userData,
    });
    console.log('✅ [FIRESTORE] User profile saved');

    return {
      success: true,
      uid: user.uid,
      email: user.email,
      displayName: user.displayName,
    };
  } catch (error) {
    console.error('❌ [AUTH_ERROR] Registration failed:', {
      code: error.code,
      message: error.message,
      email: email
    });
    return {
      success: false,
      error: error.message,
      code: error.code,
    };
  }
};

/**
 * Login user
 * @param {string} email - User email
 * @param {string} password - User password
 * @returns {Promise<object>} User object with uid
 */
export const loginUser = async (email, password) => {
  try {
    console.log('🔐 [LOGIN] Starting login for:', email);
    console.log('🔐 [LOGIN] Authenticating user...');
    const userCredential = await signInWithEmailAndPassword(auth, email, password);
    const user = userCredential.user;
    console.log('✅ [LOGIN] Auth successful. UID:', user.uid);

    // Get user data from Firestore
    console.log('📝 [LOGIN] Fetching user profile from Firestore...');
    try {
      const userDoc = await getDoc(doc(db, "users", user.uid));
      
      if (!userDoc.exists()) {
        console.warn('⚠️ [LOGIN] User document does not exist in Firestore for UID:', user.uid);
        console.log('📋 [LOGIN] User can still login - using default role');
      }
      
      const userData = userDoc.data() || {};
      console.log('✅ [LOGIN] User data retrieved:', { uid: user.uid, role: userData.role, name: userData.name });

      return {
        success: true,
        uid: user.uid,
        email: user.email,
        displayName: user.displayName,
        role: userData.role || "patient",
        ...userData,
      };
    } catch (firestoreErr) {
      // If Firestore fails but auth succeeded, allow login with default role
      if (firestoreErr.code === 'unavailable' || firestoreErr.code === 'failed-precondition') {
        console.warn('⚠️ [LOGIN] Firestore unavailable - proceeding with offline mode');
        console.log('✅ [LOGIN] Auth successful (offline mode)');
        return {
          success: true,
          uid: user.uid,
          email: user.email,
          displayName: user.displayName,
          role: "patient",
          offlineMode: true,
        };
      }
      throw firestoreErr;
    }
  } catch (error) {
    console.error('❌ [LOGIN_ERROR] Login failed:', {
      code: error.code,
      message: error.message,
      email: email,
      fullError: error
    });

    // Provide user-friendly error messages
    let userMessage = error.message;
    if (error.code === 'auth/user-not-found') {
      userMessage = 'User not found. Please check your email.';
    } else if (error.code === 'auth/wrong-password') {
      userMessage = 'Incorrect password.';
    } else if (error.code === 'auth/invalid-email') {
      userMessage = 'Invalid email address.';
    } else if (error.code === 'auth/too-many-requests') {
      userMessage = 'Too many login attempts. Please try again later.';
    } else if (error.code === 'unavailable') {
      userMessage = 'Firebase service unavailable. Check your internet connection.';
    }

    return {
      success: false,
      error: userMessage,
      code: error.code,
    };
  }
};

/**
 * Logout user
 * @returns {Promise<object>} Logout result
 */
export const logoutUser = async () => {
  try {
    await signOut(auth);
    return { success: true };
  } catch (error) {
    return { success: false, error: error.message };
  }
};

/**
 * Get current user
 * @returns {Promise<object|null>} Current user object or null
 */
export const getCurrentUser = () => {
  return new Promise((resolve) => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user) {
        const userDoc = await getDoc(doc(db, "users", user.uid));
        const userData = userDoc.data() || {};
        resolve({
          uid: user.uid,
          email: user.email,
          displayName: user.displayName,
          ...userData,
        });
      } else {
        resolve(null);
      }
      unsubscribe();
    });
  });
};

/**
 * Watch auth state changes in real-time
 * @param {function} callback - Callback function called when auth state changes
 * @returns {function} Unsubscribe function
 */
export const onAuthChange = (callback) => {
  return onAuthStateChanged(auth, async (user) => {
    if (user) {
      const userDoc = await getDoc(doc(db, "users", user.uid));
      const userData = userDoc.data() || {};
      callback({
        uid: user.uid,
        email: user.email,
        displayName: user.displayName,
        ...userData,
      });
    } else {
      callback(null);
    }
  });
};

// ==================== USER OPERATIONS ====================

/**
 * Get user by ID
 * @param {string} uid - User ID
 * @returns {Promise<object|null>} User object or null
 */
export const getUserById = async (uid) => {
  try {
    const userDoc = await getDoc(doc(db, "users", uid));
    return userDoc.exists() ? userDoc.data() : null;
  } catch (error) {
    console.error("Error getting user:", error);
    return null;
  }
};

/**
 * Update user data
 * @param {string} uid - User ID
 * @param {object} data - Data to update
 * @returns {Promise<boolean>} Success status
 */
export const updateUser = async (uid, data) => {
  try {
    await updateDoc(doc(db, "users", uid), {
      ...data,
      updatedAt: Timestamp.now(),
    });
    return true;
  } catch (error) {
    console.error("Error updating user:", error);
    return false;
  }
};

// ==================== PATIENT OPERATIONS ====================

/**
 * Create patient profile
 * @param {string} userId - User ID
 * @param {object} patientData - Patient information
 * @returns {Promise<object>} Patient object with ID
 */
export const createPatient = async (userId, patientData) => {
  try {
    const patientRef = await addDoc(collection(db, "patients"), {
      userId,
      name: patientData.name || "",
      age: patientData.age || 0,
      gender: patientData.gender || "M",
      phone: patientData.phone || "",
      email: patientData.email || "",
      address: patientData.address || "",
      medicalHistory: patientData.medicalHistory || [],
      emergencyContact: patientData.emergencyContact || "",
      createdAt: Timestamp.now(),
      updatedAt: Timestamp.now(),
    });

    return {
      success: true,
      id: patientRef.id,
      ...patientData,
    };
  } catch (error) {
    console.error("Error creating patient:", error);
    return { success: false, error: error.message };
  }
};

/**
 * Get patient by user ID
 * @param {string} userId - User ID
 * @returns {Promise<object|null>} Patient object or null
 */
export const getPatientByUserId = async (userId) => {
  try {
    const q = query(collection(db, "patients"), where("userId", "==", userId));
    const querySnapshot = await getDocs(q);

    if (querySnapshot.empty) {
      return null;
    }

    const doc = querySnapshot.docs[0];
    return {
      id: doc.id,
      ...doc.data(),
    };
  } catch (error) {
    console.error("Error getting patient:", error);
    return null;
  }
};

/**
 * Update patient data
 * @param {string} patientId - Patient ID
 * @param {object} data - Data to update
 * @returns {Promise<boolean>} Success status
 */
export const updatePatient = async (patientId, data) => {
  try {
    await updateDoc(doc(db, "patients", patientId), {
      ...data,
      updatedAt: Timestamp.now(),
    });
    return true;
  } catch (error) {
    console.error("Error updating patient:", error);
    return false;
  }
};

// ==================== DOCTOR OPERATIONS ====================

/**
 * Create doctor profile
 * @param {string} userId - User ID
 * @param {object} doctorData - Doctor information
 * @returns {Promise<object>} Doctor object with ID
 */
export const createDoctor = async (userId, doctorData) => {
  try {
    const doctorRef = await addDoc(collection(db, "doctors"), {
      userId,
      name: doctorData.name || "",
      specialization: doctorData.specialization || "",
      phone: doctorData.phone || "",
      email: doctorData.email || "",
      experience: doctorData.experience || 0,
      qualification: doctorData.qualification || "",
      bio: doctorData.bio || "",
      available: doctorData.available !== false,
      consultationFee: doctorData.consultationFee || 0,
      createdAt: Timestamp.now(),
      updatedAt: Timestamp.now(),
    });

    return {
      success: true,
      id: doctorRef.id,
      ...doctorData,
    };
  } catch (error) {
    console.error("Error creating doctor:", error);
    return { success: false, error: error.message };
  }
};

/**
 * Get all doctors
 * @returns {Promise<array>} Array of doctor objects
 */
export const getAllDoctors = async () => {
  try {
    const querySnapshot = await getDocs(collection(db, "doctors"));
    const doctors = [];

    querySnapshot.forEach((doc) => {
      doctors.push({
        id: doc.id,
        ...doc.data(),
      });
    });

    return doctors;
  } catch (error) {
    console.error("Error getting doctors:", error);
    return [];
  }
};

/**
 * Get doctors by specialization
 * @param {string} specialization - Doctor specialization
 * @returns {Promise<array>} Array of doctor objects
 */
export const getDoctorsBySpecialization = async (specialization) => {
  try {
    const q = query(
      collection(db, "doctors"),
      where("specialization", "==", specialization)
    );
    const querySnapshot = await getDocs(q);
    const doctors = [];

    querySnapshot.forEach((doc) => {
      doctors.push({
        id: doc.id,
        ...doc.data(),
      });
    });

    return doctors;
  } catch (error) {
    console.error("Error getting doctors:", error);
    return [];
  }
};

/**
 * Get doctor by ID
 * @param {string} doctorId - Doctor ID
 * @returns {Promise<object|null>} Doctor object or null
 */
export const getDoctorById = async (doctorId) => {
  try {
    const doctorDoc = await getDoc(doc(db, "doctors", doctorId));
    return doctorDoc.exists() ? { id: doctorId, ...doctorDoc.data() } : null;
  } catch (error) {
    console.error("Error getting doctor:", error);
    return null;
  }
};

/**
 * Get doctor by auth user ID
 * @param {string} userId - Firebase auth UID
 * @returns {Promise<object|null>} Doctor object or null
 */
export const getDoctorByUserId = async (userId) => {
  try {
    const q = query(collection(db, "doctors"), where("userId", "==", userId));
    const querySnapshot = await getDocs(q);

    if (querySnapshot.empty) {
      return null;
    }

    const doctorDoc = querySnapshot.docs[0];
    return {
      id: doctorDoc.id,
      ...doctorDoc.data(),
    };
  } catch (error) {
    console.error("Error getting doctor by userId:", error);
    return null;
  }
};

/**
 * Resolve doctor profile document ID from logged-in auth UID
 * @param {string} authUserId - Firebase auth UID
 * @returns {Promise<string|null>} doctor document ID
 */
export const resolveDoctorIdByAuthUid = async (authUserId) => {
  try {
    if (!authUserId) return null;

    // Case 1: auth UID equals doctor document ID
    const directDoc = await getDoc(doc(db, "doctors", authUserId));
    if (directDoc.exists()) {
      return authUserId;
    }

    // Case 2: doctor document stores the auth UID under userId
    const byUser = await getDoctorByUserId(authUserId);
    if (byUser?.id) {
      return byUser.id;
    }

    return null;
  } catch (error) {
    console.error("Error resolving doctor ID:", error);
    return null;
  }
};

const normalizeAppointmentStatus = (status) => {
  if (!status) return "pending";
  const normalized = String(status).toLowerCase();
  if (normalized === "accepted") return "approved";
  return normalized;
};

const sortAppointmentsDesc = (appointments) => {
  return [...appointments].sort((a, b) => {
    const dateA = `${a.date || ""} ${a.time || ""}`;
    const dateB = `${b.date || ""} ${b.time || ""}`;
    return dateB.localeCompare(dateA);
  });
};

/**
 * Update doctor data
 * @param {string} doctorId - Doctor ID
 * @param {object} data - Data to update
 * @returns {Promise<boolean>} Success status
 */
export const updateDoctor = async (doctorId, data) => {
  try {
    await updateDoc(doc(db, "doctors", doctorId), {
      ...data,
      updatedAt: Timestamp.now(),
    });
    return true;
  } catch (error) {
    console.error("Error updating doctor:", error);
    return false;
  }
};

// ==================== APPOINTMENT OPERATIONS ====================

/**
 * Create appointment
 * @param {object} appointmentData - Appointment details
 * @returns {Promise<object>} Appointment object with ID
 */
export const createAppointment = async (appointmentData) => {
  try {
    const payload = {
      patientId: appointmentData.patientId || "",
      doctorId: appointmentData.doctorId || "",
      date: appointmentData.date || "",
      time: appointmentData.time || "",
      status: normalizeAppointmentStatus(appointmentData.status || "pending"),
      diagnosis: appointmentData.diagnosis || "",
      notes: appointmentData.notes || "",
      createdAt: Timestamp.now(),
      updatedAt: Timestamp.now(),
    };

    const appointmentRef = await addDoc(collection(db, "appointments"), payload);

    return {
      success: true,
      id: appointmentRef.id,
      ...payload,
    };
  } catch (error) {
    console.error("Error creating appointment:", error);
    return { success: false, error: error.message };
  }
};

/**
 * Get patient appointments
 * @param {string} patientId - Patient ID
 * @returns {Promise<array>} Array of appointment objects
 */
export const getPatientAppointments = async (patientId) => {
  try {
    const q = query(
      collection(db, "appointments"),
      where("patientId", "==", patientId)
    );
    const querySnapshot = await getDocs(q);

    const rawAppointments = querySnapshot.docs.map((appointmentDoc) => ({
      id: appointmentDoc.id,
      ...appointmentDoc.data(),
    }));

    const doctorIds = [...new Set(rawAppointments.map((apt) => apt.doctorId).filter(Boolean))];
    const doctorPairs = await Promise.all(
      doctorIds.map(async (doctorId) => {
        const doctorDoc = await getDoc(doc(db, "doctors", doctorId));
        return [doctorId, doctorDoc.exists() ? doctorDoc.data() : null];
      })
    );
    const doctorMap = Object.fromEntries(doctorPairs);

    const appointments = rawAppointments.map((apt) => {
      const doctorProfile = doctorMap[apt.doctorId] || {};
      return {
        ...apt,
        status: normalizeAppointmentStatus(apt.status),
        created_at: apt.createdAt || apt.created_at || null,
        doctor_name: apt.doctor_name || doctorProfile.name || "N/A",
        doctor_specialization:
          apt.doctor_specialization || doctorProfile.specialization || "General",
      };
    });

    return sortAppointmentsDesc(appointments);
  } catch (error) {
    console.error("Error getting patient appointments:", error);
    return [];
  }
};

/**
 * Get doctor appointments
 * @param {string} doctorId - Doctor ID
 * @returns {Promise<array>} Array of appointment objects
 */
export const getDoctorAppointments = async (authDoctorId) => {
  try {
    const doctorProfileId = await resolveDoctorIdByAuthUid(authDoctorId);
    if (!doctorProfileId) {
      console.warn("Doctor profile not found for auth user:", authDoctorId);
      return [];
    }

    const q = query(
      collection(db, "appointments"),
      where("doctorId", "==", doctorProfileId)
    );
    const querySnapshot = await getDocs(q);

    const rawAppointments = querySnapshot.docs.map((appointmentDoc) => ({
      id: appointmentDoc.id,
      ...appointmentDoc.data(),
    }));

    const patientIds = [...new Set(rawAppointments.map((apt) => apt.patientId).filter(Boolean))];
    const patientPairs = await Promise.all(
      patientIds.map(async (patientId) => {
        const patientDoc = await getDoc(doc(db, "users", patientId));
        return [patientId, patientDoc.exists() ? patientDoc.data() : null];
      })
    );
    const patientMap = Object.fromEntries(patientPairs);

    const doctorProfile = await getDoctorById(doctorProfileId);

    const appointments = rawAppointments.map((apt) => {
      const patientProfile = patientMap[apt.patientId] || {};
      return {
        ...apt,
        status: normalizeAppointmentStatus(apt.status),
        created_at: apt.createdAt || apt.created_at || null,
        patient_name: apt.patient_name || patientProfile.name || "Unknown Patient",
        doctor_specialization:
          apt.doctor_specialization || doctorProfile?.specialization || "General",
      };
    });

    return sortAppointmentsDesc(appointments);
  } catch (error) {
    console.error("Error getting doctor appointments:", error);
    return [];
  }
};

/**
 * Update appointment
 * @param {string} appointmentId - Appointment ID
 * @param {object} data - Data to update
 * @returns {Promise<boolean>} Success status
 */
export const updateAppointment = async (appointmentId, data) => {
  try {
    const nextData = { ...data };
    if (nextData.status) {
      nextData.status = normalizeAppointmentStatus(nextData.status);
    }

    await updateDoc(doc(db, "appointments", appointmentId), {
      ...nextData,
      updatedAt: Timestamp.now(),
    });
    return true;
  } catch (error) {
    console.error("Error updating appointment:", error);
    return false;
  }
};

/**
 * Subscribe doctor appointments in real-time
 * @param {string} authDoctorId - Firebase auth UID
 * @param {function} onData - callback with appointments
 * @param {function} onError - callback on error
 * @returns {Promise<function>} unsubscribe function
 */
export const subscribeDoctorAppointments = async (authDoctorId, onData, onError) => {
  const doctorProfileId = await resolveDoctorIdByAuthUid(authDoctorId);
  if (!doctorProfileId) {
    onData([]);
    return () => {};
  }

  const q = query(collection(db, "appointments"), where("doctorId", "==", doctorProfileId));

  return onSnapshot(
    q,
    async (snapshot) => {
      const rawAppointments = snapshot.docs.map((appointmentDoc) => ({
        id: appointmentDoc.id,
        ...appointmentDoc.data(),
      }));

      const patientIds = [...new Set(rawAppointments.map((apt) => apt.patientId).filter(Boolean))];
      const patientPairs = await Promise.all(
        patientIds.map(async (patientId) => {
          const patientDoc = await getDoc(doc(db, "users", patientId));
          return [patientId, patientDoc.exists() ? patientDoc.data() : null];
        })
      );
      const patientMap = Object.fromEntries(patientPairs);

      const doctorProfile = await getDoctorById(doctorProfileId);

      const enriched = rawAppointments.map((apt) => {
        const patientProfile = patientMap[apt.patientId] || {};
        return {
          ...apt,
          status: normalizeAppointmentStatus(apt.status),
          created_at: apt.createdAt || apt.created_at || null,
          patient_name: apt.patient_name || patientProfile.name || "Unknown Patient",
          doctor_specialization:
            apt.doctor_specialization || doctorProfile?.specialization || "General",
        };
      });

      onData(sortAppointmentsDesc(enriched));
    },
    (error) => {
      console.error("Doctor appointments subscription error:", error);
      if (onError) onError(error);
    }
  );
};

/**
 * Subscribe patient appointments in real-time
 * @param {string} patientId - Firebase auth UID
 * @param {function} onData - callback with appointments
 * @param {function} onError - callback on error
 * @returns {function} unsubscribe function
 */
export const subscribePatientAppointments = (patientId, onData, onError) => {
  const q = query(collection(db, "appointments"), where("patientId", "==", patientId));

  return onSnapshot(
    q,
    async (snapshot) => {
      const rawAppointments = snapshot.docs.map((appointmentDoc) => ({
        id: appointmentDoc.id,
        ...appointmentDoc.data(),
      }));

      const doctorIds = [...new Set(rawAppointments.map((apt) => apt.doctorId).filter(Boolean))];
      const doctorPairs = await Promise.all(
        doctorIds.map(async (doctorId) => {
          const doctorDoc = await getDoc(doc(db, "doctors", doctorId));
          return [doctorId, doctorDoc.exists() ? doctorDoc.data() : null];
        })
      );
      const doctorMap = Object.fromEntries(doctorPairs);

      const enriched = rawAppointments.map((apt) => {
        const doctorProfile = doctorMap[apt.doctorId] || {};
        return {
          ...apt,
          status: normalizeAppointmentStatus(apt.status),
          created_at: apt.createdAt || apt.created_at || null,
          doctor_name: apt.doctor_name || doctorProfile.name || "N/A",
          doctor_specialization:
            apt.doctor_specialization || doctorProfile.specialization || "General",
        };
      });

      onData(sortAppointmentsDesc(enriched));
    },
    (error) => {
      console.error("Patient appointments subscription error:", error);
      if (onError) onError(error);
    }
  );
};

/**
 * Cancel appointment
 * @param {string} appointmentId - Appointment ID
 * @returns {Promise<boolean>} Success status
 */
export const cancelAppointment = async (appointmentId) => {
  return updateAppointment(appointmentId, { status: "cancelled" });
};

// ==================== PRESCRIPTION OPERATIONS ====================

/**
 * Get patient prescriptions
 * @param {string} patientId - Patient ID
 * @returns {Promise<array>} Array of prescription objects
 */
export const getPatientPrescriptions = async (patientId) => {
  try {
    const q = query(
      collection(db, "prescriptions"),
      where("patientId", "==", patientId),
      orderBy("createdAt", "desc")
    );
    const querySnapshot = await getDocs(q);
    const prescriptions = [];

    querySnapshot.forEach((doc) => {
      prescriptions.push({
        id: doc.id,
        ...doc.data(),
      });
    });

    return prescriptions;
  } catch (error) {
    console.error("Error getting prescriptions:", error);
    return [];
  }
};

// ==================== MEDICAL RECORDS ====================

/**
 * Create medical record
 * @param {object} recordData - Record details
 * @returns {Promise<object>} Record object with ID
 */
export const createMedicalRecord = async (recordData) => {
  try {
    const recordRef = await addDoc(collection(db, "medical_records"), {
      patientId: recordData.patientId || "",
      diagnosis: recordData.diagnosis || "",
      treatment: recordData.treatment || "",
      notes: recordData.notes || "",
      createdAt: Timestamp.now(),
      updatedAt: Timestamp.now(),
    });

    return {
      success: true,
      id: recordRef.id,
      ...recordData,
    };
  } catch (error) {
    console.error("Error creating medical record:", error);
    return { success: false, error: error.message };
  }
};

// ==================== BILLING OPERATIONS ====================

/**
 * Create bill
 * @param {object} billData - Bill details
 * @returns {Promise<object>} Bill object with ID
 */
export const createBill = async (billData) => {
  try {
    const billRef = await addDoc(collection(db, "billing"), {
      appointmentId: billData.appointmentId || "",
      patientId: billData.patientId || "",
      amount: billData.amount || 0,
      paymentStatus: billData.paymentStatus || "pending",
      date: billData.date || Timestamp.now(),
      createdAt: Timestamp.now(),
      updatedAt: Timestamp.now(),
    });

    return {
      success: true,
      id: billRef.id,
      ...billData,
    };
  } catch (error) {
    console.error("Error creating bill:", error);
    return { success: false, error: error.message };
  }
};

/**
 * Update bill status
 * @param {string} billId - Bill ID
 * @param {string} status - New payment status
 * @returns {Promise<boolean>} Success status
 */
export const updateBillStatus = async (billId, status) => {
  return updateDoc(doc(db, "billing", billId), {
    paymentStatus: status,
    updatedAt: Timestamp.now(),
  });
};

// ==================== FILE UPLOAD ====================

/**
 * Upload file to Firebase Storage
 * @param {File} file - File to upload
 * @param {string} path - Storage path (e.g., "prescriptions/patient123/file.pdf")
 * @returns {Promise<string>} Download URL
 */
export const uploadFile = async (file, path) => {
  try {
    const storageRef = ref(storage, path);
    const snapshot = await uploadBytes(storageRef, file);
    const downloadURL = await getDownloadURL(snapshot.ref);
    return downloadURL;
  } catch (error) {
    console.error("Error uploading file:", error);
    throw error;
  }
};

// ==================== SCHEDULE OPERATIONS ====================

/**
 * Create doctor schedule
 * @param {string} doctorId - Doctor ID
 * @param {object} scheduleData - Schedule details (date, startTime, endTime)
 * @returns {Promise<object>} Schedule object with ID
 */
export const createDoctorSchedule = async (doctorId, scheduleData) => {
  try {
    console.log('📅 [SCHEDULE] Creating schedule for doctor:', doctorId);
    const scheduleRef = await addDoc(collection(db, "schedules"), {
      doctorId,
      date: scheduleData.date || "",
      startTime: scheduleData.startTime || scheduleData.start_time || "",
      endTime: scheduleData.endTime || scheduleData.end_time || "",
      isAvailable: true,
      createdAt: Timestamp.now(),
      updatedAt: Timestamp.now(),
    });
    console.log('✅ [SCHEDULE] Schedule created:', scheduleRef.id);
    return {
      success: true,
      id: scheduleRef.id,
      ...scheduleData,
    };
  } catch (error) {
    console.error("❌ Error creating schedule:", error);
    return { success: false, error: error.message };
  }
};

/**
 * Create multiple hourly slots for a doctor (for testing/bulk creation)
 * @param {string} doctorId - Doctor ID
 * @param {string} date - Date to create slots for
 * @param {number} startHour - Start hour (0-23)
 * @param {number} endHour - End hour (0-23)
 * @returns {Promise<object>} Success status and count
 */
export const createHourlySlots = async (doctorId, date, startHour = 9, endHour = 17) => {
  try {
    console.log(`📅 [SLOTS] Creating hourly slots from ${startHour}:00 to ${endHour}:00 on ${date}`);
    const slots = [];
    
    for (let hour = startHour; hour < endHour; hour++) {
      const startTime = `${String(hour).padStart(2, '0')}:00`;
      const endTime = `${String(hour + 1).padStart(2, '0')}:00`;
      
      const scheduleRef = await addDoc(collection(db, "schedules"), {
        doctorId,
        date,
        startTime,
        endTime,
        isAvailable: true,
        createdAt: Timestamp.now(),
        updatedAt: Timestamp.now(),
      });
      
      slots.push({
        id: scheduleRef.id,
        startTime,
        endTime,
      });
    }
    
    console.log(`✅ [SLOTS] Created ${slots.length} hourly slots`);
    return {
      success: true,
      count: slots.length,
      slots,
    };
  } catch (error) {
    console.error("❌ Error creating hourly slots:", error);
    return { success: false, error: error.message };
  }
};

/**
 * Get doctor schedules
 * @param {string} doctorId - Doctor ID
 * @returns {Promise<array>} Array of schedule objects
 */
export const getDoctorSchedules = async (doctorId) => {
  try {
    const q = query(
      collection(db, "schedules"),
      where("doctorId", "==", doctorId),
      orderBy("date", "desc")
    );
    const querySnapshot = await getDocs(q);
    const schedules = [];

    querySnapshot.forEach((doc) => {
      schedules.push({
        id: doc.id,
        ...doc.data(),
      });
    });

    return schedules;
  } catch (error) {
    console.error("Error getting schedules:", error);
    return [];
  }
};

/**
 * Get available slots for doctor on date
 * @param {string} doctorId - Doctor ID
 * @param {string} date - Date to check
 * @returns {Promise<array>} Array of available time slots
 */
export const getDoctorAvailableSlots = async (doctorId, date) => {
  try {
    console.log('🔍 [SLOTS] Searching for available slots...');
    console.log('   Doctor ID:', doctorId);
    console.log('   Date:', date);
    console.log('   Date Type:', typeof date);

    // First, check if doctor has ANY schedules at all
    const allSchedulesQ = query(
      collection(db, "schedules"),
      where("doctorId", "==", doctorId)
    );
    const allSchedulesSnap = await getDocs(allSchedulesQ);
    console.log(`   Doctor has ${allSchedulesSnap.docs.length} TOTAL schedules`);
    
    // Log first few schedules to see their structure
    allSchedulesSnap.docs.slice(0, 3).forEach(doc => {
      const data = doc.data();
      console.log(`   Sample schedule:`, {
        id: doc.id,
        doctorId: data.doctorId,
        date: data.date,
        dateType: typeof data.date,
        startTime: data.startTime,
        isAvailable: data.isAvailable,
      });
    });

    // Try to find available slots for the specific date
    const q = query(
      collection(db, "schedules"),
      where("doctorId", "==", doctorId),
      where("date", "==", date),
      where("isAvailable", "==", true)
    );
    const querySnapshot = await getDocs(q);
    const slots = [];

    console.log(`   Found ${querySnapshot.docs.length} available slots for ${date}`);

    querySnapshot.forEach((doc) => {
      const data = doc.data();
      slots.push({
        id: doc.id,
        startTime: data.startTime,
        endTime: data.endTime,
      });
      console.log(`   Slot: ${data.startTime} - ${data.endTime}`);
    });

    console.log(`✓ [SLOTS] Returning ${slots.length} slots`);
    return slots;
  } catch (error) {
    console.error("❌ Error getting available slots:", error);
    console.error("   Error code:", error.code);
    console.error("   Error message:", error.message);
    return [];
  }
};

/**
 * Update schedule availability
 * @param {string} scheduleId - Schedule ID
 * @param {boolean} isAvailable - Availability status
 * @returns {Promise<boolean>} Success status
 */
export const updateScheduleAvailability = async (scheduleId, isAvailable) => {
  try {
    await updateDoc(doc(db, "schedules", scheduleId), {
      isAvailable,
      updatedAt: Timestamp.now(),
    });
    return { success: true };
  } catch (error) {
    console.error("Error updating schedule:", error);
    return { success: false, error: error.message };
  }
};

// ==================== ADMIN OPERATIONS ====================

/**
 * Get admin dashboard stats
 * @returns {Promise<object>} Admin statistics
 */
export const getAdminStats = async () => {
  try {
    console.log('📊 [ADMIN] Fetching dashboard stats...');
    
    // Get counts from all collections
    const patientsSnapshot = await getDocs(collection(db, "patients"));
    const doctorsSnapshot = await getDocs(collection(db, "doctors"));
    const appointmentsSnapshot = await getDocs(collection(db, "appointments"));
    const billingSnapshot = await getDocs(collection(db, "billing"));
    
    const totalPatients = patientsSnapshot.size;
    const totalDoctors = doctorsSnapshot.size;
    const totalAppointments = appointmentsSnapshot.size;
    const totalRevenue = Array.from(billingSnapshot.docs).reduce((sum, doc) => {
      return sum + (parseFloat(doc.data().amount) || 0);
    }, 0);
    
    // Get recent appointments
    const appointmentsQ = query(
      collection(db, "appointments"),
      orderBy("createdAt", "desc")
    );
    const recentAppointments = (await getDocs(appointmentsQ)).docs.slice(0, 10).map(doc => ({
      id: doc.id,
      ...doc.data()
    }));
    
    console.log('✅ [ADMIN] Stats retrieved');
    
    return {
      total_patients: totalPatients,
      total_doctors: totalDoctors,
      total_appointments: totalAppointments,
      total_revenue: totalRevenue.toFixed(2),
      recent_bookings: recentAppointments,
      status: 'success'
    };
  } catch (error) {
    console.error('❌ Error fetching admin stats:', error);
    return {
      total_patients: 0,
      total_doctors: 0,
      total_appointments: 0,
      total_revenue: 0,
      recent_bookings: [],
      error: error.message
    };
  }
};

/**
 * Get patient dashboard stats
 * @param {string} patientId - Patient ID
 * @returns {Promise<object>} Patient statistics
 */
export const getPatientDashboardStats = async (patientId) => {
  try {
    console.log('📊 [PATIENT] Fetching dashboard stats for:', patientId);
    
    // Get all doctors count
    const doctorsSnapshot = await getDocs(collection(db, "doctors"));
    console.log('   Doctors found:', doctorsSnapshot.size);
    
    // Get appointments for this patient (no compound where)
    const appointmentsQ = query(
      collection(db, "appointments"),
      where("patientId", "==", patientId)
    );
    const appointmentsSnapshot = await getDocs(appointmentsQ);
    const totalAppointments = appointmentsSnapshot.size;
    console.log('   Total appointments for patient:', totalAppointments);
    
    // Filter upcoming appointments in JavaScript (no index needed)
    const today = new Date().toISOString().split('T')[0];
    let upcomingCount = 0;
    
    appointmentsSnapshot.forEach((doc) => {
      const data = doc.data();
      if (data.date && data.date >= today) {
        upcomingCount++;
      }
    });
    
    console.log('   Upcoming appointments:', upcomingCount);
    console.log('✅ [PATIENT] Stats retrieved');
    
    return {
      appointments: totalAppointments,
      doctors: doctorsSnapshot.size,
      upcoming: upcomingCount,
    };
  } catch (error) {
    console.error('❌ Error fetching patient stats:', error);
    console.error('   Full error:', error);
    return {
      appointments: 0,
      doctors: 0,
      upcoming: 0,
      error: error.message
    };
  }
};

/**
 * Get doctor dashboard stats
 * @param {string} doctorId - Doctor ID
 * @returns {Promise<object>} Doctor statistics
 */
export const getDoctorDashboardStats = async (doctorId) => {
  try {
    console.log('📊 [DOCTOR] Fetching dashboard stats for auth doctor ID:', doctorId);

    const doctorProfileId = await resolveDoctorIdByAuthUid(doctorId);
    if (!doctorProfileId) {
      console.warn('   Doctor profile not found');
      return {
        total_appointments: 0,
        today_appointments: 0,
        pending_appointments: 0,
      };
    }

    // Get appointments for resolved doctor profile ID
    const appointmentsQ = query(
      collection(db, "appointments"),
      where("doctorId", "==", doctorProfileId)
    );
    const appointmentsSnapshot = await getDocs(appointmentsQ);
    const totalAppointments = appointmentsSnapshot.size;
    console.log('   Total appointments:', totalAppointments);

    // Filter today's and pending appointments in JavaScript
    const today = new Date().toISOString().split('T')[0];
    let todayCount = 0;
    let pendingCount = 0;

    appointmentsSnapshot.forEach((snapshotDoc) => {
      const data = snapshotDoc.data();
      const normalizedStatus = normalizeAppointmentStatus(data.status);
      if (data.date === today) {
        todayCount++;
      }
      if (normalizedStatus === "pending") {
        pendingCount++;
      }
    });

    console.log('   Today appointments:', todayCount);
    console.log('   Pending appointments:', pendingCount);
    console.log('✅ [DOCTOR] Stats retrieved');

    return {
      total_appointments: totalAppointments,
      today_appointments: todayCount,
      pending_appointments: pendingCount,
    };
  } catch (error) {
    console.error('❌ Error fetching doctor stats:', error);
    console.error('   Full error:', error);
    return {
      total_appointments: 0,
      today_appointments: 0,
      pending_appointments: 0,
      error: error.message
    };
  }
};

// ==================== PHARMACY/MEDICINES OPERATIONS ====================

/**
 * Get all medicines
 * @returns {Promise<array>} Array of medicine objects
 */
export const getMedicines = async () => {
  try {
    console.log('💊 [PHARMACY] Fetching medicines...');
    const medicinesSnapshot = await getDocs(collection(db, "medicines"));
    const medicines = [];

    medicinesSnapshot.forEach((doc) => {
      medicines.push({
        id: doc.id,
        ...doc.data(),
      });
    });

    console.log('✅ [PHARMACY] Fetched', medicines.length, 'medicines');
    return medicines;
  } catch (error) {
    console.error('❌ Error getting medicines:', error);
    return [];
  }
};

/**
 * Create pharmacy order
 * @param {string} patientId - Patient ID
 * @param {array} items - Array of {medicineId, quantity, price}
 * @returns {Promise<object>} Order object with ID
 */
export const createPharmacyOrder = async (patientId, items) => {
  try {
    console.log('💊 [ORDER] Creating pharmacy order for patient:', patientId);
    const orderRef = await addDoc(collection(db, "pharmacy_orders"), {
      patientId,
      items,
      totalAmount: items.reduce((sum, item) => sum + (item.price * item.quantity), 0),
      status: 'pending',
      createdAt: Timestamp.now(),
      updatedAt: Timestamp.now(),
    });

    console.log('✅ [ORDER] Order created:', orderRef.id);
    return {
      success: true,
      id: orderRef.id,
      items,
    };
  } catch (error) {
    console.error('❌ Error creating order:', error);
    return { success: false, error: error.message };
  }
};

// ==================== BILLING/BILLS OPERATIONS ====================

/**
 * Get patient bills
 * @param {string} patientId - Patient ID
 * @returns {Promise<array>} Array of bill objects
 */
export const getPatientBills = async (patientId) => {
  try {
    console.log('🧾 [BILLS] Fetching bills for patient:', patientId);
    const q = query(
      collection(db, "billing"),
      where("patientId", "==", patientId),
      orderBy("date", "desc")
    );
    const querySnapshot = await getDocs(q);
    const bills = [];

    querySnapshot.forEach((doc) => {
      bills.push({
        id: doc.id,
        ...doc.data(),
      });
    });

    console.log('✅ [BILLS] Fetched', bills.length, 'bills');
    return bills;
  } catch (error) {
    console.error('❌ Error getting bills:', error);
    return [];
  }
};

/**
 * Get patient medical records
 * @param {string} patientId - Patient ID
 * @returns {Promise<object>} Medical records object
 */
export const getPatientMedicalRecords = async (patientId) => {
  try {
    console.log('📋 [RECORDS] Fetching medical records for patient:', patientId);

    // Get prescriptions
    const prescriptionsQ = query(
      collection(db, "prescriptions"),
      where("patientId", "==", patientId)
    );
    const prescriptionsSnap = await getDocs(prescriptionsQ);
    const prescriptions = prescriptionsSnap.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));

    // Get appointments (as medical history)
    const appointmentsQ = query(
      collection(db, "appointments"),
      where("patientId", "==", patientId)
    );
    const appointmentsSnap = await getDocs(appointmentsQ);
    const appointments = appointmentsSnap.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));

    // Get medical records
    const recordsQ = query(
      collection(db, "medical_records"),
      where("patientId", "==", patientId)
    );
    const recordsSnap = await getDocs(recordsQ);
    const records = recordsSnap.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));

    console.log('✅ [RECORDS] Fetched medical records');

    return {
      prescriptions,
      appointments,
      records,
    };
  } catch (error) {
    console.error('❌ Error getting medical records:', error);
    return {
      prescriptions: [],
      appointments: [],
      records: [],
      error: error.message,
    };
  }
};

// ==================== PRESCRIPTION OPERATIONS ====================

/**
 * Create prescription
 * @param {string} patientId - Patient ID
 * @param {string} appointmentId - Appointment ID
 * @param {object} prescriptionData - Prescription details
 * @returns {Promise<object>} Prescription object with ID
 */
export const createPrescription = async (patientId, appointmentId, prescriptionData) => {
  try {
    console.log('💊 [PRESCRIPTION] Creating prescription');
    const prescriptionRef = await addDoc(collection(db, "prescriptions"), {
      patientId,
      appointmentId,
      medicine: prescriptionData.medicine || "",
      quantity: prescriptionData.quantity || 0,
      notes: prescriptionData.notes || "",
      dosage: prescriptionData.dosage || "",
      createdAt: Timestamp.now(),
      updatedAt: Timestamp.now(),
    });

    console.log('✅ [PRESCRIPTION] Created:', prescriptionRef.id);
    return {
      success: true,
      id: prescriptionRef.id,
      ...prescriptionData,
    };
  } catch (error) {
    console.error('❌ Error creating prescription:', error);
    return { success: false, error: error.message };
  }
};

/**
 * Get doctor's appointments with patient details
 * @param {string} doctorId - Doctor ID
 * @returns {Promise<array>} Array of appointments with patient info
 */
export const getDoctorAppointmentsWithPatients = async (doctorId) => {
  try {
    console.log('📋 [DOCTOR_APPTS] Fetching appointments for auth doctor:', doctorId);

    const doctorProfileId = await resolveDoctorIdByAuthUid(doctorId);
    if (!doctorProfileId) {
      console.warn('⚠️ [DOCTOR_APPTS] Doctor profile not found for auth user');
      return [];
    }

    const q = query(
      collection(db, "appointments"),
      where("doctorId", "==", doctorProfileId)
    );
    const appointmentsSnap = await getDocs(q);
    const appointments = [];

    for (const appointmentDoc of appointmentsSnap.docs) {
      const apt = appointmentDoc.data();
      let patientName = "Unknown Patient";
      let patientUsername = "unknown";

      try {
        const patientUserDoc = await getDoc(doc(db, "users", apt.patientId));
        if (patientUserDoc.exists()) {
          const patientData = patientUserDoc.data();
          patientName = patientData.name || patientName;
          patientUsername = patientData.email ? patientData.email.split('@')[0] : patientUsername;
        }
      } catch (e) {
        console.warn('Could not fetch patient details');
      }

      appointments.push({
        id: appointmentDoc.id,
        ...apt,
        status: normalizeAppointmentStatus(apt.status),
        patient_name: apt.patient_name || patientName,
        patient_username: patientUsername,
        appointment_date: apt.date || null,
      });
    }

    console.log('✅ [DOCTOR_APPTS] Fetched', appointments.length, 'appointments');
    return sortAppointmentsDesc(appointments);
  } catch (error) {
    console.error('❌ Error getting doctor appointments:', error);
    return [];
  }
};

// ==================== TEST DATA HELPERS ====================

/**
 * Generate test data with sample schedules
 * Call this from console: firebaseService.generateTestData()
 * @returns {Promise<object>} Test data summary
 */
export const generateTestData = async () => {
  console.log('🧪 [TEST] Starting test data generation...');
  
  try {
    // Get all doctors
    const doctors = await getAllDoctors();
    console.log(`📋 Found ${doctors.length} doctors`);
    
    if (doctors.length === 0) {
      console.warn('⚠️ No doctors found. Add doctors first!');
      return { success: false, message: 'No doctors found' };
    }

    let totalSlotsCreated = 0;
    const today = new Date();
    const results = [];

    // Create schedules for each doctor for the next 7 days
    for (const doctor of doctors) {
      console.log(`\n📅 Creating schedules for doctor: ${doctor.name || doctor.id}`);
      
      const doctorSlots = [];
      
      // Create schedules for next 7 days
      for (let dayOffset = 0; dayOffset < 7; dayOffset++) {
        const date = new Date(today);
        date.setDate(date.getDate() + dayOffset);
        const dateString = date.toISOString().split('T')[0]; // Format: YYYY-MM-DD
        
        const result = await createHourlySlots(doctor.id, dateString, 9, 17);
        if (result.success) {
          doctorSlots.push({ date: dateString, count: result.count });
          totalSlotsCreated += result.count;
          console.log(`  ✓ ${result.count} slots for ${dateString}`);
        }
      }
      
      results.push({
        doctor: doctor.name || doctor.id,
        schedules: doctorSlots,
        totalSlots: doctorSlots.reduce((sum, s) => sum + s.count, 0),
      });
    }

    console.log(`\n✅ [TEST] Data generation complete!`);
    console.log(`   Total doctors: ${doctors.length}`);
    console.log(`   Total slots created: ${totalSlotsCreated}`);
    
    return {
      success: true,
      totalDoctors: doctors.length,
      totalSlotsCreated,
      results,
    };
  } catch (error) {
    console.error('❌ Error generating test data:', error);
    return { success: false, error: error.message };
  }
};

/**
 * Check appointment booking readiness
 * Call from console: firebaseService.checkBookingStatus()
 * @returns {Promise<object>} Status report
 */
export const checkBookingStatus = async () => {
  console.log('🔍 [CHECK] Checking appointment booking status...');
  
  try {
    const doctors = await getAllDoctors();
    const today = new Date().toISOString().split('T')[0];
    
    console.log(`\n📊 Status Report:`);
    console.log(`   Total doctors: ${doctors.length}`);
    
    for (const doctor of doctors) {
      const schedules = await getDoctorSchedules(doctor.id);
      const todaySlots = await getDoctorAvailableSlots(doctor.id, today);
      
      console.log(`\n   Doctor: ${doctor.name || doctor.id}`);
      console.log(`      Total schedules: ${schedules.length}`);
      console.log(`      Available today: ${todaySlots.length}`);
    }
    
    return {
      success: true,
      totalDoctors: doctors.length,
    };
  } catch (error) {
    console.error('❌ Error checking booking status:', error);
    return { success: false, error: error.message };
  }
};

// ==================== MEDICINES & DATABASE SETUP ====================

/**
 * Generate sample medicines for pharmacy
 * Call from console: firebaseService.generateSampleMedicines()
 * @returns {Promise<object>} Summary of medicines created
 */
export const generateSampleMedicines = async () => {
  console.log('💊 [MEDICINES] Starting medicine generation...');
  
  try {
    const sampleMedicines = [
      { name: 'Paracetamol 500mg', price: 50, stock: 100, expiry_date: '2025-12-31', description: 'Pain reliever and fever reducer' },
      { name: 'Ibuprofen 200mg', price: 80, stock: 75, expiry_date: '2025-11-30', description: 'Anti-inflammatory pain reliever' },
      { name: 'Amoxicillin 500mg', price: 120, stock: 50, expiry_date: '2025-10-15', description: 'Antibiotic for bacterial infections' },
      { name: 'Omeprazole 20mg', price: 150, stock: 60, expiry_date: '2026-01-31', description: 'Reduces stomach acid' },
      { name: 'Metformin 500mg', price: 140, stock: 80, expiry_date: '2025-12-15', description: 'Treatment for type 2 diabetes' },
      { name: 'Lisinopril 10mg', price: 200, stock: 45, expiry_date: '2025-09-30', description: 'Blood pressure medication' },
      { name: 'Aspirin 75mg', price: 40, stock: 120, expiry_date: '2026-03-31', description: 'Blood thinner and pain reliever' },
      { name: 'Atorvastatin 20mg', price: 180, stock: 55, expiry_date: '2025-11-20', description: 'Cholesterol management' },
      { name: 'Cough Syrup 100ml', price: 120, stock: 40, expiry_date: '2025-12-31', description: 'Cough and cold reliever' },
      { name: 'Vitamin D3 1000IU', price: 100, stock: 90, expiry_date: '2026-02-28', description: 'Vitamin D supplement' },
      { name: 'Multivitamin Tablet', price: 150, stock: 70, expiry_date: '2025-12-31', description: 'Daily multivitamin' },
      { name: 'Antihistamine 10mg', price: 90, stock: 65, expiry_date: '2025-10-31', description: 'Allergy and itch relief' },
      { name: 'Antacid Tablet', price: 60, stock: 85, expiry_date: '2026-01-15', description: 'Heartburn and indigestion relief' },
      { name: 'Antibiotic Cream', price: 110, stock: 50, expiry_date: '2025-11-30', description: 'Topical antibiotic for wounds' },
      { name: 'Pain Relief Gel 50g', price: 95, stock: 75, expiry_date: '2025-12-20', description: 'Topical pain relief' },
      { name: 'Blood Sugar Test Strip', price: 30, stock: 200, expiry_date: '2025-11-31', description: 'Glucose testing strips' },
    ];

    let createdCount = 0;
    const createdMedicines = [];

    for (const medicine of sampleMedicines) {
      try {
        const medicineRef = await addDoc(collection(db, "medicines"), {
          name: medicine.name,
          price: medicine.price,
          stock: medicine.stock,
          expiry_date: medicine.expiry_date,
          description: medicine.description,
          createdAt: Timestamp.now(),
          updatedAt: Timestamp.now(),
        });

        createdMedicines.push({
          id: medicineRef.id,
          ...medicine,
        });
        
        createdCount++;
        console.log(`  ✓ Created: ${medicine.name} (₹${medicine.price})`);
      } catch (error) {
        console.error(`  ✗ Failed to create ${medicine.name}:`, error.message);
      }
    }

    console.log(`\n✅ [MEDICINES] Medicine generation complete!`);
    console.log(`   Total medicines created: ${createdCount}/${sampleMedicines.length}`);
    
    return {
      success: true,
      created: createdCount,
      total: sampleMedicines.length,
      medicines: createdMedicines,
    };
  } catch (error) {
    console.error('❌ Error generating medicines:', error);
    return { success: false, error: error.message };
  }
};

/**
 * Check Firestore database structure
 * Call from console: firebaseService.checkDatabaseStructure()
 * @returns {Promise<object>} Database structure report
 */
export const checkDatabaseStructure = async () => {
  console.log('🔍 [DATABASE] Checking Firestore database structure...\n');
  
  try {
    const collections = [
      'users',
      'patients',
      'doctors',
      'appointments',
      'prescriptions',
      'medical_records',
      'billing',
      'schedules',
      'medicines',
      'pharmacy_orders',
    ];

    const report = {};

    for (const collectionName of collections) {
      try {
        const snapshot = await getDocs(collection(db, collectionName));
        const count = snapshot.size;
        const sampleDoc = snapshot.docs[0]?.data();

        report[collectionName] = {
          exists: true,
          documentCount: count,
          hasSampleData: count > 0,
          sampleFields: sampleDoc ? Object.keys(sampleDoc) : [],
        };

        console.log(`✓ ${collectionName.padEnd(20)} - ${count} documents`);
        if (sampleDoc) {
          console.log(`  Fields: ${Object.keys(sampleDoc).join(', ')}`);
        }
      } catch (error) {
        report[collectionName] = {
          exists: false,
          error: error.message,
        };
        console.log(`✗ ${collectionName.padEnd(20)} - NOT FOUND or ERROR`);
      }
    }

    console.log(`\n✅ [DATABASE] Report complete!\n`);
    
    return {
      success: true,
      timestamp: new Date().toISOString(),
      structure: report,
    };
  } catch (error) {
    console.error('❌ Error checking database:', error);
    return { success: false, error: error.message };
  }
};

/**
 * Complete HMS Setup - Creates everything needed for testing
 * Call from console: firebaseService.completeSetup()
 * @returns {Promise<object>} Complete setup report
 */
export const completeSetup = async () => {
  console.log('🚀 [SETUP] Starting complete HMS setup...\n');
  
  try {
    // Step 1: Check existing doctors
    console.log('👨‍⚕️ Step 1: Checking existing doctors...');
    let doctorsSnapshot = await getDocs(collection(db, "doctors"));
    let existingDoctorCount = doctorsSnapshot.size;
    
    console.log(`   Found ${existingDoctorCount} existing doctors`);

    // Step 2: Create doctors if none exist
    if (existingDoctorCount === 0) {
      console.log('   Creating sample doctors...');
      const sampleDoctors = [
        { name: 'Dr. Rajesh Kumar', specialization: 'Cardiologist', experience: 12, qualification: 'MD, FACC' },
        { name: 'Dr. Priya Singh', specialization: 'Pediatrician', experience: 8, qualification: 'MD, Pediatrics' },
        { name: 'Dr. Amit Sharma', specialization: 'Neurologist', experience: 15, qualification: 'MD, Neurology' },
        { name: 'Dr. Sneha Patel', specialization: 'Dermatologist', experience: 10, qualification: 'MD, DDVL' },
        { name: 'Dr. Vikram Singh', specialization: 'Orthopedist', experience: 14, qualification: 'MS, Orthopedics' },
      ];

      for (const doctorData of sampleDoctors) {
        try {
          await addDoc(collection(db, "doctors"), {
            name: doctorData.name,
            specialization: doctorData.specialization,
            experience: doctorData.experience,
            qualification: doctorData.qualification,
            bio: `Experienced ${doctorData.specialization} with ${doctorData.experience} years of practice`,
            phone: '9876543210',
            available: true,
            createdAt: Timestamp.now(),
          });
          console.log(`   ✓ Created: ${doctorData.name}`);
        } catch (error) {
          console.error(`   ✗ Failed to create ${doctorData.name}:`, error.message);
        }
      }
      
      // Refresh doctor list
      doctorsSnapshot = await getDocs(collection(db, "doctors"));
    }

    const doctors = doctorsSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    console.log(`\n📋 Total doctors now: ${doctors.length}`);

    // Step 3: Create schedules for all doctors
    console.log('\n📅 Step 2: Creating appointment slots...');
    const today = new Date();
    let totalSlotsCreated = 0;

    for (const doctor of doctors) {
      // Check if doctor already has schedules
      const existingSchedules = await getDocs(
        query(
          collection(db, "schedules"),
          where("doctorId", "==", doctor.id)
        )
      );

      if (existingSchedules.size === 0) {
        console.log(`   Creating schedules for ${doctor.name}...`);
        
        // Create schedules for next 7 days
        for (let dayOffset = 0; dayOffset < 7; dayOffset++) {
          const date = new Date(today);
          date.setDate(date.getDate() + dayOffset);
          const dateString = date.toISOString().split('T')[0];

          // Create hourly slots 9AM to 5PM
          for (let hour = 9; hour < 17; hour++) {
            const startTime = `${String(hour).padStart(2, '0')}:00`;
            const endTime = `${String(hour + 1).padStart(2, '0')}:00`;

            try {
              await addDoc(collection(db, "schedules"), {
                doctorId: doctor.id,
                date: dateString,
                startTime: startTime,
                endTime: endTime,
                isAvailable: true,
                createdAt: Timestamp.now(),
              });
              totalSlotsCreated++;
            } catch (error) {
              console.error(`      ✗ Failed to create slot:`, error.message);
            }
          }
        }
        console.log(`   ✓ Created 56 slots for ${doctor.name}`);
      } else {
        console.log(`   ✓ ${doctor.name} already has ${existingSchedules.size} schedules`);
      }
    }

    // Step 4: Create medicines
    console.log('\n💊 Step 3: Creating medicines...');
    const medicinesSnapshot = await getDocs(collection(db, "medicines"));
    
    if (medicinesSnapshot.size === 0) {
      console.log('   Creating sample medicines...');
      const sampleMedicines = [
        { name: 'Paracetamol 500mg', price: 50, stock: 100, expiry_date: '2025-12-31' },
        { name: 'Ibuprofen 200mg', price: 80, stock: 75, expiry_date: '2025-11-30' },
        { name: 'Amoxicillin 500mg', price: 120, stock: 50, expiry_date: '2025-10-15' },
        { name: 'Omeprazole 20mg', price: 150, stock: 60, expiry_date: '2026-01-31' },
        { name: 'Metformin 500mg', price: 140, stock: 80, expiry_date: '2025-12-15' },
        { name: 'Lisinopril 10mg', price: 200, stock: 45, expiry_date: '2025-09-30' },
        { name: 'Aspirin 75mg', price: 40, stock: 120, expiry_date: '2026-03-31' },
        { name: 'Atorvastatin 20mg', price: 180, stock: 55, expiry_date: '2025-11-20' },
        { name: 'Cough Syrup', price: 120, stock: 40, expiry_date: '2025-12-31' },
        { name: 'Vitamin D3', price: 100, stock: 90, expiry_date: '2026-02-28' },
      ];

      for (const medicine of sampleMedicines) {
        try {
          await addDoc(collection(db, "medicines"), {
            name: medicine.name,
            price: medicine.price,
            stock: medicine.stock,
            expiry_date: medicine.expiry_date,
            createdAt: Timestamp.now(),
          });
          console.log(`   ✓ Added: ${medicine.name}`);
        } catch (error) {
          console.error(`   ✗ Failed to add ${medicine.name}:`, error.message);
        }
      }
    } else {
      console.log(`   ✓ Already have ${medicinesSnapshot.size} medicines`);
    }

    console.log('\n✅ [SETUP] Complete!\n');
    console.log('🎯 Summary:');
    console.log(`   ✓ Doctors: ${doctors.length}`);
    console.log(`   ✓ Slots created: ${totalSlotsCreated}`);
    console.log('   ✓ Medicines: Ready');
    console.log('\n📝 Refresh the page to see updates!\n');

    return {
      success: true,
      doctorCount: doctors.length,
      slotsCreated: totalSlotsCreated,
    };
  } catch (error) {
    console.error('❌ Setup error:', error);
    return { success: false, error: error.message };
  }
};

/**
 * Debug slots issue - Shows exactly what's in the database
 * Call from console: firebaseService.debugSlots()
 * @returns {Promise<object>} Detailed debug info
 */
export const debugSlots = async () => {
  console.log('\n🔧 [DEBUG] Starting slots debugging...\n');
  
  try {
    // Check 1: Get all doctors
    console.log('📋 Check 1: Doctors in database');
    const doctorsSnap = await getDocs(collection(db, "doctors"));
    console.log(`   Total doctors: ${doctorsSnap.size}`);
    doctorsSnap.docs.forEach(doc => {
      console.log(`   - ${doc.data().name} (ID: ${doc.id})`);
    });

    // Check 2: Get all schedules
    console.log('\n📅 Check 2: Schedules in database');
    const schedulesSnap = await getDocs(collection(db, "schedules"));
    console.log(`   Total schedules: ${schedulesSnap.size}`);
    
    if (schedulesSnap.size > 0) {
      // Group by doctor
      const byDoctor = {};
      schedulesSnap.docs.forEach(doc => {
        const data = doc.data();
        if (!byDoctor[data.doctorId]) {
          byDoctor[data.doctorId] = [];
        }
        byDoctor[data.doctorId].push({
          date: data.date,
          startTime: data.startTime,
          endTime: data.endTime,
          isAvailable: data.isAvailable,
        });
      });

      Object.keys(byDoctor).forEach(doctorId => {
        console.log(`\n   Doctor ${doctorId}:`);
        const uniqueDates = [...new Set(byDoctor[doctorId].map(s => s.date))];
        console.log(`      Schedules for dates: ${uniqueDates.join(', ')}`);
        console.log(`      Total slots: ${byDoctor[doctorId].length}`);
        
        // Show sample
        const sample = byDoctor[doctorId][0];
        console.log(`      Sample: ${sample.startTime}-${sample.endTime} (available: ${sample.isAvailable})`);
      });
    } else {
      console.log('   ⚠️  NO SCHEDULES FOUND - This is the problem!');
      console.log('   Run: firebaseService.completeSetup() first');
    }

    // Check 3: Test query manually
    console.log('\n🧪 Check 3: Manual query test');
    if (doctorsSnap.size > 0 && schedulesSnap.size > 0) {
      const testDoctor = doctorsSnap.docs[0];
      const testDoctorId = testDoctor.id;
      const testDoctorName = testDoctor.data().name;
      
      console.log(`   Testing query for doctor: ${testDoctorName} (${testDoctorId})`);
      
      const today = new Date().toISOString().split('T')[0];
      console.log(`   Testing date: ${today}`);
      
      const testQ = query(
        collection(db, "schedules"),
        where("doctorId", "==", testDoctorId),
        where("date", "==", today),
        where("isAvailable", "==", true)
      );
      
      const testSnap = await getDocs(testQ);
      console.log(`   Query result: ${testSnap.size} slots found for today`);
      
      if (testSnap.size === 0) {
        // Check without availability filter
        const testQ2 = query(
          collection(db, "schedules"),
          where("doctorId", "==", testDoctorId),
          where("date", "==", today)
        );
        const testSnap2 = await getDocs(testQ2);
        console.log(`   Without availability filter: ${testSnap2.size} slots found`);
        
        if (testSnap2.size > 0) {
          const sample = testSnap2.docs[0].data();
          console.log(`   Sample schedule: isAvailable=${sample.isAvailable}`);
        }
      }
    }

    console.log('\n✅ [DEBUG] Debug complete!\n');
    
    return {
      success: true,
      doctorCount: doctorsSnap.size,
      scheduleCount: schedulesSnap.size,
    };
  } catch (error) {
    console.error('❌ Error during debug:', error);
    return { success: false, error: error.message };
  }
};

/**
 * Quick schedule creator - Force create schedules for all doctors
 * Call from console: firebaseService.quickCreateSchedules()
 */
export const quickCreateSchedules = async () => {
  console.log('\n⚡ [QUICK_SETUP] Force creating schedules for all doctors...\n');
  
  try {
    // Get all doctors
    const doctorsSnap = await getDocs(collection(db, "doctors"));
    console.log(`Found ${doctorsSnap.size} doctors`);
    
    if (doctorsSnap.size === 0) {
      console.log('❌ No doctors found! Create doctors first.');
      return { success: false, error: 'No doctors found' };
    }

    const today = new Date();
    let totalSlots = 0;

    // For each doctor
    for (const doctorDoc of doctorsSnap.docs) {
      const doctorId = doctorDoc.id;
      const doctorName = doctorDoc.data().name;
      
      console.log(`\n Creating schedule for: ${doctorName}`);

      // Create slots for next 7 days
      for (let dayOffset = 0; dayOffset < 7; dayOffset++) {
        const date = new Date(today);
        date.setDate(date.getDate() + dayOffset);
        const dateString = date.toISOString().split('T')[0]; // YYYY-MM-DD format
        
        // Create 8 hourly slots (9AM-5PM)
        for (let hour = 9; hour < 17; hour++) {
          const startTime = `${String(hour).padStart(2, '0')}:00`;
          const endTime = `${String(hour + 1).padStart(2, '0')}:00`;
          
          try {
            await addDoc(collection(db, "schedules"), {
              doctorId: doctorId,
              date: dateString,
              startTime: startTime,
              endTime: endTime,
              isAvailable: true,
              createdAt: Timestamp.now(),
            });
            totalSlots++;
          } catch (error) {
            console.error(`  ✗ Failed to create slot ${startTime}:`, error.message);
          }
        }
      }
      
      console.log(`  ✓ Created 56 slots for ${doctorName}`);
    }

    console.log(`\n✅ Total slots created: ${totalSlots}`);
    console.log('📝 Refresh the page to see slots!\n');

    return {
      success: true,
      doctorCount: doctorsSnap.size,
      slotsCreated: totalSlots,
    };
  } catch (error) {
    console.error('❌ Error:', error);
    return { success: false, error: error.message };
  }
};

/**
 * Verify doctor-schedule matching
 * Call from console: firebaseService.verifyDoctorScheduleMatch()
 */
export const verifyDoctorScheduleMatch = async () => {
  console.log('\n🔍 [VERIFY] Checking doctor-schedule relationship...\n');
  
  try {
    // Get all doctors
    const doctorsSnap = await getDocs(collection(db, "doctors"));
    console.log(`📋 Found ${doctorsSnap.size} doctors:\n`);
    
    const doctorsList = [];
    doctorsSnap.docs.forEach((doc, idx) => {
      const data = doc.data();
      doctorsList.push({ id: doc.id, ...data });
      console.log(`   ${idx + 1}. ${data.name}`);
      console.log(`      ID: ${doc.id}\n`);
    });

    // Get all schedules grouped by doctorId
    console.log(`\n📅 Checking schedules:\n`);
    const schedulesSnap = await getDocs(collection(db, "schedules"));
    console.log(`Total schedules in database: ${schedulesSnap.size}`);
    
    const schedulesByDoctor = {};
    schedulesSnap.docs.forEach(doc => {
      const data = doc.data();
      if (!schedulesByDoctor[data.doctorId]) {
        schedulesByDoctor[data.doctorId] = [];
      }
      schedulesByDoctor[data.doctorId].push(data);
    });

    console.log(`\n📊 Schedules by Doctor:\n`);
    Object.keys(schedulesByDoctor).forEach(doctorId => {
      const count = schedulesByDoctor[doctorId].length;
      const doctorName = doctorsList.find(d => d.id === doctorId)?.name || 'UNKNOWN';
      const sample = schedulesByDoctor[doctorId][0];
      
      console.log(`   Doctor: ${doctorName}`);
      console.log(`   ID: ${doctorId}`);
      console.log(`   Total slots: ${count}`);
      console.log(`   Sample: ${sample.date} at ${sample.startTime}-${sample.endTime}`);
      console.log(`   Available: ${sample.isAvailable}\n`);
    });

    // Test query
    console.log(`\n🧪 Testing query:\n`);
    if (doctorsList.length > 0) {
      const testDoctor = doctorsList[0];
      const today = new Date().toISOString().split('T')[0];
      
      console.log(`   Doctor: ${testDoctor.name} (${testDoctor.id})`);
      console.log(`   Date: ${today}`);
      
      const testQ = query(
        collection(db, "schedules"),
        where("doctorId", "==", testDoctor.id),
        where("date", "==", today),
        where("isAvailable", "==", true)
      );
      
      const testSnap = await getDocs(testQ);
      console.log(`   Query result: ${testSnap.size} slots found`);
      
      if (testSnap.size === 0) {
        // Try without availability filter
        const testQ2 = query(
          collection(db, "schedules"),
          where("doctorId", "==", testDoctor.id),
          where("date", "==", today)
        );
        const testSnap2 = await getDocs(testQ2);
        console.log(`   Without availability filter: ${testSnap2.size} slots`);
        
        // Try with tomorrow's date
        const tomorrow = new Date();
        tomorrow.setDate(tomorrow.getDate() + 1);
        const tomorrowStr = tomorrow.toISOString().split('T')[0];
        
        const testQ3 = query(
          collection(db, "schedules"),
          where("doctorId", "==", testDoctor.id),
          where("date", "==", tomorrowStr),
          where("isAvailable", "==", true)
        );
        const testSnap3 = await getDocs(testQ3);
        console.log(`   Tomorrow (${tomorrowStr}): ${testSnap3.size} slots\n`);
      }
    }

    console.log(`\n✅ [VERIFY] Complete!\n`);
    
    return {
      success: true,
      doctorCount: doctorsList.length,
      scheduleCount: schedulesSnap.size,
    };
  } catch (error) {
    console.error('❌ Error:', error);
    return { success: false, error: error.message };
  }
};
