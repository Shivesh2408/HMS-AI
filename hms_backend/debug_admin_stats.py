#!/usr/bin/env python
import os
import django

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'hms_backend.settings')
django.setup()

from django.contrib.auth.models import User
from core.models import Appointment, Patient, Doctor

print("=== Manual admin stats calculation ===\n")

admin_user = User.objects.get(username='Admin123')
print(f"Admin: {admin_user.username}\n")

try:
    total_patients = Patient.objects.count()
    total_doctors = Doctor.objects.count()
    total_appointments = Appointment.objects.count()
    
    status_breakdown = {
        'pending': Appointment.objects.filter(status='pending').count(),
        'accepted': Appointment.objects.filter(status='accepted').count(),
        'rejected': Appointment.objects.filter(status='rejected').count(),
        'completed': Appointment.objects.filter(status='completed').count(),
        'cancelled': Appointment.objects.filter(status='cancelled').count(),
    }
    
    recent_bookings = Appointment.objects.all().order_by('-created_at')[:5]
    print(f"Recent bookings count: {recent_bookings.count()}\n")
    
    recent_bookings_data = []
    for i, appt in enumerate(recent_bookings):
        print(f"Processing appointment {i+1}:")
        print(f"  appt.patient: {appt.patient}")
        print(f"  appt.patient_user: {appt.patient_user}")
        print(f"  appt.doctor: {appt.doctor}")
        print(f"  appt.doctor_user: {appt.doctor_user}")
        
        # Get patient name safely
        if appt.patient:
            patient_name = appt.patient.name
            print(f"  → patient_name from Patient model: {patient_name}")
        elif appt.patient_user:
            patient_name = appt.patient_user.first_name or appt.patient_user.username
            print(f"  → patient_name from User: {patient_name}")
        else:
            patient_name = "Unknown Patient"
            print(f"  → patient_name (unknown): {patient_name}")
        
        # Get doctor name safely
        if appt.doctor:
            doctor_name = appt.doctor.name
            print(f"  → doctor_name from Doctor model: {doctor_name}")
        elif appt.doctor_user:
            doctor_name = appt.doctor_user.first_name or appt.doctor_user.username
            print(f"  → doctor_name from User: {doctor_name}")
        else:
            doctor_name = "Unknown Doctor"
            print(f"  → doctor_name (unknown): {doctor_name}")
        
        recent_bookings_data.append({
            'id': appt.id,
            'patient': patient_name,
            'doctor': doctor_name,
            'date': str(appt.date),
            'time': str(appt.time),
            'status': appt.status,
            'created_at': str(appt.created_at) if appt.created_at else None
        })
        print()
    
    print("✓ SUCCESS! All data collected:\n")
    import json
    data = {
        'total_patients': total_patients,
        'total_doctors': total_doctors,
        'total_appointments': total_appointments,
        'status_breakdown': status_breakdown,
        'recent_bookings': recent_bookings_data
    }
    print(json.dumps(data, indent=2, default=str))
    
except Exception as e:
    print(f"✗ ERROR: {type(e).__name__}: {e}")
    import traceback
    traceback.print_exc()
