#!/usr/bin/env python
import os
import sys
import django

# Add the project root to the Python path
sys.path.insert(0, os.path.dirname(__file__))

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'hms_backend.settings')
django.setup()

from django.contrib.auth.models import User
from core.models import Prescription, Medicine, Doctor
from datetime import datetime, timedelta

print("Creating sample prescriptions...")

try:
    # Get patient (use admin or first user with patient role)
    user = User.objects.filter(profile__role='patient').first()
    if not user:
        user = User.objects.all().first()
    
    if not user:
        print("ERROR: No users found")
        sys.exit(1)
    
    print(f"Patient: {user.username}")
    
    # Get doctor
    doctor_user = User.objects.filter(profile__role='doctor').first()
    if not doctor_user:
        doctor_user = user
    
    print(f"Doctor: {doctor_user.username}")
    
    # Get medicines
    medicines = Medicine.objects.all()[:3]
    
    if medicines.count() == 0:
        print("ERROR: No medicines found. Run setup_initial_data first")
        sys.exit(1)
    
    # Create prescriptions
    today = datetime.now()
    for i, med in enumerate(medicines):
        date = today - timedelta(days=i)
        
        prescription, created = Prescription.objects.update_or_create(
            patient_user=user,
            medicine=med,
            defaults={
                'quantity': 10 + (i * 5),
                'doctor_user': doctor_user,
                'notes': f'Take {i+1} tablet(s) twice daily with meals',
                'date': date
            }
        )
        
        status = "Created" if created else "Updated"
        print(f"✓ {status}: {med.name} x{prescription.quantity} on {prescription.date.date()}")
    
    print("\n✓ Sample prescriptions ready!")
    print("Refresh your browser to see Medical Records")
    
except Exception as e:
    print(f"ERROR: {str(e)}")
    import traceback
    traceback.print_exc()
    sys.exit(1)
