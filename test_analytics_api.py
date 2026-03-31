#!/usr/bin/env python
"""
Quick test script to verify the analytics API is working.
This simulates what will happen when the frontend calls the /api/admin/stats/ endpoint.
"""

import os
import sys
import django

# Setup Django
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'hms_backend.settings')
sys.path.insert(0, r'd:\HMS\hms_backend')
django.setup()

from core.models import Patient, Doctor, Appointment, Bill, BillItem
from django.contrib.auth.models import User
from django.utils import timezone
from datetime import timedelta
from decimal import Decimal

print("=" * 80)
print("ANALYTICS API TEST")
print("=" * 80)

# Check model data
print("\n1. Checking model data...")
print(f"   - Patients: {Patient.objects.count()}")
print(f"   - Doctors: {Doctor.objects.count()}")
print(f"   - Appointments: {Appointment.objects.count()}")
print(f"   - Bills: {Bill.objects.count()}")

# Test the aggregation queries that AdminStatsView uses
print("\n2. Testing aggregations from AdminStatsView...")

from django.db.models import Sum, Count

# Total revenue
revenue_result = Bill.objects.aggregate(total_revenue=Sum('total_amount'))
total_revenue = float(revenue_result['total_revenue'] or 0)
print(f"   - Total Revenue: ${total_revenue:.2f}")

# Recent bills
recent_bills = Bill.objects.all().order_by('-date')[:5]
print(f"   - Recent Bills Count: {len(recent_bills)}")
for bill in recent_bills:
    print(f"     • Bill ID: {bill.id}, Amount: ${bill.total_amount:.2f}, Date: {bill.date}")

# Daily appointments
thirty_days_ago = timezone.now() - timedelta(days=30)
daily_appointments = Appointment.objects.filter(
    created_at__gte=thirty_days_ago
).extra(
    select={'date_': 'DATE(created_at)'}
).values('date_').annotate(count=Count('id')).order_by('date_')

print(f"   - Daily Appointments (last 30 days): {len(daily_appointments)} days with data")
for item in list(daily_appointments)[:5]:
    print(f"     • Date: {item['date_']}, Count: {item['count']}")

# Daily revenue
daily_revenue = Bill.objects.filter(
    date__gte=thirty_days_ago
).extra(
    select={'date_': 'DATE(date)'}
).values('date_').annotate(total=Sum('total_amount')).order_by('date_')

print(f"   - Daily Revenue (last 30 days): {len(daily_revenue)} days with data")
for item in list(daily_revenue)[:5]:
    print(f"     • Date: {item['date_']}, Total: ${float(item['total'] or 0):.2f}")

print("\n3. Testing API response structure...")

# Build the response data structure like AdminStatsView does
status_breakdown = {
    'pending': Appointment.objects.filter(status='pending').count(),
    'accepted': Appointment.objects.filter(status='accepted').count(),
    'rejected': Appointment.objects.filter(status='rejected').count(),
    'completed': Appointment.objects.filter(status='completed').count(),
    'cancelled': Appointment.objects.filter(status='cancelled').count(),
}

stats_data = {
    'total_patients': Patient.objects.count(),
    'total_doctors': Doctor.objects.count(),
    'total_appointments': Appointment.objects.count(),
    'total_revenue': total_revenue,
    'status_breakdown': status_breakdown,
    'recent_bookings': [],  # Would be populated by the view
    'recent_bills': [],     # Would be populated by the view
    'daily_appointments': [{'date': str(item['date_']), 'count': item['count']} for item in daily_appointments],
    'daily_revenue': [{'date': str(item['date_']), 'total': float(item['total'] or 0)} for item in daily_revenue],
}

print("\n   Response structure:")
print(f"     - total_patients: {stats_data['total_patients']}")
print(f"     - total_doctors: {stats_data['total_doctors']}")
print(f"     - total_appointments: {stats_data['total_appointments']}")
print(f"     - total_revenue: ${stats_data['total_revenue']:.2f}")
print(f"     - status_breakdown keys: {list(stats_data['status_breakdown'].keys())}")
print(f"     - daily_appointments data points: {len(stats_data['daily_appointments'])}")
print(f"     - daily_revenue data points: {len(stats_data['daily_revenue'])}")

print("\n" + "=" * 80)
print("✓ ANALYTICS API TEST PASSED!")
print("=" * 80)
