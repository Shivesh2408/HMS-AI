"""
Firebase Configuration and Initialization
This module initializes Firebase for the HMS backend application.
"""

import os
import json
import firebase_admin
from firebase_admin import credentials, db, firestore, auth
from pathlib import Path

# Get the Django settings
from django.conf import settings

# Flag to track if Firebase is initialized
_firebase_initialized = False


def initialize_firebase():
    """
    Initialize Firebase Admin SDK.
    
    Requires FIREBASE_SERVICE_ACCOUNT_KEY environment variable pointing to 
    the service account JSON file, or the JSON content directly.
    """
    global _firebase_initialized
    
    if _firebase_initialized:
        return
    
    try:
        # Check if Firebase is already initialized
        if firebase_admin._apps:
            _firebase_initialized = True
            return
        
        # Get service account key path
        service_account_key_path = settings.FIREBASE_SERVICE_ACCOUNT_KEY
        
        # Check if path is provided
        if not service_account_key_path:
            raise ValueError(
                "\n❌ FIREBASE_SERVICE_ACCOUNT_KEY not set in .env\n"
                "Steps to fix:\n"
                "1. Go to: https://console.firebase.google.com/\n"
                "2. Select 'hms-ai-32e8c' project\n"
                "3. Settings → Service Accounts → Generate New Private Key\n"
                "4. Download the JSON file\n"
                "5. Save to: D:\\HMS\\serviceAccountKey.json\n"
                "6. Django will auto-detect it OR set in .env: FIREBASE_SERVICE_ACCOUNT_KEY=serviceAccountKey.json"
            )
        
        # Resolve the path (relative or absolute)
        if not os.path.isabs(service_account_key_path):
            service_account_key_path = os.path.join(
                os.path.dirname(os.path.dirname(__file__)), 
                service_account_key_path
            )
        
        # Check if file exists
        if not os.path.isfile(service_account_key_path):
            raise FileNotFoundError(
                f"\n❌ Service account key file not found: {service_account_key_path}\n"
                "Follow the steps above to download from Firebase Console."
            )
        
        # Load credentials from file
        cred = credentials.Certificate(service_account_key_path)
        
        # Initialize Firebase
        firebase_admin.initialize_app(cred, {
            'databaseURL': f"https://{settings.FIREBASE_CONFIG.get('projectId', '')}.firebaseio.com",
        })
        
        _firebase_initialized = True
        print("✅ Firebase initialized successfully!")
        
    except Exception as e:
        print(f"⚠️  Firebase initialization error: {str(e)}")
        raise


def get_firestore_client():
    """Get Firestore client instance."""
    try:
        return firestore.client()
    except Exception as e:
        print(f"Error getting Firestore client: {str(e)}")
        raise


def get_realtime_db():
    """Get Firebase Realtime Database reference."""
    try:
        project_id = settings.FIREBASE_CONFIG.get('projectId', '')
        return db.reference()
    except Exception as e:
        print(f"Error getting Realtime Database: {str(e)}")
        raise


def get_auth():
    """Get Firebase Auth instance."""
    try:
        return auth
    except Exception as e:
        print(f"Error getting Auth: {str(e)}")
        raise
