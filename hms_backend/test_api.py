import os
import django
import json
import urllib.request
import urllib.error

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'hms_backend.settings')
django.setup()

from django.contrib.auth.models import User
from rest_framework.authtoken.models import Token

# Get or create test user
user, created = User.objects.get_or_create(username='testapi', defaults={'email': 'test@test.com'})
token, _ = Token.objects.get_or_create(user=user)

print(f"Test User: {user.username}")
print(f"Token: {token.key}\n")

# Test 1: GET medicines
print("=" * 50)
print("TEST 1: GET /api/medicines/")
print("=" * 50)
try:
    response = urllib.request.urlopen('http://127.0.0.1:8000/api/medicines/')
    data = json.loads(response.read().decode())
    print(f"Status: {response.status}")
    print(f"Medicines: {len(data)}")
    for med in data:
        print(f"  - {med.get('name')}: Stock={med.get('stock')}, Price=${med.get('price')}")
except urllib.error.URLError as e:
    print(f"✗ Error: Server not running? {e}")
except Exception as e:
    print(f"✗ Error: {e}")

# Test 2: POST add-medicine
print("\n" + "=" * 50)
print("TEST 2: POST /api/add-medicine/")
print("=" * 50)
try:
    headers = {'Authorization': f'Token {token.key}', 'Content-Type': 'application/json'}
    data = {
        'name': 'Ibuprofen',
        'price': 3.00,
        'stock': 150,
        'expiry_date': '2027-12-31'
    }
    req = urllib.request.Request(
        'http://127.0.0.1:8000/api/add-medicine/',
        data=json.dumps(data).encode(),
        headers=headers,
        method='POST'
    )
    response = urllib.request.urlopen(req)
    result = json.loads(response.read().decode())
    print(f"Status: {response.status}")
    print(f"Response: {result}")
except urllib.error.HTTPError as e:
    error_data = json.loads(e.read().decode())
    print(f"✗ Status: {e.code}")
    print(f"Error: {error_data}")
except urllib.error.URLError as e:
    print(f"✗ Error: Server not running? {e}")
except Exception as e:
    print(f"✗ Error: {e}")
