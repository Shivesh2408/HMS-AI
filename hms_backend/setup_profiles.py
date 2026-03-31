import os
import django
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'hms_backend.settings')
django.setup()

from django.contrib.auth.models import User
from core.models import UserProfile, Appointment

# Create patient profile
patient = User.objects.get(username='testuser')
profile, created = UserProfile.objects.get_or_create(user=patient)
profile.role = 'patient'
profile.save()
print(f'Patient profile: {profile}')

# Check appointments
appts = Appointment.objects.filter(patient_user=patient)
print(f'Found {appts.count()} appointments for patient')
for appt in appts:
    print(f'- Appointment {appt.id}: {appt.date} {appt.time} with doctor {appt.doctor_user}')
