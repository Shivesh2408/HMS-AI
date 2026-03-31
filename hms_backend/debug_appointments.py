import os
import django
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'hms_backend.settings')
django.setup()

from django.contrib.auth.models import User
from core.models import Appointment, UserProfile

# Check testuser
user = User.objects.get(username='testuser')
print('User:', user.username, user.email)

# Check profile
try:
    profile = user.profile
    print('Profile Role:', profile.role)
except:
    print('No profile found!')
    profile, created = UserProfile.objects.get_or_create(user=user)
    profile.role = 'patient'
    profile.save()
    print('Created profile with role: patient')

# Check appointments
appts = Appointment.objects.filter(patient_user=user)
print(f'\nAppointments for testuser: {appts.count()}')
for appt in appts:
    doctor_name = appt.doctor_user.first_name if appt.doctor_user else 'N/A'
    print(f'- {appt.date} {appt.time} with {doctor_name}')

# Check all appointments
all_appts = Appointment.objects.all()
print(f'\nTotal appointments in DB: {all_appts.count()}')
for appt in all_appts:
    if appt.patient_user:
        doc_name = appt.doctor_user.username if appt.doctor_user else 'N/A'
        print(f'Patient: {appt.patient_user.username}, Doctor: {doc_name}')
