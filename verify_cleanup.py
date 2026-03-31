#!/usr/bin/env python
"""
Final Verification Script - Runs after cleanup to ensure everything works
"""

import os
import sys
import subprocess

print("=" * 80)
print("HMS PROJECT - FINAL CLEANUP VERIFICATION")
print("=" * 80)

checks = []

# 1. Check backend structure
print("\n1. Backend Structure Check...")
backend_files = [
    'd:\\HMS\\hms_backend\\manage.py',
    'd:\\HMS\\hms_backend\\requirements.txt',
    'd:\\HMS\\hms_backend\\core\\models.py',
    'd:\\HMS\\hms_backend\\core\\views.py',
    'd:\\HMS\\hms_backend\\hms_backend\\urls.py',
]

for f in backend_files:
    exists = os.path.exists(f)
    status = "✅" if exists else "❌"
    print(f"  {status} {f}")
    checks.append(exists)

# 2. Check frontend structure
print("\n2. Frontend Structure Check...")
frontend_files = [
    'd:\\HMS\\hms-frontend\\package.json',
    'd:\\HMS\\hms-frontend\\.gitignore',
    'd:\\HMS\\hms-frontend\\src\\App.js',
]

for f in frontend_files:
    exists = os.path.exists(f)
    status = "✅" if exists else "❌"
    print(f"  {status} {f}")
    checks.append(exists)

# 3. Check for cleaned API files
print("\n3. Verification - OpenAI removed...")
with open('d:\\HMS\\hms_backend\\core\\views.py', 'r') as f:
    content = f.read()
    has_openai = 'OpenAI' in content and 'from openai' in content
    status = "❌ Still has OpenAI" if has_openai else "✅ No OpenAI"
    print(f"  {status}")
    checks.append(not has_openai)

# 4. Check Gemini is configured
print("\n4. Verification - Gemini configured...")
with open('d:\\HMS\\hms_backend\\core\\views.py', 'r') as f:
    content = f.read()
    has_gemini = 'google.generativeai' in content
    status = "✅ Gemini present" if has_gemini else "❌ No Gemini"
    print(f"  {status}")
    checks.append(has_gemini)

# 5. Check .env is in gitignore
print("\n5. Verification - .env ignored...")
with open('d:\\HMS\\hms_backend\\.gitignore', 'r') as f:
    content = f.read()
    has_env = '.env' in content
    status = "✅ .env in gitignore" if has_env else "❌ .env NOT in gitignore"
    print(f"  {status}")
    checks.append(has_env)

# Summary
print("\n" + "=" * 80)
total = len(checks)
passed = sum(checks)
print(f"Results: {passed}/{total} checks passed")

if passed == total:
    print("✅ PROJECT IS READY TO PUSH TO GITHUB")
    print("\nFinal step: Delete debug/test files listed in CLEANUP_SUMMARY.md")
else:
    print("⚠️ Some checks failed - review above")

print("=" * 80)
