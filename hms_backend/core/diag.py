from rest_framework.views import APIView
from rest_framework.response import Response
import os

class DiagnosticsView(APIView):
    """Diagnostic endpoint - no auth required, shows config info"""
    
    def get(self, request):
        """Return diagnostic information"""
        return Response({
            'status': 'ok',
            'debug': os.getenv('DEBUG', 'False'),
            'database_host': os.getenv('DB_HOST', 'NOT SET'),
            'database_name': os.getenv('DB_NAME', 'NOT SET'),
            'database_user': os.getenv('DB_USER', 'NOT SET'),
            'has_secret_key': bool(os.getenv('SECRET_KEY')),
            'allowed_hosts': os.getenv('ALLOWED_HOSTS', '*'),
            'environment': 'production' if 'render.com' in os.getenv('DB_HOST', '') else 'development',
        })
