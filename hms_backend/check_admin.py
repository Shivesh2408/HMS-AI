#!/usr/bin/env python
import os
import django

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'hms_backend.settings')
django.setup()

from django.contrib.auth.models import User
from core.models import UserProfile

print("=== Checking Admin User ===")

# Check if admin1 exists
admin_user = User.objects.filter(username='admin1').first()

if admin_user:
    print(f"✓ Admin user 'admin1' exists")
    print(f"  Email: {admin_user.email}")
    
    # Check profile
    try:
        profile = admin_user.profile
        print(f"✓ Profile exists")
        print(f"  Role: {profile.role}")
    except UserProfile.DoesNotExist:
        print("✗ Profile MISSING - This is the problem!")
else:
    print("✗ Admin user 'admin1' does NOT exist")
    print("  Create one via signup page with role=admin")

# Show all users
print("\n=== All Users in Database ===")
for user in User.objects.all():
    try:
        role = user.profile.role
    except:
        role = "NO PROFILE"
    print(f"  {user.username}: {role}")
