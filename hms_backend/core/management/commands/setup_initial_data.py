from django.core.management.base import BaseCommand
from django.contrib.auth.models import User
from core.models import UserProfile, Medicine

class Command(BaseCommand):
    help = 'Initialize database with superuser and medicines'

    def handle(self, *args, **options):
        try:
            # Create admin superuser if not exists
            if not User.objects.filter(username='admin').exists():
                admin = User.objects.create_superuser('admin', 'admin@hms.com', 'admin')
                # Ensure UserProfile exists
                try:
                    UserProfile.objects.create(user=admin, role='admin')
                    self.stdout.write(self.style.SUCCESS('✓ Admin user and profile created'))
                except Exception as e:
                    self.stdout.write(self.style.WARNING(f'⚠ Admin profile error (might already exist): {str(e)}'))
            else:
                self.stdout.write(self.style.WARNING('✓ Admin user already exists'))

            # Add medicines if empty
            try:
                if Medicine.objects.count() == 0:
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
                    count = Medicine.objects.count()
                    self.stdout.write(self.style.WARNING(f'✓ {count} medicines already exist'))
            except Exception as e:
                self.stdout.write(self.style.ERROR(f'✗ Medicine setup error: {str(e)}'))
        except Exception as e:
            self.stdout.write(self.style.ERROR(f'✗ Setup failed: {str(e)}'))
            raise
