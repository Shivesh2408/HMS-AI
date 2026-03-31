import os
import django
import json
import urllib.request
import urllib.error

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'hms_backend.settings')
django.setup()

from django.contrib.auth.models import User
from rest_framework.authtoken.models import Token
from core.models import Medicine, Prescription

# Get or create test user and establish as patient
user, created = User.objects.get_or_create(
    username='testpharma',
    defaults={'email': 'testpharma@test.com', 'first_name': 'Test', 'last_name': 'Patient'}
)
token, _ = Token.objects.get_or_create(user=user)

print(f"Test Patient: {user.username} (ID: {user.id})")
print(f"Token: {token.key}\n")

# Get medicine
medicines = Medicine.objects.all()
if not medicines.exists():
    print("❌ No medicines found. Creating one...")
    med = Medicine.objects.create(name='Test Medicine', price=10, stock=100, expiry_date='2027-12-31')
else:
    med = medicines.first()

print(f"Using medicine: {med.name} (ID: {med.id}, Stock: {med.stock})\n")

# Test Prescription API
print("=" * 50)
print("TEST: POST /api/prescription/")
print("=" * 50)
try:
    headers = {'Authorization': f'Token {token.key}', 'Content-Type': 'application/json'}
    data = {
        'medicine': med.id,
        'quantity': 5,
        'notes': 'Test prescription'
    }
    req = urllib.request.Request(
        'http://127.0.0.1:8000/api/prescription/',
        data=json.dumps(data).encode(),
        headers=headers,
        method='POST'
    )
    response = urllib.request.urlopen(req)
    result = json.loads(response.read().decode())
    print(f"✓ Status: {response.status}")
    print(f"Response: {result}")
    
    # Check if stock was reduced
    med.refresh_from_db()
    print(f"\nMedicine stock after prescription: {med.stock}")
    
    # Check prescription in database
    presc = Prescription.objects.filter(medicine=med).first()
    if presc:
        print(f"✓ Prescription saved: {presc.id}")
    
except urllib.error.HTTPError as e:
    error_data = json.loads(e.read().decode())
    print(f"✗ Status: {e.code}")
    print(f"Error: {error_data}")
except Exception as e:
    print(f"✗ Error: {e}")
