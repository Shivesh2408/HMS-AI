from django.apps import AppConfig


class CoreConfig(AppConfig):
    name = 'core'
    
    def ready(self):
        """Initialize Firebase when Django starts."""
        try:
            from firebase_config import initialize_firebase
            initialize_firebase()
            print("✓ Firebase initialized at Django startup")
        except Exception as e:
            print(f"⚠ Firebase initialization warning (will retry on first use): {e}")
