#!/usr/bin/env python
"""Test improved Gemini chatbot with structured prompt"""

import os
import sys
import django

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'hms_backend.settings')
sys.path.insert(0, r'd:\HMS\hms_backend')
django.setup()

import google.generativeai as genai
from pathlib import Path
from dotenv import load_dotenv

BASE_DIR = Path(r'd:\HMS\hms_backend')
load_dotenv(BASE_DIR / ".env")

API_KEY = os.getenv("GEMINI_API_KEY")

print("=" * 80)
print("TESTING IMPROVED GEMINI CHATBOT")
print("=" * 80)

if not API_KEY:
    print("ERROR: GEMINI_API_KEY not found")
    sys.exit(1)

print(f"✅ API Key loaded: {API_KEY[:20]}...")

# Configure Gemini
genai.configure(api_key=API_KEY)
model = genai.GenerativeModel("gemini-1.5-flash")

# Test with "fever" symptom
user_message = "fever"

print(f"\nTesting with symptom: '{user_message}'")
print("-" * 80)

# Use improved prompt
full_prompt = f"""You are an AI medical assistant.

User symptoms or concern: {user_message}

Please respond with:
- Possible causes (basic ideas only)
- What immediate steps to take
- Which type of doctor to consult
- Simple precautions

Keep your answer short and clear. 
IMPORTANT: Do NOT give a final diagnosis. Always remind the user to consult a doctor if symptoms are serious."""

print("\nSending improved prompt to Gemini...")

try:
    response = model.generate_content(full_prompt)
    ai_reply = response.text
    print("\n✅ GEMINI RESPONSE:")
    print("-" * 80)
    print(ai_reply)
    print("-" * 80)
except Exception as e:
    print(f"❌ ERROR: {str(e)}")
    import traceback
    traceback.print_exc()

print("\n" + "=" * 80)
