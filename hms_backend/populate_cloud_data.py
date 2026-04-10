#!/usr/bin/env python
"""
Script to populate the cloud Render database with test data
Run: python populate_cloud_data.py
"""
import os
import django

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'hms_backend.settings')
django.setup()

from core.models import UserProfile, Doctor, Patient, Medicine
from django.contrib.auth.models import User

print("=" * 50)
print("HMS-AI: Populating Cloud Database")
print("=" * 50)

# Create Admin User
try:
    admin = User.objects.create_superuser('admin', 'admin@hms.com', 'admin')
    UserProfile.objects.create(user=admin, role='admin')
    print("✓ Admin user created: admin / admin")
except:
    print("✓ Admin user already exists")

# Create Doctor
try:
    doctor_user = User.objects.create_user('doctor1', 'doctor@hms.com', 'doctor123')
    doctor = Doctor.objects.create(
        user=doctor_user,
        name='Dr. Ahmed Khan',
        phone='03001234567',
        available=True,
        bio='Senior Cardiologist with 10+ years experience',
        experience='10+',
        specialization='Cardiology'
    )
    UserProfile.objects.create(user=doctor_user, role='doctor')
    print(f"✓ Doctor created: {doctor.name}")
except:
    print("✓ Doctor already exists")

# Create Patient
try:
    patient_user = User.objects.create_user('patient1', 'patient@hms.com', 'patient123')
    patient = Patient.objects.create(
        user=patient_user,
        age=35,
        gender='M',
        blood_type='O+',
        phone='03009876543'
    )
    UserProfile.objects.create(user=patient_user, role='patient')
    print(f"✓ Patient created: {patient.user.first_name or 'Patient'}")
except:
    print("✓ Patient already exists")

# Create Medicines
medicines_data = [
    {'name': 'Aspirin 500mg', 'price': 50, 'stock': 100},
    {'name': 'Paracetamol 500mg', 'price': 45, 'stock': 150},
    {'name': 'Ibuprofen 200mg', 'price': 60, 'stock': 80},
    {'name': 'Amoxicillin 500mg', 'price': 150, 'stock': 50},
    {'name': 'Metformin 500mg', 'price': 70, 'stock': 120},
    {'name': 'Lisinopril 10mg', 'price': 85, 'stock': 60},
    {'name': 'Atorvastatin 20mg', 'price': 95, 'stock': 75},
    {'name': 'Omeprazole 20mg', 'price': 80, 'stock': 90},
    {'name': 'Cialis 20mg', 'price': 200, 'stock': 30},
    {'name': 'Viagra 100mg', 'price': 250, 'stock': 25},
]

for med in medicines_data:
    Medicine.objects.get_or_create(
        name=med['name'],
        defaults={'price': med['price'], 'stock': med['stock'], 'expiry_date': '2025-12-31'}
    )

print(f"✓ Medicines: {Medicine.objects.count()} items in database")

print("\n" + "=" * 50)
print("✓ Cloud database populated successfully!")
print("=" * 50)
print("\nTest Credentials:")
print("  Admin: admin / admin")
print("  Doctor: doctor1 / doctor123")
print("  Patient: patient1 / patient123")
