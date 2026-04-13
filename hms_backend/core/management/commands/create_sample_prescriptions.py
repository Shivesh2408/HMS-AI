from django.core.management.base import BaseCommand
from django.contrib.auth.models import User
from core.models import Prescription, Medicine, Doctor

class Command(BaseCommand):
    help = 'Create sample prescriptions for testing'

    def handle(self, *args, **options):
        try:
            # Get the first patient user
            user = User.objects.filter(profile__role='patient').first()
            if not user:
                user = User.objects.first()
            
            if not user:
                self.stdout.write(self.style.ERROR('No users found'))
                return
            
            self.stdout.write(f'✓ Using user: {user.username}')
            
            # Get doctor
            doctor = Doctor.objects.first()
            doctor_user = doctor.user if doctor else user
            
            # Get medicines
            medicines = Medicine.objects.all()[:3]
            
            if medicines.count() == 0:
                self.stdout.write(self.style.ERROR('No medicines found'))
                return
            
            # Create prescriptions
            for i, med in enumerate(medicines):
                prescription, created = Prescription.objects.get_or_create(
                    patient_user=user,
                    medicine=med,
                    defaults={
                        'quantity': 10 + (i * 5),
                        'doctor_user': doctor_user,
                        'notes': f'Take {i+1} tablet(s) twice daily with food'
                    }
                )
                if created:
                    self.stdout.write(self.style.SUCCESS(f'✓ Created: {med.name} x{prescription.quantity}'))
                else:
                    self.stdout.write(self.style.WARNING(f'⚠ Already exists: {med.name}'))
            
            self.stdout.write(self.style.SUCCESS('\n✓ Sample prescriptions created!'))
            self.stdout.write('Refresh your browser to see them in Medical Records')
            
        except Exception as e:
            self.stdout.write(self.style.ERROR(f'Error: {str(e)}'))
            import traceback
            traceback.print_exc()
