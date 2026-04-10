from django.core.management.base import BaseCommand
from django.contrib.auth.models import User
from core.models import UserProfile, Medicine

class Command(BaseCommand):
    help = 'Initialize database with superuser and medicines'

    def handle(self, *args, **options):
        try:
            # Create admin superuser if not exists
            try:
                admin = User.objects.get(username='admin')
                self.stdout.write(self.style.WARNING('✓ Admin user already exists'))
            except User.DoesNotExist:
                admin = User.objects.create_superuser('admin', 'admin@hms.com', 'admin')
                self.stdout.write(self.style.SUCCESS('✓ Admin user created'))
            
            # Ensure UserProfile exists for admin
            try:
                profile = UserProfile.objects.get(user=admin)
                self.stdout.write(self.style.WARNING('✓ Admin profile exists'))
            except UserProfile.DoesNotExist:
                UserProfile.objects.create(user=admin, role='admin')
                self.stdout.write(self.style.SUCCESS('✓ Admin profile created'))

            # Add medicines
            count = Medicine.objects.count()
            if count == 0:
                medicines = [
                    'Paracetamol', 'Ibuprofen', 'Aspirin', 'Amoxicillin', 'Ciprofloxacin',
                    'Lisinopril', 'Metformin', 'Atorvastatin', 'Omeprazole', 'Salbutamol',
                    'Fluticasone', 'Montelukast', 'Diphenhydramine', 'Loratadine', 'Cetirizine',
                    'Doxycycline', 'Azithromycin', 'Fluconazole', 'Folic Acid', 'Vitamin B12',
                    'Vitamin D3', 'Iron Supplement', 'Zinc', 'Magnesium', 'Calcium',
                    'Multivitamin', 'Biotin', 'Selenium', 'Copper', 'Phosphorus'
                ]
                for med_name in medicines:
                    Medicine.objects.create(name=med_name)
                self.stdout.write(self.style.SUCCESS(f'✓ {len(medicines)} medicines added'))
            else:
                self.stdout.write(self.style.WARNING(f'✓ {count} medicines already exist'))
                
        except Exception as e:
            self.stdout.write(self.style.ERROR(f'✗ Error: {str(e)}'))

