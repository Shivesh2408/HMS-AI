# Frontend Firebase Integration Guide

## Overview
This guide explains how to use Firebase in the HMS frontend React application.

## Files Created

### 1. `firebase.config.js`
- Initializes Firebase with your project credentials
- Exports: `auth`, `db`, `storage`, `analytics`
- Uses environment variables for configuration

### 2. `firebase.service.js`
- Service layer with all Firebase operations
- Grouped by feature (Auth, Users, Patients, Doctors, Appointments, etc.)
- Ready-to-use functions for frontend components

### 3. `.env.local`
- Local environment configuration (not committed to git)
- Contains Firebase API keys and configuration

## Setup Instructions

### 1. Install Dependencies
```bash
cd hms-frontend
npm install
```

This will install Firebase and all other dependencies listed in `package.json`.

### 2. Configure Environment Variables
The `.env.local` file is already set up with your Firebase credentials:
```
REACT_APP_FIREBASE_API_KEY=AIzaSyBDWSIZX11GHxFaJgR5cCQ9qtQhElr2wOE
REACT_APP_FIREBASE_AUTH_DOMAIN=hms-ai-32e8c.firebaseapp.com
REACT_APP_FIREBASE_PROJECT_ID=hms-ai-32e8c
... (and more)
```

### 3. Start the Application
```bash
npm start
```

The app will automatically load Firebase configuration from `.env.local`.

## Using Firebase in Components

### Example 1: Login
```jsx
import { loginUser } from './firebase.service';
import { useState } from 'react';

function LoginComponent() {
  const [loading, setLoading] = useState(false);

  const handleLogin = async (email, password) => {
    setLoading(true);
    const result = await loginUser(email, password);
    
    if (result.success) {
      console.log('Logged in:', result.uid);
      // Redirect to dashboard
      window.location.href = '/patient-dashboard';
    } else {
      console.error('Login failed:', result.error);
    }
    setLoading(false);
  };

  return (
    <button onClick={() => handleLogin('user@example.com', 'password')}>
      Login
    </button>
  );
}
```

### Example 2: Register
```jsx
import { registerUser } from './firebase.service';

async function handleSignup(email, password, name, role) {
  const result = await registerUser(email, password, {
    name,
    role,
    phone: '123-456-7890'
  });

  if (result.success) {
    console.log('User created:', result.uid);
    // Redirect to profile setup or dashboard
  } else {
    console.error('Registration failed:', result.error);
  }
}
```

### Example 3: Get Current User
```jsx
import { useEffect, useState } from 'react';
import { onAuthChange } from './firebase.service';

function UserProfile() {
  const [user, setUser] = useState(null);

  useEffect(() => {
    const unsubscribe = onAuthChange((currentUser) => {
      setUser(currentUser);
    });

    return unsubscribe;
  }, []);

  if (!user) return <div>Not logged in</div>;

  return <div>Welcome, {user.displayName}!</div>;
}
```

### Example 4: Create Patient Profile
```jsx
import { createPatient } from './firebase.service';

async function setupPatientProfile(userId, patientInfo) {
  const result = await createPatient(userId, {
    name: patientInfo.name,
    age: patientInfo.age,
    gender: patientInfo.gender,
    phone: patientInfo.phone,
    email: patientInfo.email,
    address: patientInfo.address
  });

  if (result.success) {
    console.log('Patient profile created:', result.id);
    return result.id;
  }
}
```

### Example 5: Get All Doctors
```jsx
import { getAllDoctors } from './firebase.service';
import { useEffect, useState } from 'react';

function DoctorsList() {
  const [doctors, setDoctors] = useState([]);

  useEffect(() => {
    const fetchDoctors = async () => {
      const doctorsList = await getAllDoctors();
      setDoctors(doctorsList);
    };
    fetchDoctors();
  }, []);

  return (
    <div>
      {doctors.map(doctor => (
        <div key={doctor.id}>
          <h3>{doctor.name}</h3>
          <p>{doctor.specialization}</p>
        </div>
      ))}
    </div>
  );
}
```

### Example 6: Book Appointment
```jsx
import { createAppointment } from './firebase.service';

async function bookAppointment(patientId, doctorId, date, time) {
  const result = await createAppointment({
    patientId,
    doctorId,
    date,
    time,
    status: 'pending'
  });

  if (result.success) {
    console.log('Appointment booked:', result.id);
    return result.id;
  } else {
    console.error('Failed to book appointment:', result.error);
  }
}
```

### Example 7: Get Patient Appointments
```jsx
import { getPatientAppointments } from './firebase.service';
import { useEffect, useState } from 'react';

function MyAppointments({ patientId }) {
  const [appointments, setAppointments] = useState([]);

  useEffect(() => {
    const fetchAppointments = async () => {
      const appts = await getPatientAppointments(patientId);
      setAppointments(appts);
    };
    fetchAppointments();
  }, [patientId]);

  return (
    <div>
      {appointments.map(appt => (
        <div key={appt.id}>
          <p>Date: {appt.date}</p>
          <p>Time: {appt.time}</p>
          <p>Status: {appt.status}</p>
        </div>
      ))}
    </div>
  );
}
```

## Available Functions

### Authentication
- `registerUser(email, password, userData)` - Register new user
- `loginUser(email, password)` - Login user
- `logoutUser()` - Logout current user
- `getCurrentUser()` - Get current user (Promise)
- `onAuthChange(callback)` - Listen to auth state changes

### Users
- `getUserById(uid)` - Get user by ID
- `updateUser(uid, data)` - Update user data

### Patients
- `createPatient(userId, patientData)` - Create patient profile
- `getPatientByUserId(userId)` - Get patient by user ID
- `updatePatient(patientId, data)` - Update patient data

### Doctors
- `createDoctor(userId, doctorData)` - Create doctor profile
- `getAllDoctors()` - Get all doctors
- `getDoctorsBySpecialization(specialization)` - Filter doctors
- `getDoctorById(doctorId)` - Get specific doctor
- `updateDoctor(doctorId, data)` - Update doctor data

### Appointments
- `createAppointment(appointmentData)` - Book appointment
- `getPatientAppointments(patientId)` - Get patient's appointments
- `getDoctorAppointments(doctorId)` - Get doctor's appointments
- `updateAppointment(appointmentId, data)` - Update appointment
- `cancelAppointment(appointmentId)` - Cancel appointment

### Prescriptions
- `createPrescription(prescriptionData)` - Create prescription
- `getPatientPrescriptions(patientId)` - Get patient's prescriptions

### Medical Records
- `createMedicalRecord(recordData)` - Create medical record
- `getPatientMedicalRecords(patientId)` - Get patient's records

### Billing
- `createBill(billData)` - Create bill
- `getPatientBills(patientId)` - Get patient's bills
- `updateBillStatus(billId, status)` - Update payment status

### Files
- `uploadFile(file, path)` - Upload file to Storage

## Firebase Collections Structure

```
users/
├── {uid}
│   ├── uid, email, name, role, createdAt, updatedAt
│
patients/
├── {patientId}
│   ├── userId, name, age, gender, phone, email, address, etc.
│
doctors/
├── {doctorId}
│   ├── userId, name, specialization, phone, experience, bio, etc.
│
appointments/
├── {appointmentId}
│   ├── patientId, doctorId, date, time, status, diagnosis, notes
│
prescriptions/
├── {prescriptionId}
│   ├── appointmentId, patientId, doctorId, medicines, notes
│
medical_records/
├── {recordId}
│   ├── patientId, diagnosis, treatment, notes
│
billing/
├── {billId}
│   ├── appointmentId, patientId, amount, paymentStatus, date
```

## Error Handling

All functions return objects with a `success` property. Always check this:

```jsx
const result = await loginUser(email, password);

if (result.success) {
  console.log('Success:', result.data);
} else {
  console.error('Error:', result.error);
}
```

## Real-time Updates

Use React's `useEffect` with `onAuthChange` or recreate queries in useEffect for real-time data:

```jsx
useEffect(() => {
  const unsubscribe = onAuthChange((user) => {
    if (user) {
      // User is logged in
      fetchUserData(user.uid);
    } else {
      // User is logged out
    }
  });

  return unsubscribe; // Cleanup
}, []);
```

## Security Notes

1. **Never commit `.env.local`** - It's already in `.gitignore`
2. **API keys are public** - They're meant to be in frontend code
3. **Security rules** - Control data access in Firestore security rules
4. **Authentication** - Firebase handles your password security
5. **Validation** - Always validate data on both client and server

## Firestore Security Rules

Set up in Firebase Console > Firestore > Rules:

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Users can only read/write their own document
    match /users/{userId} {
      allow read, write: if request.auth.uid == userId;
    }

    // Patients can only see their own data
    match /patients/{patientId} {
      allow read, write: if 
        request.auth.uid == resource.data.userId ||
        // Add doctor access if needed
        get(/databases/$(database)/documents/doctors/$(request.auth.uid)).data.exists();
    }

    // Doctors can read/write their own, all can read public info
    match /doctors/{doctorId} {
      allow read: if request.auth != null;
      allow write: if request.auth.uid == resource.data.userId;
    }

    // Allow read/write appointments for involved parties
    match /appointments/{appointmentId} {
      allow read: if 
        request.auth.uid == resource.data.patientId ||
        request.auth.uid == resource.data.doctorId;
      allow create: if request.auth != null;
      allow update, delete: if
        request.auth.uid == resource.data.patientId ||
        request.auth.uid == resource.data.doctorId;
    }

    // Deny all other access
    match /{document=**} {
      allow read, write: if false;
    }
  }
}
```

## Testing

Test Firebase functions locally:

```jsx
// In your browser console after app loads
import { loginUser, getAllDoctors } from './firebase.service';

// Test login
await loginUser('test@example.com', 'password123');

// Test getting doctors
const doctors = await getAllDoctors();
console.log(doctors);
```

## Troubleshooting

### Firebase not initialized
- Check `.env.local` has correct values
- Verify Firebase project has Firestore and Auth enabled

### Permission denied errors
- Check Firestore security rules
- Ensure user is authenticated
- Verify user ID matches document

### Functions returning empty
- Check Firestore has data in the collection
- Verify field names match your database structure
- Check browser console for errors

## Next Steps

1. Update `Login.jsx` to use `loginUser()`
2. Update `Signup.jsx` to use `registerUser()`
3. Replace all Django API calls with Firebase service functions
4. Update protected routes to check Firebase auth
5. Migrate existing data from SQL database to Firestore

## Support
- [Firebase Docs](https://firebase.google.com/docs)
- [Firestore Docs](https://firebase.google.com/docs/firestore)
- [Firebase Auth Docs](https://firebase.google.com/docs/auth)
- [React Firebase Integration](https://firebase.google.com/docs/web/setup)
