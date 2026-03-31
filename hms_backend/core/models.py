from django.db import models
from django.contrib.auth.models import User


class UserProfile(models.Model):
    ROLE_CHOICES = [
        ('patient', 'Patient'),
        ('doctor', 'Doctor'),
        ('admin', 'Admin'),
    ]
    
    user = models.OneToOneField(User, on_delete=models.CASCADE, related_name='profile')
    role = models.CharField(max_length=20, choices=ROLE_CHOICES, default='patient')
    specialization = models.CharField(max_length=100, blank=True, null=True)
    
    def __str__(self):
        return f"{self.user.username} - {self.role}"


class Patient(models.Model):
    GENDER_CHOICES = [
        ('M', 'Male'),
        ('F', 'Female'),
        ('O', 'Other'),
    ]
    
    user = models.OneToOneField(User, on_delete=models.CASCADE, related_name='patient_profile', null=True, blank=True)
    name = models.CharField(max_length=100)
    age = models.IntegerField(default=0, null=True, blank=True)
    gender = models.CharField(max_length=1, choices=GENDER_CHOICES, default='M', null=True, blank=True)
    phone = models.CharField(max_length=20, default='', blank=True)
    
    def __str__(self):
        return f"{self.name} ({self.user.username})" if self.user else self.name


class Doctor(models.Model):
    user = models.OneToOneField(User, on_delete=models.CASCADE, related_name='doctor_profile', null=True, blank=True)
    name = models.CharField(max_length=100)
    specialization = models.CharField(max_length=100)
    phone = models.CharField(max_length=20)
    experience = models.IntegerField(default=0, null=True, blank=True)
    qualification = models.CharField(max_length=200, blank=True, null=True)
    bio = models.TextField(blank=True, null=True)
    available = models.BooleanField(default=True)
    
    def __str__(self):
        return f"Dr. {self.name} - {self.specialization}"


class Appointment(models.Model):
    STATUS_CHOICES = [
        ('pending', 'Pending'),
        ('accepted', 'Accepted'),
        ('rejected', 'Rejected'),
        ('completed', 'Completed'),
        ('cancelled', 'Cancelled'),
    ]
    
    patient = models.ForeignKey(Patient, on_delete=models.CASCADE, related_name='appointments', null=True, blank=True)
    doctor = models.ForeignKey(Doctor, on_delete=models.CASCADE, related_name='appointments', null=True, blank=True)
    patient_user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='appointments_as_patient', null=True, blank=True)
    doctor_user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='appointments_as_doctor', null=True, blank=True)
    date = models.DateField()
    time = models.TimeField()
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='pending')
    diagnosis = models.TextField(blank=True, null=True)
    notes = models.TextField(blank=True, null=True)
    created_at = models.DateTimeField(auto_now_add=True, null=True, blank=True)
    
    class Meta:
        unique_together = ('doctor_user', 'date', 'time')
        ordering = ['-date', '-time']
    
    def __str__(self):
        if self.patient_user:
            doctor_name = self.doctor_user.first_name or self.doctor_user.username
            patient_name = self.patient_user.first_name or self.patient_user.username
            return f"Appointment - {patient_name} with Dr. {doctor_name} on {self.date}"
        return f"Appointment - {self.patient.name} with Dr. {self.doctor.name} on {self.date}"


class Billing(models.Model):
    PAYMENT_STATUS_CHOICES = [
        ('pending', 'Pending'),
        ('paid', 'Paid'),
        ('cancelled', 'Cancelled'),
    ]
    
    appointment = models.OneToOneField(Appointment, on_delete=models.CASCADE, related_name='billing')
    amount = models.DecimalField(max_digits=10, decimal_places=2)
    payment_status = models.CharField(max_length=20, choices=PAYMENT_STATUS_CHOICES, default='pending')
    date = models.DateField()
    
    def __str__(self):
        return f"Billing for {self.appointment.patient.name} - {self.amount}"


class MedicalRecord(models.Model):
    patient = models.ForeignKey(Patient, on_delete=models.CASCADE, related_name='medical_records')
    diagnosis = models.TextField()
    prescription = models.TextField()
    
    def __str__(self):
        return f"Medical Record - {self.patient.name}"


class ChatLog(models.Model):
    message = models.TextField()
    response = models.TextField()
    timestamp = models.DateTimeField(auto_now_add=True)
    
    def __str__(self):
        return f"Chat at {self.timestamp}"


class SecurityManager(models.Model):
    ACTION_CHOICES = [
        ('login', 'Login'),
        ('logout', 'Logout'),
        ('failed_login', 'Failed Login'),
        ('create', 'Create'),
        ('update', 'Update'),
        ('delete', 'Delete'),
        ('view', 'View'),
    ]
    
    user_id = models.IntegerField(null=True)
    action = models.CharField(max_length=100, choices=ACTION_CHOICES)
    ip_address = models.CharField(max_length=100, default='0.0.0.0')
    timestamp = models.DateTimeField(auto_now_add=True)
    
    def __str__(self):
        return f"Security Log - User {self.user_id} - {self.action} - {self.ip_address} at {self.timestamp}"


def log_activity(user_id, action, request):
    """Log security activity with user ID, action, and IP address"""
    ip = request.META.get('REMOTE_ADDR', 'Unknown')
    SecurityManager.objects.create(
        user_id=user_id,
        action=action,
        ip_address=ip
    )


class Medicine(models.Model):
    name = models.CharField(max_length=100)
    price = models.DecimalField(max_digits=8, decimal_places=2)
    stock = models.IntegerField(default=0)
    expiry_date = models.DateField()
    created_at = models.DateTimeField(auto_now_add=True)
    
    class Meta:
        ordering = ['name']


class DoctorSchedule(models.Model):
    doctor = models.ForeignKey(Doctor, on_delete=models.CASCADE, related_name='schedules')
    date = models.DateField()
    start_time = models.TimeField()
    end_time = models.TimeField()
    created_at = models.DateTimeField(auto_now_add=True)
    
    class Meta:
        unique_together = ('doctor', 'date')
        ordering = ['-date', 'start_time']
    
    def __str__(self):
        return f"Dr. {self.doctor.name} - {self.date} ({self.start_time}-{self.end_time})"


class Prescription(models.Model):
    patient_user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='prescriptions', null=True, blank=True)
    doctor_user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='prescribed', null=True, blank=True)
    medicine = models.ForeignKey(Medicine, on_delete=models.CASCADE, related_name='prescriptions')
    quantity = models.IntegerField()
    date = models.DateTimeField(auto_now_add=True)
    notes = models.TextField(blank=True, null=True)
    
    class Meta:
        ordering = ['-date']
    
    def __str__(self):
        return f"Prescription - {self.medicine.name} x {self.quantity} on {self.date}"


class Bill(models.Model):
    patient_user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='bills')
    total_amount = models.DecimalField(max_digits=10, decimal_places=2)
    date = models.DateTimeField(auto_now_add=True)
    
    class Meta:
        ordering = ['-date']
    
    def __str__(self):
        return f"Bill #{self.id} - {self.patient_user.username} - {self.total_amount}"


class BillItem(models.Model):
    bill = models.ForeignKey(Bill, on_delete=models.CASCADE, related_name='items')
    medicine = models.ForeignKey(Medicine, on_delete=models.CASCADE)
    quantity = models.IntegerField()
    price = models.DecimalField(max_digits=8, decimal_places=2)
    
    def __str__(self):
        return f"BillItem - {self.medicine.name} x {self.quantity}"
