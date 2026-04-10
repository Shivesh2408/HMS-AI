from core.models import Medicine
from datetime import date, timedelta

medicines_list = [
    {"name": "Aspirin", "price": 50.00, "stock": 100},
    {"name": "Paracetamol", "price": 45.00, "stock": 150},
    {"name": "Ibuprofen", "price": 55.00, "stock": 120},
    {"name": "Amoxicillin", "price": 120.00, "stock": 80},
    {"name": "Ciprofloxacin", "price": 180.00, "stock": 60},
    {"name": "Metformin", "price": 200.00, "stock": 200},
    {"name": "Lisinopril", "price": 250.00, "stock": 90},
    {"name": "Atorvastatin", "price": 300.00, "stock": 75},
    {"name": "Omeprazole", "price": 150.00, "stock": 110},
    {"name": "Cetirizine", "price": 40.00, "stock": 130},
    {"name": "Loratadine", "price": 45.00, "stock": 125},
    {"name": "Salbutamol", "price": 280.00, "stock": 50},
    {"name": "Fluticasone", "price": 320.00, "stock": 45},
    {"name": "Levothyroxine", "price": 100.00, "stock": 140},
    {"name": "Sertraline", "price": 280.00, "stock": 70},
    {"name": "Alprazolam", "price": 250.00, "stock": 55},
    {"name": "Amitriptyline", "price": 200.00, "stock": 85},
    {"name": "Clopidogrel", "price": 350.00, "stock": 40},
    {"name": "Warfarin", "price": 400.00, "stock": 35},
    {"name": "Hydrochlorothiazide", "price": 180.00, "stock": 105},
    {"name": "Metoprolol", "price": 220.00, "stock": 95},
    {"name": "Amlodipine", "price": 240.00, "stock": 88},
    {"name": "Doxycycline", "price": 140.00, "stock": 92},
    {"name": "Tetracycline", "price": 130.00, "stock": 98},
    {"name": "Ceftriaxone", "price": 450.00, "stock": 30},
    {"name": "Azithromycin", "price": 200.00, "stock": 76},
    {"name": "Clarithromycin", "price": 220.00, "stock": 64},
    {"name": "Fluconazole", "price": 500.00, "stock": 25},
    {"name": "Ketoconazole", "price": 480.00, "stock": 28},
    {"name": "Metronidazole", "price": 160.00, "stock": 115},
]

expiry_date = date.today() + timedelta(days=365)

created_count = 0
for med in medicines_list:
    medicine, created = Medicine.objects.get_or_create(
        name=med["name"], 
        defaults={"price": med["price"], "stock": med["stock"], "expiry_date": expiry_date}
    )
    if created:
        created_count += 1

print(f"\n✓ {created_count} medicines added to database!")
print(f"✓ Total medicines in database: {Medicine.objects.count()}")
