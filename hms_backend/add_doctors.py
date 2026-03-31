import os
import django

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'hms_backend.settings')
django.setup()

from core.models import Doctor

SAMPLE_DOCTORS = [
    {'name': 'Dr. Rajesh Kumar', 'specialization': 'Cardiologist', 'phone': '9123456701'},
    {'name': 'Dr. Priya Sharma', 'specialization': 'Neurologist', 'phone': '9123456702'},
    {'name': 'Dr. Arun Verma', 'specialization': 'Orthopedic', 'phone': '9123456703'},
    {'name': 'Dr. Neha Patel', 'specialization': 'Pediatrician', 'phone': '9123456704'},
    {'name': 'Dr. Vikram Singh', 'specialization': 'Dermatologist', 'phone': '9123456705'},
    {'name': 'Dr. Anjali Mehta', 'specialization': 'ENT Specialist', 'phone': '9123456706'},
    {'name': 'Dr. Sameer Gupta', 'specialization': 'General Physician', 'phone': '9123456707'},
    {'name': 'Dr. Deepa Nair', 'specialization': 'Cardiologist', 'phone': '9123456708'},
    {'name': 'Dr. Rohit Joshi', 'specialization': 'Neurologist', 'phone': '9123456709'},
    {'name': 'Dr. Sneha Das', 'specialization': 'Pediatrician', 'phone': '9123456710'},
    {'name': 'Dr. Arjun Reddy', 'specialization': 'Orthopedic', 'phone': '9123456711'},
    {'name': 'Dr. Pooja Rao', 'specialization': 'Dermatologist', 'phone': '9123456712'},
    {'name': 'Dr. Sanjay Iyer', 'specialization': 'ENT Specialist', 'phone': '9123456713'},
    {'name': 'Dr. Meera Kapoor', 'specialization': 'General Physician', 'phone': '9123456714'},
    {'name': 'Dr. Harish Bhat', 'specialization': 'Cardiologist', 'phone': '9123456715'},
    {'name': 'Dr. Divya Singh', 'specialization': 'Neurologist', 'phone': '9123456716'},
    {'name': 'Dr. Nitin Pandey', 'specialization': 'Pediatrician', 'phone': '9123456717'},
    {'name': 'Dr. Shreya Gupta', 'specialization': 'Orthopedic', 'phone': '9123456718'},
    {'name': 'Dr. Karan Malhotra', 'specialization': 'Dermatologist', 'phone': '9123456719'},
    {'name': 'Dr. Ritika Sharma', 'specialization': 'ENT Specialist', 'phone': '9123456720'},
]

created_count = 0
skipped_count = 0

for doctor_data in SAMPLE_DOCTORS:
    doctor, created = Doctor.objects.get_or_create(
        name=doctor_data['name'],
        defaults={
            'specialization': doctor_data['specialization'],
            'phone': doctor_data['phone'],
        }
    )
    if created:
        created_count += 1
        print(f"✓ Created: {doctor.name} - {doctor.specialization}")
    else:
        skipped_count += 1
        print(f"✗ Skipped: {doctor.name} (already exists)")

print(f"\n{'='*50}")
print(f"Summary: {created_count} doctors created, {skipped_count} skipped")
print(f"Total doctors in database: {Doctor.objects.count()}")
print(f"{'='*50}")
