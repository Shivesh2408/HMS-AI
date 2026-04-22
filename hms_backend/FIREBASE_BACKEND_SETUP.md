# ✅ Firebase + Django Backend - Complete Setup Guide

## 📋 What Was Fixed

### 1. **✅ Firebase Configuration (.env)**
- Added all Firebase credentials
- Added service account key path
- Backend can now find your Firebase project

### 2. **✅ Firebase Auto-Initialization**
- Django now initializes Firebase on startup
- No manual calls needed
- Happens in `core/apps.py`

### 3. **✅ FirebaseService Ready**
- `firebase_service.py` has 30+ methods ready to use
- All CRUD operations for patients, doctors, appointments, etc.
- Proper error handling included

### 4. **✅ Example API Endpoints**
- Created `firebase_api_example.py`
- Shows real working examples you can copy
- Includes signup, login, appointments, etc.

---

## 🚀 Quick Start (5 minutes)

### Step 1: Download Service Account Key (2 minutes)
```
1. Go to: https://console.firebase.google.com/
2. Select "hms-ai-32e8c" project
3. Click "Settings" (gear icon) → "Service Accounts"
4. Click "Generate New Private Key"
5. Save downloaded JSON to: D:\HMS\serviceAccountKey.json
```

**That's it!** Django will auto-find it.

### Step 2: Install Dependencies (1 minute)
```powershell
cd D:\HMS\hms_backend
pip install -r requirements.txt
```

### Step 3: Start Django Backend (1 minute)
```powershell
python manage.py runserver 8000
```

**Expected output:**
```
✅ Firebase initialized successfully!
Starting development server at http://127.0.0.1:8000/
```

### Step 4: Test (1 minute)
```powershell
curl -X POST http://localhost:8000/api/signup/ \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "password": "password123",
    "name": "Test User",
    "phone": "1234567890",
    "role": "patient"
  }'
```

---

## 📚 Available Firebase Methods

All methods are in `FirebaseService` class. Use like this:

```python
from firebase_service import FirebaseService
firebase_service = FirebaseService()

# Create patient
result = firebase_service.create_patient(user_id, patient_data)

# Get all doctors
doctors = firebase_service.get_all_doctors()

# Create appointment
appointment = firebase_service.create_appointment(appointment_data)
```

### User Operations
- `create_user(email, password, user_data)` → Create user with auth
- `get_user(uid)` → Get user by ID
- `get_user_by_email(email)` → Find user by email
- `update_user(uid, data)` → Update user info
- `delete_user(uid)` → Delete user completely

### Patient Operations
- `create_patient(user_id, data)` → Create patient profile
- `get_patient(patient_id)` → Get patient by ID
- `get_patient_by_user_id(user_id)` → Get patient from Firebase user
- `update_patient(patient_id, data)` → Update patient info

### Doctor Operations
- `create_doctor(user_id, data)` → Create doctor profile
- `get_doctor(doctor_id)` → Get doctor by ID
- `get_all_doctors()` → Get all doctors
- `get_doctors_by_specialization(spec)` → Filter doctors
- `update_doctor(doctor_id, data)` → Update doctor info

### Appointment Operations
- `create_appointment(data)` → Create new appointment
- `get_appointment(appointment_id)` → Get appointment
- `get_patient_appointments(patient_id)` → All appointments for patient
- `get_doctor_appointments(doctor_id)` → All appointments for doctor
- `update_appointment(appointment_id, data)` → Update appointment
- `cancel_appointment(appointment_id)` → Cancel appointment

### Other Operations
- Prescriptions, Medical Records, Billing (same pattern)

---

## 🔧 Common Errors & How to Fix Them

### Error 1: "FIREBASE_SERVICE_ACCOUNT_KEY not set in .env"
**Cause:** Service account key file missing
**Fix:**
```
1. Download serviceAccountKey.json from Firebase Console
2. Save to: D:\HMS\serviceAccountKey.json
3. (Django auto-finds it - no need to change .env)
```

### Error 2: "Service account key file not found"
**Cause:** Wrong path in .env
**Fix:**
```
Check .env has:
FIREBASE_SERVICE_ACCOUNT_KEY=serviceAccountKey.json

OR full path:
FIREBASE_SERVICE_ACCOUNT_KEY=D:\HMS\serviceAccountKey.json
```

### Error 3: "Failed to get Firestore client"
**Cause:** Firebase not initialized
**Fix:**
Django auto-initializes on startup. If error persists:
```python
# At top of your view file:
from firebase_config import initialize_firebase
initialize_firebase()  # Then use FirebaseService
```

### Error 4: "Email already exists"
**Cause:** Account already registered
**Fix:**
Check if user is already in database, or catch error:
```python
result = firebase_service.create_user(...)
if not result['success']:
    if 'already exists' in result['error']:
        # Show user "account exists" message
        pass
```

---

## 📝 How to Add These to Existing Views

Replace your old Django ORM code:

### ❌ Old Way (Django ORM - doesn't work)
```python
from .models import Patient, Doctor
from rest_framework.views import APIView

class PatientView(APIView):
    def get(self, request, patient_id):
        patient = Patient.objects.get(id=patient_id)  # ❌ Won't work!
        return Response(patient)
```

### ✅ New Way (Firebase)
```python
from firebase_service import FirebaseService
from rest_framework.views import APIView

firebase_service = FirebaseService()

class PatientView(APIView):
    def get(self, request, patient_id):
        patient = firebase_service.get_patient(patient_id)  # ✅ Works!
        return Response(patient)
```

---

## 🧪 Testing Your Setup

### Test 1: Is Firebase initialized?
```powershell
python manage.py shell
>>> from firebase_config import initialize_firebase
>>> initialize_firebase()
# Should print: ✅ Firebase initialized successfully!
```

### Test 2: Can you get Firestore?
```powershell
python manage.py shell
>>> from firebase_config import get_firestore_client
>>> db = get_firestore_client()
>>> print(db)
# Should print: <google.cloud.firestore_v1.client.Client object at 0x...>
```

### Test 3: Can you create a user?
```powershell
python manage.py shell
>>> from firebase_service import FirebaseService
>>> fs = FirebaseService()
>>> result = fs.create_user(
...     email="testuser@example.com",
...     password="password123",
...     user_data={'name': 'Test', 'role': 'patient'}
... )
>>> print(result)
# Should show: {'success': True, 'uid': '...', ...}
```

---

## 📂 Files Modified/Created

| File | Status | What Changed |
|------|--------|--------------|
| `.env` | ✅ Updated | Added Firebase credentials |
| `core/apps.py` | ✅ Updated | Auto-initialize Firebase on startup |
| `core/__init__.py` | ✅ Updated | Added app config default |
| `firebase_config.py` | ✅ Updated | Better error messages, path resolution |
| `firebase_service.py` | ✅ Ready | No changes needed (works as-is) |
| `firebase_api_example.py` | ✅ NEW | Example endpoints to copy from |

---

## ✨ Next Steps

1. **Download serviceAccountKey.json** (see Quick Start Step 1)
2. **Run Django** with `python manage.py runserver 8000`
3. **Test signup** endpoint from `firebase_api_example.py`
4. **Copy examples** into your `core/views.py`
5. **Replace Django ORM** calls with Firebase calls

---

## 📞 Quick Reference

**Check if Firebase is working:**
- ✅ Django starts without Firebase error
- ✅ Can create users via API
- ✅ Can query Firestore from shell

**All data goes to Firebase:**
- Firestore Database: hms-ai-32e8c
- Collections: users, patients, doctors, appointments, prescriptions, medical_records, billing

**Authentication:**
- Email/password (Firebase Auth)
- Tokens auto-managed by Firebase
- No Django tokens needed

**Files to know:**
- `firebase_config.py` → Initialize Firebase
- `firebase_service.py` → All CRUD methods
- `firebase_api_example.py` → Copy these examples
- `.env` → Your credentials

---

## ✅ You're Ready!

Everything is set up. Just:
1. Download serviceAccountKey.json
2. Run Django
3. Test an endpoint
4. Start replacing Django ORM with Firebase

**Good luck! 🚀**
