"""
EXAMPLE Firebase API Endpoints
This file shows how to use FirebaseService in Django REST views.
Copy these patterns into your core/views.py to replace Django ORM calls.
"""

from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from firebase_config import initialize_firebase
from firebase_service import FirebaseService


# Initialize Firebase
try:
    initialize_firebase()
except Exception as e:
    print(f"⚠️  Firebase will be initialized on first API call: {e}")

# Create Firebase service instance
firebase_service = FirebaseService()


# ==================== EXAMPLE 1: SIGNUP ====================

class SignupView(APIView):
    """
    POST /api/signup/
    Body: {
        "email": "user@example.com",
        "password": "password123",
        "name": "John Doe",
        "phone": "1234567890",
        "role": "patient"  # or "doctor"
    }
    """
    
    def post(self, request):
        try:
            email = request.data.get('email')
            password = request.data.get('password')
            name = request.data.get('name')
            phone = request.data.get('phone')
            role = request.data.get('role', 'patient')
            
            # Step 1: Create Firebase Auth user
            user_result = firebase_service.create_user(
                email=email,
                password=password,
                user_data={
                    'name': name,
                    'phone': phone,
                    'role': role,
                    'email': email
                }
            )
            
            if not user_result['success']:
                return Response(
                    {'error': user_result['error']},
                    status=status.HTTP_400_BAD_REQUEST
                )
            
            uid = user_result['uid']
            
            # Step 2: Create patient or doctor profile
            if role == 'patient':
                profile_result = firebase_service.create_patient(
                    user_id=uid,
                    patient_data={
                        'name': name,
                        'phone': phone,
                        'email': email,
                        'age': request.data.get('age', 0),
                        'gender': request.data.get('gender', 'M'),
                    }
                )
            else:  # doctor
                profile_result = firebase_service.create_doctor(
                    user_id=uid,
                    doctor_data={
                        'name': name,
                        'phone': phone,
                        'email': email,
                        'specialization': request.data.get('specialization', ''),
                        'experience': request.data.get('experience', 0),
                        'qualification': request.data.get('qualification', ''),
                    }
                )
            
            if not profile_result['success']:
                return Response(
                    {'error': profile_result['error']},
                    status=status.HTTP_400_BAD_REQUEST
                )
            
            return Response(
                {
                    'success': True,
                    'message': 'Signup successful',
                    'uid': uid,
                    'role': role
                },
                status=status.HTTP_201_CREATED
            )
        
        except Exception as e:
            return Response(
                {'error': f'Signup failed: {str(e)}'},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )


# ==================== EXAMPLE 2: GET ALL DOCTORS ====================

class DoctorListView(APIView):
    """
    GET /api/doctors/
    Returns: List of all doctors with specialization
    """
    
    def get(self, request):
        try:
            specialization = request.query_params.get('specialization')
            
            if specialization:
                doctors = firebase_service.get_doctors_by_specialization(specialization)
            else:
                doctors = firebase_service.get_all_doctors()
            
            return Response(
                {
                    'success': True,
                    'count': len(doctors),
                    'doctors': doctors
                },
                status=status.HTTP_200_OK
            )
        
        except Exception as e:
            return Response(
                {'error': f'Failed to fetch doctors: {str(e)}'},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )


# ==================== EXAMPLE 3: CREATE APPOINTMENT ====================

class CreateAppointmentView(APIView):
    """
    POST /api/appointments/
    Body: {
        "patient_id": "patient_uuid",
        "doctor_id": "doctor_uuid",
        "date": "2026-04-20",
        "time": "14:30",
        "reason": "Check-up"
    }
    """
    
    def post(self, request):
        try:
            appointment_result = firebase_service.create_appointment({
                'patient_id': request.data.get('patient_id'),
                'doctor_id': request.data.get('doctor_id'),
                'date': request.data.get('date'),
                'time': request.data.get('time'),
                'status': 'pending',
                'notes': request.data.get('reason', ''),
            })
            
            if not appointment_result['success']:
                return Response(
                    {'error': appointment_result['error']},
                    status=status.HTTP_400_BAD_REQUEST
                )
            
            return Response(
                {
                    'success': True,
                    'message': 'Appointment created',
                    'appointment': appointment_result['data']
                },
                status=status.HTTP_201_CREATED
            )
        
        except Exception as e:
            return Response(
                {'error': f'Failed to create appointment: {str(e)}'},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )


# ==================== EXAMPLE 4: GET PATIENT APPOINTMENTS ====================

class PatientAppointmentsView(APIView):
    """
    GET /api/patients/<patient_id>/appointments/
    Returns: All appointments for a patient
    """
    
    def get(self, request, patient_id):
        try:
            appointments = firebase_service.get_patient_appointments(patient_id)
            
            return Response(
                {
                    'success': True,
                    'count': len(appointments),
                    'appointments': appointments
                },
                status=status.HTTP_200_OK
            )
        
        except Exception as e:
            return Response(
                {'error': f'Failed to fetch appointments: {str(e)}'},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )


# ==================== HOW TO ADD TO urls.py ====================
"""
In hms_backend/urls.py, add:

from django.urls import path
from core.firebase_api_example import (
    SignupView,
    DoctorListView,
    CreateAppointmentView,
    PatientAppointmentsView,
)

urlpatterns = [
    # ... existing paths ...
    
    # Firebase API Examples
    path('api/signup/', SignupView.as_view(), name='firebase-signup'),
    path('api/doctors/', DoctorListView.as_view(), name='doctor-list'),
    path('api/appointments/', CreateAppointmentView.as_view(), name='create-appointment'),
    path('api/patients/<str:patient_id>/appointments/', PatientAppointmentsView.as_view(), name='patient-appointments'),
]
"""


# ==================== TESTING WITH CURL ====================
"""
# Test Signup
curl -X POST http://localhost:8000/api/signup/ \\
  -H "Content-Type: application/json" \\
  -d '{
    "email": "doctor@example.com",
    "password": "password123",
    "name": "Dr. Smith",
    "phone": "1234567890",
    "role": "doctor",
    "specialization": "Cardiology"
  }'

# Test Get Doctors
curl http://localhost:8000/api/doctors/

# Test Get Doctors by Specialization
curl "http://localhost:8000/api/doctors/?specialization=Cardiology"
"""
