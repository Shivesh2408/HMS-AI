#!/usr/bin/env python
import os
import django

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'hms_backend.settings')
django.setup()

from django.contrib.auth.models import User
from core.models import UserProfile

print("=== Fixing Missing Profiles ===\n")

# Find users without profiles
users_without_profile = []
for user in User.objects.all():
    try:
        profile = user.profile
    except UserProfile.DoesNotExist:
        users_without_profile.append(user)
        print(f"✗ {user.username} - MISSING PROFILE")

# Create profiles for users without them
for user in users_without_profile:
    profile, created = UserProfile.objects.get_or_create(user=user, defaults={'role': 'patient'})
    if created:
        print(f"✓ Created profile for {user.username} with role: patient")
    else:
        print(f"✓ Profile already exists for {user.username}")

print("\n=== Final Status ===")
for user in User.objects.all():
    try:
        role = user.profile.role
        print(f"✓ {user.username}: {role}")
    except:
        print(f"✗ {user.username}: STILL NO PROFILE")
