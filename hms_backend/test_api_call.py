#!/usr/bin/env python
import os
import django
import requests
import json

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'hms_backend.settings')
django.setup()

from django.contrib.auth.models import User
from rest_framework.authtoken.models import Token

print("=== Testing Real API Call ===\n")

# Get admin token
admin_user = User.objects.get(username='Admin123')
token, _ = Token.objects.get_or_create(user=admin_user)

print(f"Admin User: {admin_user.username}")
print(f"Admin Role: {admin_user.profile.role}")
print(f"Token: {token.key[:30]}...\n")

# Make actual HTTP request
headers = {
    'Authorization': f'Token {token.key}',
    'Content-Type': 'application/json',
}

print("Making request to: http://127.0.0.1:8000/api/admin/stats/")
print(f"Headers: {{'Authorization': 'Token ...', 'Content-Type': 'application/json'}}\n")

try:
    response = requests.get('http://127.0.0.1:8000/api/admin/stats/', headers=headers, timeout=5)
    
    print(f"Status Code: {response.status_code}")
    print(f"Response Headers: {dict(response.headers)}\n")
    
    if response.status_code == 200:
        print("✓ SUCCESS! API returned data:")
        data = response.json()
        print(json.dumps(data, indent=2))
    else:
        print(f"✗ ERROR! Status: {response.status_code}")
        print(f"Response: {response.text}")
        
except requests.exceptions.ConnectionError:
    print("✗ CONNECTION ERROR: Backend not responding on 127.0.0.1:8000")
    print("  Make sure: python manage.py runserver 0.0.0.0:8000 is running")
except Exception as e:
    print(f"✗ ERROR: {type(e).__name__}: {e}")
