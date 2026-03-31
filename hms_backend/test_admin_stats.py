#!/usr/bin/env python
import os
import django
import json

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'hms_backend.settings')
django.setup()

from django.contrib.auth.models import User
from rest_framework.authtoken.models import Token
from core.models import Appointment, Patient, Doctor

print("=== Testing Admin Stats Endpoint ===\n")

# Get Admin123 user
admin_user = User.objects.get(username='Admin123')
print(f"✓ Found admin user: {admin_user.username}")
print(f"  Role: {admin_user.profile.role}")

# Get or create token
token, created = Token.objects.get_or_create(user=admin_user)
print(f"✓ Token: {token.key[:20]}...")

# Now manually calculate what the API should return
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
    
    print("\n✓ Stats Data (what API should return):")
    print(f"  Total Patients: {total_patients}")
    print(f"  Total Doctors: {total_doctors}")
    print(f"  Total Appointments: {total_appointments}")
    print(f"  Status Breakdown: {status_breakdown}")
    print(f"  Recent Bookings: {len(recent_bookings)} records")
    
except Exception as e:
    print(f"\n✗ Error calculating stats: {e}")
    import traceback
    traceback.print_exc()

print("\n=== Testing Frontend Call ===")
print(f"Frontend should call:")
print(f"  GET http://127.0.0.1:8000/api/admin/stats/")
print(f"  Header: Authorization: Token {token.key[:20]}...")
print(f"\nIf this fails, check:")
print(f"  1. Is backend running on port 8000?")
print(f"  2. Are CORS headers sent?")
print(f"  3. Is token valid?")
