import os
import django

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'hms_backend.settings')
django.setup()

from django.contrib.auth.models import User
from rest_framework.authtoken.models import Token

print("=" * 60)
print("ALL USERS AND TOKENS")
print("=" * 60)

users = User.objects.all()
print(f"Total Users: {users.count()}\n")

for user in users:
    token = Token.objects.filter(user=user).first()
    token_display = token.key if token else "❌ NO TOKEN"
    print(f"Username: {user.username}")
    print(f"  Email: {user.email}")
    print(f"  Token: {token_display}")
    print()

# Check what we need to do
if not Token.objects.filter(user__username='testuser').exists():
    print("\n⚠️  No token for 'testuser'. Creating one...")
    try:
        testuser = User.objects.get(username='testuser')
        token, created = Token.objects.get_or_create(user=testuser)
        print(f"✓ Token created: {token.key}")
    except User.DoesNotExist:
        print("❌ testuser does not exist. Need to create account from frontend.")
