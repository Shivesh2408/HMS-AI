import os
from pathlib import Path
from dotenv import load_dotenv
import google.generativeai as genai
from rest_framework import viewsets
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from rest_framework.authtoken.models import Token
from django.contrib.auth.models import User
from django.contrib.auth import authenticate
from django.db.models import Sum, Count
from datetime import datetime, timedelta
from .models import (
    Patient,
    Doctor,
    Appointment,
    Billing,
    MedicalRecord,
    ChatLog,
    SecurityManager,
    UserProfile,
    Medicine,
    Prescription,
    DoctorSchedule,
    Bill,
    BillItem,
    log_activity,
)
from .serializers import (
    PatientSerializer,
    DoctorSerializer,
    AppointmentSerializer,
    BillingSerializer,
    MedicalRecordSerializer,
    ChatLogSerializer,
    SecurityManagerSerializer,
    UserSerializer,
    SignupSerializer,
    LoginSerializer,
    BookAppointmentSerializer,
    AppointmentDetailSerializer,
    DoctorListSerializer,
    MedicineSerializer,
    AddMedicineSerializer,
    PrescriptionSerializer,
    CreatePrescriptionSerializer,
    DoctorScheduleSerializer,
    AvailableSlotsSerializer,
    DoctorProfileSerializer,
    UpdateAppointmentStatusSerializer,
    BillSerializer,
    BillItemSerializer,
    CreateBillSerializer,
)

BASE_DIR = Path(__file__).resolve().parent.parent
load_dotenv(BASE_DIR / ".env")

API_KEY = os.getenv("GEMINI_API_KEY")


if API_KEY:
    genai.configure(api_key=API_KEY)
else:
    API_KEY = None


class PatientViewSet(viewsets.ModelViewSet):
    queryset = Patient.objects.all()
    serializer_class = PatientSerializer


class DoctorViewSet(viewsets.ModelViewSet):
    queryset = Doctor.objects.all()
    serializer_class = DoctorSerializer


class AppointmentViewSet(viewsets.ModelViewSet):
    queryset = Appointment.objects.all()
    serializer_class = AppointmentSerializer


class BillingViewSet(viewsets.ModelViewSet):
    queryset = Billing.objects.all()
    serializer_class = BillingSerializer


class MedicalRecordViewSet(viewsets.ModelViewSet):
    queryset = MedicalRecord.objects.all()
    serializer_class = MedicalRecordSerializer


class ChatLogViewSet(viewsets.ModelViewSet):
    queryset = ChatLog.objects.all()
    serializer_class = ChatLogSerializer


class SecurityManagerViewSet(viewsets.ModelViewSet):
    queryset = SecurityManager.objects.all()
    serializer_class = SecurityManagerSerializer


class SecurityLogsView(APIView):
    def get(self, request):
        try:
            logs = SecurityManager.objects.all().order_by('-timestamp')
            serializer = SecurityManagerSerializer(logs, many=True)
            return Response({
                'logs': serializer.data
            }, status=status.HTTP_200_OK)
        except Exception as e:
            print("SECURITY LOG ERROR:", str(e))
            return Response({
                'error': 'Error fetching security logs'
            }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


class ChatbotView(APIView):
    def get_fallback_response(self, user_message):
        """Generate fallback response based on keyword detection"""
        message_lower = user_message.lower()
        
        fallback_responses = {
            'headache': "You may be stressed or dehydrated. Stay hydrated and consult doctor if needed.",
            'vomiting': "Possible infection. Stay hydrated and consult doctor.",
            'chest pain': "Consult cardiologist immediately.",
        }
        
        for keyword, response in fallback_responses.items():
            if keyword in message_lower:
                return response
        
        return "Please consult a doctor for proper diagnosis."
    
    def post(self, request):
        try:
            user_message = request.data.get('message', '')
            
            if not user_message:
                return Response({
                    'reply': 'Please provide a message.'
                }, status=status.HTTP_200_OK)
            
            ai_reply = None
            
            # Try Gemini API
            if API_KEY:
                try:
                    model = genai.GenerativeModel("gemini-2.5-flash")
                    full_prompt = f"""You are an AI medical assistant.

User symptoms or concern: {user_message}

Please respond with:
- Possible causes (basic ideas only)
- What immediate steps to take
- Which type of doctor to consult
- Simple precautions

Keep your answer short and clear. 
IMPORTANT: Do NOT give a final diagnosis. Always remind the user to consult a doctor if symptoms are serious."""
                    response = model.generate_content(full_prompt)
                    ai_reply = response.text if response else None
                except Exception as e:
                    print(f"GEMINI ERROR: {type(e).__name__}: {str(e)}")
                    import traceback
                    traceback.print_exc()
                    ai_reply = None
            
            # Use fallback if Gemini fails or not configured
            if not ai_reply:
                ai_reply = self.get_fallback_response(user_message)
            
            # Save to database
            try:
                chat_log = ChatLog.objects.create(
                    message=user_message,
                    response=ai_reply
                )
                timestamp = chat_log.timestamp
            except Exception as db_error:
                print("DATABASE ERROR:", str(db_error))
                timestamp = None
            
            return Response({
                'reply': ai_reply,
                'timestamp': timestamp
            }, status=status.HTTP_200_OK)
        
        except Exception as e:
            print("CHATBOT ERROR:", str(e))
            return Response({
                'reply': 'Please consult a doctor for proper diagnosis.'
            }, status=status.HTTP_200_OK)


class SignupView(APIView):
    def post(self, request):
        try:
            print(f"[SIGNUP] Received request data: {request.data}")  # DEBUG
            
            serializer = SignupSerializer(data=request.data)
            if serializer.is_valid():
                user = serializer.save()
                token, _ = Token.objects.get_or_create(user=user)
                
                # Get role from profile - should match what was sent
                role = user.profile.role if hasattr(user, 'profile') else 'patient'
                
                # VALIDATE role is correct
                if role not in ['patient', 'doctor']:
                    print(f"[SIGNUP ERROR] Invalid role returned: {role}")
                    role = 'patient'  # Force patient as fallback
                
                print(f"[SIGNUP] Created user {user.username} with role {role}")  # DEBUG
                
                # Log signup activity
                try:
                    log_activity(user.id, 'login', request)
                except Exception as e:
                    print("Failed to log activity:", str(e))
                
                response_data = {
                    'token': token.key,
                    'role': role,  # EXPLICITLY only patient or doctor
                    'user': UserSerializer(user).data
                }
                
                print(f"[SIGNUP] Response role: {response_data['role']}")  # DEBUG
                
                return Response(response_data, status=status.HTTP_201_CREATED)
            else:
                print(f"[SIGNUP ERROR] Serializer errors: {serializer.errors}")
                return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
        except Exception as e:
            print("[SIGNUP EXCEPTION]:", str(e))
            import traceback
            traceback.print_exc()
            return Response({
                'error': 'An error occurred during signup. Please try again.'
            }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


class LoginView(APIView):
    def post(self, request):
        try:
            username = request.data.get('username', '')
            password = request.data.get('password', '')
            
            print(f"[LOGIN] Attempt for username: {username}")
            
            try:
                serializer = LoginSerializer(data=request.data)
                if not serializer.is_valid():
                    print(f"[LOGIN ERROR] Invalid serializer data: {serializer.errors}")
                    return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
            except Exception as e:
                print(f"[LOGIN] Serializer error: {str(e)}")
                import traceback
                traceback.print_exc()
                return Response({
                    'error': f'Serializer error: {str(e)}'
                }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
            
            try:
                user = authenticate(username=username, password=password)
            except Exception as e:
                print(f"[LOGIN] Auth error: {str(e)}")
                import traceback
                traceback.print_exc()
                return Response({
                    'error': f'Authentication error: {str(e)}'
                }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
            
            if user is not None:
                print(f"[LOGIN] User authenticated: {user.username}")
                try:
                    token, _ = Token.objects.get_or_create(user=user)
                except Exception as e:
                    print(f"[LOGIN] Token create error: {str(e)}")
                    import traceback
                    traceback.print_exc()
                    return Response({
                        'error': f'Token creation error: {str(e)}'
                    }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
                
                # Get or create profile with role
                try:
                    role = user.profile.role
                except:
                    # If profile doesn't exist, create one
                    UserProfile.objects.get_or_create(user=user, defaults={'role': 'admin' if user.is_superuser else 'patient'})
                    role = user.profile.role
                
                print(f"[LOGIN] User role: {role}")
                
                # Validate role
                if role not in ['patient', 'doctor', 'admin']:
                    role = 'patient'
                    print(f"[LOGIN] Role corrected to: {role}")
                
                # Log successful login
                try:
                    log_activity(user.id, 'login', request)
                except Exception as e:
                    print(f"[LOGIN] Failed to log activity: {str(e)}")
                
                response_data = {
                    'token': token.key,
                    'role': role,
                    'user': UserSerializer(user).data,
                    'userId': user.id
                }
                
                print(f"[LOGIN SUCCESS] User {user.username} logged in with role: {role}")
                return Response(response_data, status=status.HTTP_200_OK)
            else:
                print(f"[LOGIN FAILED] Authentication failed for username: {username}")
                try:
                    log_activity(None, 'failed_login', request)
                except Exception as e:
                    print(f"[LOGIN] Failed to log failed login attempt: {str(e)}")
                
                return Response({
                    'error': 'Invalid username or password.'
                }, status=status.HTTP_401_UNAUTHORIZED)
        except Exception as e:
            print(f"[LOGIN EXCEPTION] {str(e)}")
            import traceback
            traceback.print_exc()
            return Response({
                'error': str(e)
            }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


class DoctorListView(APIView):
    def get(self, request):
        try:
            # Fetch doctors from Doctor model
            doctors = Doctor.objects.all()
            doctors_data = []
            
            for doctor in doctors:
                doctors_data.append({
                    'id': doctor.id,
                    'name': doctor.name,
                    'specialization': doctor.specialization,
                    'phone': doctor.phone
                })
            
            return Response(doctors_data, status=status.HTTP_200_OK)
        except Exception as e:
            print("DOCTOR LIST ERROR:", str(e))
            return Response({
                'error': 'Failed to fetch doctors.'
            }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


class BookAppointmentView(APIView):
    def post(self, request):
        try:
            if not request.user.is_authenticated:
                print(f"[BOOK_APPOINTMENT] Unauthenticated request")
                return Response({
                    'error': 'Authentication required'
                }, status=status.HTTP_401_UNAUTHORIZED)
            
            print(f"[BOOK_APPOINTMENT] User {request.user.username} booking appointment")
            print(f"[BOOK_APPOINTMENT] Data: {request.data}")
            
            serializer = BookAppointmentSerializer(data=request.data, context={'request': request})
            if serializer.is_valid():
                appointment = serializer.save()
                print(f"[BOOK_APPOINTMENT] OK - Appointment created: ID={appointment.id}, Date={appointment.date}, Time={appointment.time}, Status={appointment.status}")
                return Response({
                    'message': 'Appointment booked successfully',
                    'appointment': {
                        'id': appointment.id,
                        'date': appointment.date,
                        'time': appointment.time,
                        'status': appointment.status
                    }
                }, status=status.HTTP_201_CREATED)
            else:
                print(f"[BOOK_APPOINTMENT] ✗ Validation failed: {serializer.errors}")
                return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
        except Exception as e:
            print("BOOK APPOINTMENT ERROR:", str(e))
            return Response({
                'error': 'Failed to book appointment'
            }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


class MyAppointmentsView(APIView):
    def get(self, request):
        try:
            if not request.user.is_authenticated:
                return Response({
                    'error': 'Authentication required'
                }, status=status.HTTP_401_UNAUTHORIZED)
            
            # Ensure user has a profile
            profile, created = UserProfile.objects.get_or_create(user=request.user)
            if created:
                profile.role = 'patient'
                profile.save()
            
            user_role = profile.role
            
            if user_role == 'patient':
                appointments = Appointment.objects.filter(patient_user=request.user).order_by('-date', '-time')
            elif user_role == 'doctor':
                appointments = Appointment.objects.filter(doctor_user=request.user).order_by('-date', '-time')
            else:
                appointments = Appointment.objects.none()
            
            serializer = AppointmentDetailSerializer(appointments, many=True)
            return Response(serializer.data, status=status.HTTP_200_OK)
        except Exception as e:
            print("MY APPOINTMENTS ERROR:", str(e))
            return Response({
                'error': 'Failed to fetch appointments'
            }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


class PatientStatsView(APIView):
    def get(self, request):
        try:
            if not request.user.is_authenticated:
                return Response({
                    'error': 'Authentication required'
                }, status=status.HTTP_401_UNAUTHORIZED)
            
            # Get patient's appointments count
            appointments_count = Appointment.objects.filter(patient_user=request.user).count()
            
            # Get total doctors count
            doctors_count = Doctor.objects.count()
            
            # Get upcoming appointments
            from datetime import date
            upcoming_count = Appointment.objects.filter(
                patient_user=request.user,
                date__gte=date.today()
            ).count()
            
            return Response({
                'appointments': appointments_count,
                'doctors': doctors_count,
                'upcoming': upcoming_count
            }, status=status.HTTP_200_OK)
        except Exception as e:
            print("PATIENT STATS ERROR:", str(e))
            return Response({
                'error': 'Failed to fetch stats'
            }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


class UpdateDiagnosisView(APIView):
    def put(self, request, appointment_id):
        try:
            if not request.user.is_authenticated:
                return Response({
                    'error': 'Authentication required'
                }, status=status.HTTP_401_UNAUTHORIZED)
            
            appointment = Appointment.objects.get(id=appointment_id)
            
            # Only doctor can update diagnosis
            if appointment.doctor_user != request.user:
                return Response({
                    'error': 'Only the assigned doctor can update diagnosis'
                }, status=status.HTTP_403_FORBIDDEN)
            
            diagnosis = request.data.get('diagnosis', '')
            notes = request.data.get('notes', '')
            
            appointment.diagnosis = diagnosis
            appointment.notes = notes
            appointment.status = 'completed'
            appointment.save()
            
            return Response({
                'message': 'Diagnosis updated successfully',
                'appointment': AppointmentDetailSerializer(appointment).data
            }, status=status.HTTP_200_OK)
        except Appointment.DoesNotExist:
            return Response({
                'error': 'Appointment not found'
            }, status=status.HTTP_404_NOT_FOUND)
        except Exception as e:
            print("UPDATE DIAGNOSIS ERROR:", str(e))
            return Response({
                'error': 'Failed to update diagnosis'
            }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


class MedicinesView(APIView):
    def get(self, request):
        try:
            medicines = Medicine.objects.all()
            serializer = MedicineSerializer(medicines, many=True)
            return Response(serializer.data, status=status.HTTP_200_OK)
        except Exception as e:
            print("GET MEDICINES ERROR:", str(e))
            return Response({
                'error': 'Failed to fetch medicines'
            }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


class AddMedicineView(APIView):
    def post(self, request):
        try:
            if not request.user.is_authenticated:
                return Response({
                    'error': 'Authentication required'
                }, status=status.HTTP_401_UNAUTHORIZED)
            
            serializer = AddMedicineSerializer(data=request.data)
            if serializer.is_valid():
                medicine = serializer.save()
                return Response({
                    'message': 'Medicine added successfully',
                    'medicine': MedicineSerializer(medicine).data
                }, status=status.HTTP_201_CREATED)
            else:
                return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
        except Exception as e:
            print("ADD MEDICINE ERROR:", str(e))
            return Response({
                'error': 'Failed to add medicine'
            }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


class CreateBillView(APIView):
    def post(self, request):
        try:
            if not request.user.is_authenticated:
                return Response({
                    'error': 'Authentication required'
                }, status=status.HTTP_401_UNAUTHORIZED)
            
            serializer = CreateBillSerializer(data=request.data, context={'request': request})
            if serializer.is_valid():
                bill = serializer.save()
                return Response({
                    'message': 'Bill created successfully',
                    'bill': BillSerializer(bill).data
                }, status=status.HTTP_201_CREATED)
            else:
                return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
        except Exception as e:
            print("CREATE BILL ERROR:", str(e))
            return Response({
                'error': 'Failed to create bill'
            }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


class MyBillsView(APIView):
    def get(self, request):
        try:
            if not request.user.is_authenticated:
                return Response({
                    'error': 'Authentication required'
                }, status=status.HTTP_401_UNAUTHORIZED)
            
            bills = Bill.objects.filter(patient_user=request.user).order_by('-date')
            serializer = BillSerializer(bills, many=True)
            return Response(serializer.data, status=status.HTTP_200_OK)
        except Exception as e:
            print("GET BILLS ERROR:", str(e))
            return Response({
                'error': 'Failed to fetch bills'
            }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


class PrescriptionView(APIView):
    def post(self, request):
        try:
            if not request.user.is_authenticated:
                return Response({
                    'error': 'Authentication required'
                }, status=status.HTTP_401_UNAUTHORIZED)
            
            serializer = CreatePrescriptionSerializer(data=request.data, context={'request': request})
            if serializer.is_valid():
                prescription = serializer.save()
                return Response({
                    'message': 'Prescription created successfully',
                    'prescription': PrescriptionSerializer(prescription).data
                }, status=status.HTTP_201_CREATED)
            else:
                return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
        except Exception as e:
            print("CREATE PRESCRIPTION ERROR:", str(e))
            return Response({
                'error': 'Failed to create prescription'
            }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


class AddScheduleView(APIView):
    def post(self, request):
        try:
            if not request.user.is_authenticated:
                return Response({
                    'error': 'Authentication required'
                }, status=status.HTTP_401_UNAUTHORIZED)
            
            # Check if user is a doctor
            if not hasattr(request.user, 'doctor_profile'):
                return Response({
                    'error': 'Only doctors can set schedule'
                }, status=status.HTTP_403_FORBIDDEN)
            
            doctor = request.user.doctor_profile
            date = request.data.get('date')
            start_time = request.data.get('start_time')
            end_time = request.data.get('end_time')
            
            if not date or not start_time or not end_time:
                return Response({
                    'error': 'Missing required fields: date, start_time, end_time'
                }, status=status.HTTP_400_BAD_REQUEST)
            
            # Delete existing schedule for this date
            DoctorSchedule.objects.filter(doctor=doctor, date=date).delete()
            
            # Create new schedule
            schedule = DoctorSchedule.objects.create(
                doctor=doctor,
                date=date,
                start_time=start_time,
                end_time=end_time
            )
            
            serializer = DoctorScheduleSerializer(schedule)
            return Response({
                'message': 'Schedule added successfully',
                'schedule': serializer.data
            }, status=status.HTTP_201_CREATED)
        except Exception as e:
            print("ADD SCHEDULE ERROR:", str(e))
            return Response({
                'error': 'Failed to add schedule'
            }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


class AvailableSlotsView(APIView):
    def get(self, request):
        try:
            doctor_id = request.query_params.get('doctor_id')
            date = request.query_params.get('date')
            
            if not doctor_id or not date:
                return Response({
                    'error': 'Missing required parameters: doctor_id, date'
                }, status=status.HTTP_400_BAD_REQUEST)
            
            try:
                doctor = Doctor.objects.get(id=doctor_id)
            except Doctor.DoesNotExist:
                return Response({
                    'error': 'Doctor not found'
                }, status=status.HTTP_404_NOT_FOUND)
            
            # Get schedule for this doctor on this date
            schedule = DoctorSchedule.objects.filter(doctor=doctor, date=date).first()
            
            if not schedule:
                return Response({
                    'slots': [],
                    'message': 'No schedule available for this date'
                }, status=status.HTTP_200_OK)
            
            # Generate time slots (30-minute intervals)
            from datetime import datetime, time, timedelta
            
            start_dt = datetime.combine(datetime.strptime(date, '%Y-%m-%d').date(), schedule.start_time)
            end_dt = datetime.combine(datetime.strptime(date, '%Y-%m-%d').date(), schedule.end_time)
            
            slot_duration = timedelta(minutes=30)
            slots = []
            current = start_dt
            
            while current < end_dt:
                slot_time = current.time()
                
                # Check if this slot is already booked
                booked = Appointment.objects.filter(
                    doctor=doctor,
                    date=date,
                    time=slot_time,
                    status__in=['scheduled', 'completed']
                ).exists()
                
                if not booked:
                    slots.append(str(slot_time))
                
                current += slot_duration
            
            return Response({
                'doctor_id': doctor_id,
                'date': date,
                'slots': slots
            }, status=status.HTTP_200_OK)
        except Exception as e:
            print("AVAILABLE SLOTS ERROR:", str(e))
            return Response({
                'error': 'Failed to fetch available slots'
            }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


class DoctorProfileView(APIView):
    def get(self, request):
        try:
            if not request.user.is_authenticated:
                return Response({'error': 'Authentication required'}, status=status.HTTP_401_UNAUTHORIZED)
            
            if not hasattr(request.user, 'doctor_profile'):
                return Response({'error': 'Not a doctor'}, status=status.HTTP_403_FORBIDDEN)
            
            doctor = request.user.doctor_profile
            serializer = DoctorProfileSerializer(doctor)
            return Response(serializer.data, status=status.HTTP_200_OK)
        except Exception as e:
            print("DOCTOR PROFILE GET ERROR:", str(e))
            return Response({'error': 'Failed to fetch profile'}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
    
    def put(self, request):
        try:
            if not request.user.is_authenticated:
                return Response({'error': 'Authentication required'}, status=status.HTTP_401_UNAUTHORIZED)
            
            if not hasattr(request.user, 'doctor_profile'):
                return Response({'error': 'Not a doctor'}, status=status.HTTP_403_FORBIDDEN)
            
            doctor = request.user.doctor_profile
            serializer = DoctorProfileSerializer(doctor, data=request.data, partial=True, context={'request': request})
            
            if serializer.is_valid():
                serializer.save()
                return Response({'message': 'Profile updated successfully', 'doctor': serializer.data}, status=status.HTTP_200_OK)
            else:
                return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
        except Exception as e:
            print("DOCTOR PROFILE PUT ERROR:", str(e))
            return Response({'error': 'Failed to update profile'}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


class DoctorAppointmentsView(APIView):
    def get(self, request):
        try:
            if not request.user.is_authenticated:
                print(f"[DOCTOR_APPOINTMENTS] Unauthenticated request")
                return Response({'error': 'Authentication required'}, status=status.HTTP_401_UNAUTHORIZED)
            
            print(f"[DOCTOR_APPOINTMENTS] Fetching for user: {request.user.username}")
            
            if not hasattr(request.user, 'doctor_profile'):
                print(f"[DOCTOR_APPOINTMENTS] User {request.user.username} is not a doctor")
                return Response({'error': 'Not a doctor'}, status=status.HTTP_403_FORBIDDEN)
            
            appointments = Appointment.objects.filter(doctor_user=request.user).order_by('-date', '-time')
            print(f"[DOCTOR_APPOINTMENTS] Found {len(appointments)} appointments for doctor {request.user.username}")
            
            serializer = AppointmentDetailSerializer(appointments, many=True)
            return Response(serializer.data, status=status.HTTP_200_OK)
        except Exception as e:
            print(f"[DOCTOR_APPOINTMENTS] ERROR: {str(e)}")
            import traceback
            traceback.print_exc()
            return Response({'error': 'Failed to fetch appointments'}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


class UpdateAppointmentStatusView(APIView):
    def post(self, request):
        try:
            if not request.user.is_authenticated:
                print(f"[UPDATE_APPOINTMENT_STATUS] Unauthenticated request")
                return Response({'error': 'Authentication required'}, status=status.HTTP_401_UNAUTHORIZED)
            
            print(f"[UPDATE_APPOINTMENT_STATUS] User {request.user.username} updating appointment")
            
            if not hasattr(request.user, 'doctor_profile'):
                print(f"[UPDATE_APPOINTMENT_STATUS] User {request.user.username} is not a doctor")
                return Response({'error': 'Only doctors can update status'}, status=status.HTTP_403_FORBIDDEN)
            
            appointment_id = request.data.get('appointment_id')
            new_status = request.data.get('status')
            
            print(f"[UPDATE_APPOINTMENT_STATUS] Appointment ID: {appointment_id}, New Status: {new_status}")
            
            if not appointment_id or not new_status:
                print(f"[UPDATE_APPOINTMENT_STATUS] Missing appointment_id or status")
                return Response({'error': 'Missing appointment_id or status'}, status=status.HTTP_400_BAD_REQUEST)
            
            if new_status not in ['accepted', 'rejected']:
                print(f"[UPDATE_APPOINTMENT_STATUS] Invalid status: {new_status}")
                return Response({'error': 'Invalid status. Must be accepted or rejected'}, status=status.HTTP_400_BAD_REQUEST)
            
            try:
                appointment = Appointment.objects.get(id=appointment_id, doctor_user=request.user)
                print(f"[UPDATE_APPOINTMENT_STATUS] Found appointment {appointment_id}")
            except Appointment.DoesNotExist:
                print(f"[UPDATE_APPOINTMENT_STATUS] Appointment {appointment_id} not found for doctor {request.user.username}")
                return Response({'error': 'Appointment not found'}, status=status.HTTP_404_NOT_FOUND)
            
            appointment.status = new_status
            appointment.save()
            print(f"[UPDATE_APPOINTMENT_STATUS] OK - Appointment {appointment_id} status updated to {new_status}")
            
            serializer = AppointmentDetailSerializer(appointment)
            return Response({
                'message': f'Appointment {new_status} successfully',
                'appointment': serializer.data
            }, status=status.HTTP_200_OK)
        except Exception as e:
            print("UPDATE APPOINTMENT STATUS ERROR:", str(e))
            return Response({'error': 'Failed to update appointment status'}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


class AdminStatsView(APIView):
    """
    Admin dashboard statistics endpoint.
    Returns: total patients, doctors, appointments, revenue, and recent activity.
    Only admins can access this.
    """
    def get(self, request):
        try:
            if not request.user.is_authenticated:
                return Response({'error': 'Authentication required'}, status=status.HTTP_401_UNAUTHORIZED)
            
            # Check if user is admin
            profile = getattr(request.user, 'profile', None)
            if profile is None or profile.role != 'admin':
                return Response({'error': 'Only admins can view stats'}, status=status.HTTP_403_FORBIDDEN)
            
            # Get basic stats
            total_patients = Patient.objects.count()
            total_doctors = Doctor.objects.count()
            total_appointments = Appointment.objects.count()
            
            # Get total revenue from bills
            revenue_result = Bill.objects.aggregate(total_revenue=Sum('total_amount'))
            total_revenue = float(revenue_result['total_revenue'] or 0)
            
            # Get recent bookings (last 5)
            recent_bookings = Appointment.objects.all().order_by('-created_at')[:5]
            
            # Get recent bills (last 5)
            recent_bills = Bill.objects.all().order_by('-date')[:5]
            
            # Appointment status breakdown
            status_breakdown = {
                'pending': Appointment.objects.filter(status='pending').count(),
                'accepted': Appointment.objects.filter(status='accepted').count(),
                'rejected': Appointment.objects.filter(status='rejected').count(),
                'completed': Appointment.objects.filter(status='completed').count(),
                'cancelled': Appointment.objects.filter(status='cancelled').count(),
            }
            
            # Build recent bookings data
            recent_bookings_data = []
            for appt in recent_bookings:
                # Get patient name safely
                if appt.patient:
                    patient_name = appt.patient.name
                elif appt.patient_user:
                    patient_name = appt.patient_user.first_name or appt.patient_user.username
                else:
                    patient_name = "Unknown Patient"
                
                # Get doctor name safely
                if appt.doctor:
                    doctor_name = appt.doctor.name
                elif appt.doctor_user:
                    doctor_name = appt.doctor_user.first_name or appt.doctor_user.username
                else:
                    doctor_name = "Unknown Doctor"
                
                recent_bookings_data.append({
                    'id': appt.id,
                    'patient': patient_name,
                    'doctor': doctor_name,
                    'date': appt.date,
                    'time': appt.time,
                    'status': appt.status,
                    'created_at': appt.created_at
                })
            
            # Build recent bills data
            recent_bills_data = []
            for bill in recent_bills:
                # Get patient name safely
                if bill.patient_user:
                    patient_name = bill.patient_user.first_name or bill.patient_user.username
                else:
                    patient_name = "Unknown Patient"
                
                recent_bills_data.append({
                    'id': bill.id,
                    'patient': patient_name,
                    'total_amount': float(bill.total_amount),
                    'date': bill.date
                })
            
            # Get daily appointments for the last 30 days
            thirty_days_ago = datetime.now() - timedelta(days=30)
            daily_appointments = Appointment.objects.filter(
                created_at__gte=thirty_days_ago
            ).extra(
                select={'date_': 'DATE(created_at)'}
            ).values('date_').annotate(count=Count('id')).order_by('date_')
            
            daily_appointments_data = [
                {'date': str(item['date_']), 'count': item['count']} 
                for item in daily_appointments
            ]
            
            # Get daily revenue for the last 30 days
            daily_revenue = Bill.objects.filter(
                date__gte=thirty_days_ago
            ).extra(
                select={'date_': 'DATE(date)'}
            ).values('date_').annotate(total=Sum('total_amount')).order_by('date_')
            
            daily_revenue_data = [
                {'date': str(item['date_']), 'total': float(item['total'] or 0)} 
                for item in daily_revenue
            ]
            
            stats_data = {
                'total_patients': total_patients,
                'total_doctors': total_doctors,
                'total_appointments': total_appointments,
                'total_revenue': total_revenue,
                'status_breakdown': status_breakdown,
                'recent_bookings': recent_bookings_data,
                'recent_bills': recent_bills_data,
                'daily_appointments': daily_appointments_data,
                'daily_revenue': daily_revenue_data
            }
            
            return Response(stats_data, status=status.HTTP_200_OK)
            
        except Exception as e:
            import traceback
            traceback.print_exc()
            return Response({'error': 'Failed to fetch admin stats'}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
