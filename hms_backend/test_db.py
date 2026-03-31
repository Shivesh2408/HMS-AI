import os
import django

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'hms_backend.settings')
django.setup()

from core.models import Medicine, Prescription
from datetime import datetime, timedelta

# Check current data
print("=== BEFORE ===")
print(f"Medicines: {Medicine.objects.count()}")
print(f"Prescriptions: {Prescription.objects.count()}")

# Create a test medicine
medicine = Medicine.objects.create(
    name="Aspirin",
    price=5.00,
    stock=100,
    expiry_date=datetime.now().date() + timedelta(days=365)
)
print(f"\n✓ Created medicine: {medicine.name} (ID: {medicine.id})")

# Check after creation
print("\n=== AFTER ===")
print(f"Medicines: {Medicine.objects.count()}")

# List all medicines
print("\nAll medicines:")
for med in Medicine.objects.all():
    print(f"  - {med.id}: {med.name} (Stock: {med.stock}, Price: ${med.price})")
