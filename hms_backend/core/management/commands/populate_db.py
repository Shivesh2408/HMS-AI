from django.core.management.base import BaseCommand
from django.contrib.auth.models import User
from core.models import UserProfile, Doctor, Patient, Medicine
from datetime import datetime, timedelta


class Command(BaseCommand):
    help = 'Populate HMS database with test data'

    def handle(self, *args, **options):
        self.stdout.write("=" * 50)
        self.stdout.write("Populating HMS Database with Test Data")
        self.stdout.write("=" * 50)

        # Create Admin User
        try:
            admin = User.objects.create_superuser('admin', 'admin@hms.com', 'admin')
            UserProfile.objects.create(user=admin, role='admin')
            self.stdout.write(self.style.SUCCESS('✓ Admin user created'))
        except:
            self.stdout.write('✓ Admin user already exists')

        # Create Doctor
        try:
            doctor_user = User.objects.create_user('doctor1', 'doctor@hms.com', 'doctor123')
            doctor = Doctor.objects.create(
                user=doctor_user,
                name='Dr. Ahmed Khan',
                phone='03001234567',
                available=True,
                bio='Senior Cardiologist with 10+ years experience',
                experience='10+',
                specialization='Cardiology'
            )
            UserProfile.objects.create(user=doctor_user, role='doctor')
            self.stdout.write(self.style.SUCCESS('✓ Doctor created'))
        except:
            self.stdout.write('✓ Doctor already exists')

        # Create Patient
        try:
            patient_user = User.objects.create_user('patient1', 'patient@hms.com', 'patient123')
            patient = Patient.objects.create(
                user=patient_user,
                age=35,
                gender='M',
                blood_type='O+',
                phone='03009876543'
            )
            UserProfile.objects.create(user=patient_user, role='patient')
            self.stdout.write(self.style.SUCCESS('✓ Patient created'))
        except:
            self.stdout.write('✓ Patient already exists')

        # Create Medicines
        medicines_data = [
            {'name': 'Aspirin 500mg', 'price': 50},
            {'name': 'Paracetamol 500mg', 'price': 45},
            {'name': 'Ibuprofen 200mg', 'price': 60},
            {'name': 'Amoxicillin 500mg', 'price': 150},
            {'name': 'Metformin 500mg', 'price': 70},
        ]

        created_count = 0
        for med in medicines_data:
            obj, created = Medicine.objects.get_or_create(
                name=med['name'],
                defaults={'price': med['price'], 'stock': 100, 'expiry_date': '2025-12-31'}
            )
            if created:
                created_count += 1

        self.stdout.write(self.style.SUCCESS(f'✓ Medicines: {Medicine.objects.count()} in database'))

        self.stdout.write("\n" + "=" * 50)
        self.stdout.write(self.style.SUCCESS('✓ Database populated successfully!'))
        self.stdout.write("=" * 50)
        self.stdout.write("\nTest Credentials:")
        self.stdout.write("  Admin: admin / admin")
        self.stdout.write("  Doctor: doctor1 / doctor123")
        self.stdout.write("  Patient: patient1 / patient123")
