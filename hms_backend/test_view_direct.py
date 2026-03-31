#!/usr/bin/env python
import os
import sys
import django

# Setup Django
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'hms_backend.settings')
django.setup()

from django.test import Client
from django.contrib.auth.models import User
from rest_framework.authtoken.models import Token

# Create test client
client = Client()

# Get admin user
try:
    admin_user = User.objects.get(username='Admin123')
    print(f"[TEST] Found admin user: {admin_user.username}")
    
    # Get or create token
    token, created = Token.objects.get_or_create(user=admin_user)
    print(f"[TEST] Admin token: {token.key}")
    
    # Make request using test client
    print("\n[TEST] Making direct view request...")
    response = client.get(
        '/api/admin/stats/',
        HTTP_AUTHORIZATION=f'Token {token.key}'
    )
    
    print(f"[TEST] Status Code: {response.status_code}")
    print(f"[TEST] Response: {response.content.decode()}")
    
except Exception as e:
    print(f"[ERROR] {str(e)}")
    import traceback
    traceback.print_exc()
