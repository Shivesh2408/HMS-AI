#!/usr/bin/env python
"""List available Gemini models"""

import os
import sys

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'hms_backend.settings')
sys.path.insert(0, r'd:\HMS\hms_backend')

import google.generativeai as genai
from pathlib import Path
from dotenv import load_dotenv

BASE_DIR = Path(r'd:\HMS\hms_backend')
load_dotenv(BASE_DIR / ".env")

API_KEY = os.getenv("GEMINI_API_KEY")

if not API_KEY:
    print("ERROR: GEMINI_API_KEY not found")
    sys.exit(1)

genai.configure(api_key=API_KEY)

print("Available Gemini Models:")
print("=" * 80)

try:
    for model in genai.list_models():
        if 'generateContent' in model.supported_generation_methods:
            print(f"✓ {model.name}")
except Exception as e:
    print(f"ERROR: {str(e)}")
