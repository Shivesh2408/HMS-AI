"""
Firebase Service Module
Provides helper functions for CRUD operations and data management using Firebase.
Replaces Django ORM functionality with Firebase Firestore.
"""

import uuid
from datetime import datetime
from typing import Dict, List, Optional, Any
from firebase_config import get_firestore_client, get_auth
from firebase_admin import auth as firebase_auth
from google.cloud.exceptions import NotFound
import json

# Collection names
USERS_COLLECTION = 'users'
PATIENTS_COLLECTION = 'patients'
DOCTORS_COLLECTION = 'doctors'
APPOINTMENTS_COLLECTION = 'appointments'
MEDICAL_RECORDS_COLLECTION = 'medical_records'
BILLING_COLLECTION = 'billing'
PRESCRIPTIONS_COLLECTION = 'prescriptions'


class FirebaseService:
    """Service class for Firebase Firestore operations."""
    
    def __init__(self):
        self.db = get_firestore_client()
    
    # ==================== USER OPERATIONS ====================
    
    def create_user(self, email: str, password: str, user_data: Dict[str, Any]) -> Dict[str, Any]:
        """Create a new user with authentication."""
        try:
            # Create Firebase Auth user
            auth_user = firebase_auth.create_user(
                email=email,
                password=password
            )
            
            # Store user profile in Firestore
            user_profile = {
                'uid': auth_user.uid,
                'email': email,
                'role': user_data.get('role', 'patient'),
                'created_at': datetime.now().isoformat(),
                'updated_at': datetime.now().isoformat(),
                **{k: v for k, v in user_data.items() if k not in ['email', 'password']}
            }
            
            self.db.collection(USERS_COLLECTION).document(auth_user.uid).set(user_profile)
            
            return {
                'success': True,
                'uid': auth_user.uid,
                'email': email,
                'data': user_profile
            }
        except firebase_auth.EmailAlreadyExistsError:
            return {'success': False, 'error': 'Email already exists'}
        except Exception as e:
            return {'success': False, 'error': str(e)}
    
    def get_user(self, uid: str) -> Optional[Dict[str, Any]]:
        """Get user by UID."""
        try:
            doc = self.db.collection(USERS_COLLECTION).document(uid).get()
            return doc.to_dict() if doc.exists else None
        except Exception as e:
            print(f"Error getting user: {str(e)}")
            return None
    
    def get_user_by_email(self, email: str) -> Optional[Dict[str, Any]]:
        """Get user by email."""
        try:
            docs = self.db.collection(USERS_COLLECTION).where('email', '==', email).stream()
            for doc in docs:
                return doc.to_dict()
            return None
        except Exception as e:
            print(f"Error getting user by email: {str(e)}")
            return None
    
    def update_user(self, uid: str, data: Dict[str, Any]) -> bool:
        """Update user data."""
        try:
            data['updated_at'] = datetime.now().isoformat()
            self.db.collection(USERS_COLLECTION).document(uid).update(data)
            return True
        except Exception as e:
            print(f"Error updating user: {str(e)}")
            return False
    
    def delete_user(self, uid: str) -> bool:
        """Delete user and related data."""
        try:
            # Delete from Firebase Auth
            firebase_auth.delete_user(uid)
            
            # Delete from Firestore
            self.db.collection(USERS_COLLECTION).document(uid).delete()
            return True
        except Exception as e:
            print(f"Error deleting user: {str(e)}")
            return False
    
    # ==================== PATIENT OPERATIONS ====================
    
    def create_patient(self, user_id: str, patient_data: Dict[str, Any]) -> Dict[str, Any]:
        """Create patient profile."""
        try:
            patient_id = str(uuid.uuid4())
            patient = {
                'id': patient_id,
                'user_id': user_id,
                'name': patient_data.get('name', ''),
                'age': patient_data.get('age', 0),
                'gender': patient_data.get('gender', 'M'),
                'phone': patient_data.get('phone', ''),
                'email': patient_data.get('email', ''),
                'created_at': datetime.now().isoformat(),
                'updated_at': datetime.now().isoformat(),
            }
            
            self.db.collection(PATIENTS_COLLECTION).document(patient_id).set(patient)
            
            # Update user profile
            self.update_user(user_id, {'patient_id': patient_id, 'role': 'patient'})
            
            return {'success': True, 'data': patient}
        except Exception as e:
            return {'success': False, 'error': str(e)}
    
    def get_patient(self, patient_id: str) -> Optional[Dict[str, Any]]:
        """Get patient by ID."""
        try:
            doc = self.db.collection(PATIENTS_COLLECTION).document(patient_id).get()
            return doc.to_dict() if doc.exists else None
        except Exception as e:
            print(f"Error getting patient: {str(e)}")
            return None
    
    def get_patient_by_user_id(self, user_id: str) -> Optional[Dict[str, Any]]:
        """Get patient by user ID."""
        try:
            docs = self.db.collection(PATIENTS_COLLECTION).where('user_id', '==', user_id).stream()
            for doc in docs:
                return doc.to_dict()
            return None
        except Exception as e:
            print(f"Error getting patient by user_id: {str(e)}")
            return None
    
    def update_patient(self, patient_id: str, data: Dict[str, Any]) -> bool:
        """Update patient data."""
        try:
            data['updated_at'] = datetime.now().isoformat()
            self.db.collection(PATIENTS_COLLECTION).document(patient_id).update(data)
            return True
        except Exception as e:
            print(f"Error updating patient: {str(e)}")
            return False
    
    # ==================== DOCTOR OPERATIONS ====================
    
    def create_doctor(self, user_id: str, doctor_data: Dict[str, Any]) -> Dict[str, Any]:
        """Create doctor profile."""
        try:
            doctor_id = str(uuid.uuid4())
            doctor = {
                'id': doctor_id,
                'user_id': user_id,
                'name': doctor_data.get('name', ''),
                'specialization': doctor_data.get('specialization', ''),
                'phone': doctor_data.get('phone', ''),
                'email': doctor_data.get('email', ''),
                'experience': doctor_data.get('experience', 0),
                'qualification': doctor_data.get('qualification', ''),
                'bio': doctor_data.get('bio', ''),
                'available': doctor_data.get('available', True),
                'created_at': datetime.now().isoformat(),
                'updated_at': datetime.now().isoformat(),
            }
            
            self.db.collection(DOCTORS_COLLECTION).document(doctor_id).set(doctor)
            
            # Update user profile
            self.update_user(user_id, {'doctor_id': doctor_id, 'role': 'doctor'})
            
            return {'success': True, 'data': doctor}
        except Exception as e:
            return {'success': False, 'error': str(e)}
    
    def get_doctor(self, doctor_id: str) -> Optional[Dict[str, Any]]:
        """Get doctor by ID."""
        try:
            doc = self.db.collection(DOCTORS_COLLECTION).document(doctor_id).get()
            return doc.to_dict() if doc.exists else None
        except Exception as e:
            print(f"Error getting doctor: {str(e)}")
            return None
    
    def get_all_doctors(self) -> List[Dict[str, Any]]:
        """Get all doctors."""
        try:
            doctors = []
            docs = self.db.collection(DOCTORS_COLLECTION).stream()
            for doc in docs:
                doctors.append(doc.to_dict())
            return doctors
        except Exception as e:
            print(f"Error getting doctors: {str(e)}")
            return []
    
    def get_doctors_by_specialization(self, specialization: str) -> List[Dict[str, Any]]:
        """Get doctors by specialization."""
        try:
            doctors = []
            docs = self.db.collection(DOCTORS_COLLECTION).where(
                'specialization', '==', specialization
            ).stream()
            for doc in docs:
                doctors.append(doc.to_dict())
            return doctors
        except Exception as e:
            print(f"Error getting doctors by specialization: {str(e)}")
            return []
    
    def update_doctor(self, doctor_id: str, data: Dict[str, Any]) -> bool:
        """Update doctor data."""
        try:
            data['updated_at'] = datetime.now().isoformat()
            self.db.collection(DOCTORS_COLLECTION).document(doctor_id).update(data)
            return True
        except Exception as e:
            print(f"Error updating doctor: {str(e)}")
            return False
    
    # ==================== APPOINTMENT OPERATIONS ====================
    
    def create_appointment(self, appointment_data: Dict[str, Any]) -> Dict[str, Any]:
        """Create appointment."""
        try:
            appointment_id = str(uuid.uuid4())
            appointment = {
                'id': appointment_id,
                'patient_id': appointment_data.get('patient_id', ''),
                'doctor_id': appointment_data.get('doctor_id', ''),
                'date': appointment_data.get('date', ''),
                'time': appointment_data.get('time', ''),
                'status': appointment_data.get('status', 'pending'),
                'diagnosis': appointment_data.get('diagnosis', ''),
                'notes': appointment_data.get('notes', ''),
                'created_at': datetime.now().isoformat(),
                'updated_at': datetime.now().isoformat(),
            }
            
            self.db.collection(APPOINTMENTS_COLLECTION).document(appointment_id).set(appointment)
            
            return {'success': True, 'data': appointment}
        except Exception as e:
            return {'success': False, 'error': str(e)}
    
    def get_appointment(self, appointment_id: str) -> Optional[Dict[str, Any]]:
        """Get appointment by ID."""
        try:
            doc = self.db.collection(APPOINTMENTS_COLLECTION).document(appointment_id).get()
            return doc.to_dict() if doc.exists else None
        except Exception as e:
            print(f"Error getting appointment: {str(e)}")
            return None
    
    def get_patient_appointments(self, patient_id: str) -> List[Dict[str, Any]]:
        """Get all appointments for a patient."""
        try:
            appointments = []
            docs = self.db.collection(APPOINTMENTS_COLLECTION).where(
                'patient_id', '==', patient_id
            ).stream()
            for doc in docs:
                appointments.append(doc.to_dict())
            return appointments
        except Exception as e:
            print(f"Error getting patient appointments: {str(e)}")
            return []
    
    def get_doctor_appointments(self, doctor_id: str) -> List[Dict[str, Any]]:
        """Get all appointments for a doctor."""
        try:
            appointments = []
            docs = self.db.collection(APPOINTMENTS_COLLECTION).where(
                'doctor_id', '==', doctor_id
            ).stream()
            for doc in docs:
                appointments.append(doc.to_dict())
            return appointments
        except Exception as e:
            print(f"Error getting doctor appointments: {str(e)}")
            return []
    
    def update_appointment(self, appointment_id: str, data: Dict[str, Any]) -> bool:
        """Update appointment data."""
        try:
            data['updated_at'] = datetime.now().isoformat()
            self.db.collection(APPOINTMENTS_COLLECTION).document(appointment_id).update(data)
            return True
        except Exception as e:
            print(f"Error updating appointment: {str(e)}")
            return False
    
    def cancel_appointment(self, appointment_id: str) -> bool:
        """Cancel appointment."""
        return self.update_appointment(appointment_id, {'status': 'cancelled'})
    
    # ==================== MEDICAL RECORDS OPERATIONS ====================
    
    def create_medical_record(self, record_data: Dict[str, Any]) -> Dict[str, Any]:
        """Create medical record."""
        try:
            record_id = str(uuid.uuid4())
            record = {
                'id': record_id,
                'patient_id': record_data.get('patient_id', ''),
                'diagnosis': record_data.get('diagnosis', ''),
                'treatment': record_data.get('treatment', ''),
                'notes': record_data.get('notes', ''),
                'created_at': datetime.now().isoformat(),
                'updated_at': datetime.now().isoformat(),
            }
            
            self.db.collection(MEDICAL_RECORDS_COLLECTION).document(record_id).set(record)
            
            return {'success': True, 'data': record}
        except Exception as e:
            return {'success': False, 'error': str(e)}
    
    def get_patient_medical_records(self, patient_id: str) -> List[Dict[str, Any]]:
        """Get all medical records for a patient."""
        try:
            records = []
            docs = self.db.collection(MEDICAL_RECORDS_COLLECTION).where(
                'patient_id', '==', patient_id
            ).stream()
            for doc in docs:
                records.append(doc.to_dict())
            return records
        except Exception as e:
            print(f"Error getting medical records: {str(e)}")
            return []
    
    # ==================== BILLING OPERATIONS ====================
    
    def create_bill(self, bill_data: Dict[str, Any]) -> Dict[str, Any]:
        """Create billing record."""
        try:
            bill_id = str(uuid.uuid4())
            bill = {
                'id': bill_id,
                'appointment_id': bill_data.get('appointment_id', ''),
                'patient_id': bill_data.get('patient_id', ''),
                'amount': bill_data.get('amount', 0),
                'payment_status': bill_data.get('payment_status', 'pending'),
                'date': bill_data.get('date', datetime.now().isoformat()),
                'created_at': datetime.now().isoformat(),
                'updated_at': datetime.now().isoformat(),
            }
            
            self.db.collection(BILLING_COLLECTION).document(bill_id).set(bill)
            
            return {'success': True, 'data': bill}
        except Exception as e:
            return {'success': False, 'error': str(e)}
    
    def get_patient_bills(self, patient_id: str) -> List[Dict[str, Any]]:
        """Get all bills for a patient."""
        try:
            bills = []
            docs = self.db.collection(BILLING_COLLECTION).where(
                'patient_id', '==', patient_id
            ).stream()
            for doc in docs:
                bills.append(doc.to_dict())
            return bills
        except Exception as e:
            print(f"Error getting bills: {str(e)}")
            return []
    
    def update_bill_status(self, bill_id: str, status: str) -> bool:
        """Update billing status."""
        return self.update_bill(bill_id, {'payment_status': status})
    
    def update_bill(self, bill_id: str, data: Dict[str, Any]) -> bool:
        """Update bill data."""
        try:
            data['updated_at'] = datetime.now().isoformat()
            self.db.collection(BILLING_COLLECTION).document(bill_id).update(data)
            return True
        except Exception as e:
            print(f"Error updating bill: {str(e)}")
            return False
    
    # ==================== PRESCRIPTION OPERATIONS ====================
    
    def create_prescription(self, prescription_data: Dict[str, Any]) -> Dict[str, Any]:
        """Create prescription."""
        try:
            prescription_id = str(uuid.uuid4())
            prescription = {
                'id': prescription_id,
                'appointment_id': prescription_data.get('appointment_id', ''),
                'patient_id': prescription_data.get('patient_id', ''),
                'doctor_id': prescription_data.get('doctor_id', ''),
                'medicines': prescription_data.get('medicines', []),
                'notes': prescription_data.get('notes', ''),
                'created_at': datetime.now().isoformat(),
                'updated_at': datetime.now().isoformat(),
            }
            
            self.db.collection(PRESCRIPTIONS_COLLECTION).document(prescription_id).set(prescription)
            
            return {'success': True, 'data': prescription}
        except Exception as e:
            return {'success': False, 'error': str(e)}
    
    def get_patient_prescriptions(self, patient_id: str) -> List[Dict[str, Any]]:
        """Get all prescriptions for a patient."""
        try:
            prescriptions = []
            docs = self.db.collection(PRESCRIPTIONS_COLLECTION).where(
                'patient_id', '==', patient_id
            ).stream()
            for doc in docs:
                prescriptions.append(doc.to_dict())
            return prescriptions
        except Exception as e:
            print(f"Error getting prescriptions: {str(e)}")
            return []
    
    def get_appointment_prescription(self, appointment_id: str) -> Optional[Dict[str, Any]]:
        """Get prescription for an appointment."""
        try:
            docs = self.db.collection(PRESCRIPTIONS_COLLECTION).where(
                'appointment_id', '==', appointment_id
            ).stream()
            for doc in docs:
                return doc.to_dict()
            return None
        except Exception as e:
            print(f"Error getting appointment prescription: {str(e)}")
            return None


# Create a singleton instance
_service_instance = None

def get_firebase_service() -> FirebaseService:
    """Get or create Firebase service instance."""
    global _service_instance
    if _service_instance is None:
        _service_instance = FirebaseService()
    return _service_instance
