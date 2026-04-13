from rest_framework import serializers
from django.contrib.auth.models import User
from rest_framework.authtoken.models import Token
from .models import (
    Patient,
    Doctor,
    Appointment,
    Billing,
    MedicalRecord,
    ChatLog,
    SecurityManager,
    UserProfile,
    Medicine,
    Prescription,
    DoctorSchedule,
    Bill,
    BillItem,
)


class PatientSerializer(serializers.ModelSerializer):
    class Meta:
        model = Patient
        fields = "__all__"


class DoctorSerializer(serializers.ModelSerializer):
    class Meta:
        model = Doctor
        fields = "__all__"


class AppointmentSerializer(serializers.ModelSerializer):
    class Meta:
        model = Appointment
        fields = "__all__"


class BillingSerializer(serializers.ModelSerializer):
    class Meta:
        model = Billing
        fields = "__all__"


class MedicalRecordSerializer(serializers.ModelSerializer):
    class Meta:
        model = MedicalRecord
        fields = "__all__"


class ChatLogSerializer(serializers.ModelSerializer):
    class Meta:
        model = ChatLog
        fields = "__all__"


class SecurityManagerSerializer(serializers.ModelSerializer):
    class Meta:
        model = SecurityManager
        fields = "__all__"


class UserSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ('id', 'username', 'email', 'first_name', 'last_name')
        read_only_fields = ('id',)


class SignupSerializer(serializers.ModelSerializer):
    password = serializers.CharField(write_only=True, required=True, style={'input_type': 'password'})
    password2 = serializers.CharField(write_only=True, required=True, style={'input_type': 'password'})
    role = serializers.ChoiceField(choices=['patient', 'doctor', 'admin'], default='patient', required=False)
    first_name = serializers.CharField(required=False, allow_blank=True)
    last_name = serializers.CharField(required=False, allow_blank=True)
    
    class Meta:
        model = User
        fields = ('username', 'email', 'password', 'password2', 'first_name', 'last_name', 'role')
    
    def validate(self, attrs):
        if attrs['password'] != attrs['password2']:
            raise serializers.ValidationError({"password": "Password fields didn't match."})
        return attrs
    
    def create(self, validated_data):
        from .models import Patient, Doctor
        
        role = validated_data.pop('role', 'patient')
        
        # EXPLICIT VALIDATION: Allow patient, doctor, and admin roles
        if role not in ['patient', 'doctor', 'admin']:
            print(f"[SIGNUP] Invalid role {role}, defaulting to patient")
            role = 'patient'
        
        validated_data.pop('password2')
        user = User.objects.create_user(**validated_data)
        Token.objects.create(user=user)
        
        # Create UserProfile with explicitly validated role
        profile = UserProfile.objects.create(user=user, role=role)
        print(f"[SIGNUP] Created UserProfile for {user.username} with role: {profile.role}")
        
        # Create Patient or Doctor entry based on role (Admin only gets UserProfile)
        if role == 'patient':
            patient_name = f"{user.first_name} {user.last_name}".strip() or user.username
            patient = Patient.objects.create(
                user=user,
                name=patient_name,
                age=0,
                gender='M',
                phone=''
            )
            print(f"[SIGNUP] Created Patient entry for {user.username}")
        elif role == 'doctor':
            doctor_name = f"{user.first_name} {user.last_name}".strip() or user.username
            doctor = Doctor.objects.create(
                user=user,
                name=doctor_name,
                specialization='General Physician',
                phone=''
            )
            print(f"[SIGNUP] Created Doctor entry for {user.username}")
        elif role == 'admin':
            print(f"[SIGNUP] Created Admin user {user.username} with UserProfile only")
        
        print(f"[SIGNUP] User {user.username} created successfully with role: {role}")
        return user


class LoginSerializer(serializers.Serializer):
    username = serializers.CharField(required=True)
    password = serializers.CharField(required=True, style={'input_type': 'password'})


class UserProfileSerializer(serializers.ModelSerializer):
    user = UserSerializer(read_only=True)
    
    class Meta:
        model = UserProfile
        fields = ('id', 'user', 'role', 'specialization')


class DoctorListSerializer(serializers.Serializer):
    id = serializers.IntegerField()
    username = serializers.CharField()
    first_name = serializers.CharField()
    last_name = serializers.CharField()
    specialization = serializers.CharField()
    
    def to_representation(self, data):
        return {
            'id': data.id,
            'username': data.username,
            'first_name': data.first_name,
            'last_name': data.last_name,
            'specialization': data.profile.specialization or 'General'
        }


class BookAppointmentSerializer(serializers.ModelSerializer):
    doctor_id = serializers.IntegerField(write_only=True)
    
    class Meta:
        model = Appointment
        fields = ('doctor_id', 'date', 'time', 'notes')
    
    def validate(self, data):
        doctor_id = data.get('doctor_id')
        date = data.get('date')
        time = data.get('time')
        
        try:
            doctor = Doctor.objects.get(id=doctor_id)
        except Doctor.DoesNotExist:
            raise serializers.ValidationError("Doctor not found.")
        
        # Check for double booking using doctor's user
        if doctor.user:
            existing = Appointment.objects.filter(
                doctor_user=doctor.user,
                date=date,
                time=time,
                status__in=['pending', 'accepted', 'completed']
            ).exists()
            
            if existing:
                raise serializers.ValidationError("Doctor is not available at this date and time.")
        
        return data
    
    def create(self, validated_data):
        doctor_id = validated_data.pop('doctor_id')
        doctor = Doctor.objects.get(id=doctor_id)
        patient_user = self.context['request'].user
        
        appointment = Appointment.objects.create(
            doctor=doctor,
            doctor_user=doctor.user if doctor.user else None,
            patient_user=patient_user,
            **validated_data
        )
        return appointment


class AppointmentDetailSerializer(serializers.ModelSerializer):
    doctor_name = serializers.SerializerMethodField()
    patient_name = serializers.SerializerMethodField()
    patient_username = serializers.SerializerMethodField()
    appointment_date = serializers.SerializerMethodField()
    doctor_specialization = serializers.SerializerMethodField()
    
    class Meta:
        model = Appointment
        fields = ('id', 'date', 'time', 'appointment_date', 'status', 'diagnosis', 'notes', 'doctor_name', 'patient_name', 'patient_username', 'patient_user', 'doctor_specialization', 'created_at')
    
    def to_representation(self, instance):
        """Override to include patient_user as patient_user_id"""
        data = super().to_representation(instance)
        
        # Ensure patient_user_id is always included
        if instance.patient_user:
            data['patient_user_id'] = instance.patient_user.id
        else:
            data['patient_user_id'] = None
            
        # Also keep patient_user as the ID (overwrite the default serialization)
        data['patient_user'] = instance.patient_user.id if instance.patient_user else None
        
        return data
    
    def get_doctor_name(self, obj):
        if obj.doctor:
            return obj.doctor.name
        elif obj.doctor_user:
            return f"Dr. {obj.doctor_user.first_name or obj.doctor_user.username}"
        return None
    
    def get_patient_name(self, obj):
        if obj.patient_user:
            return obj.patient_user.first_name or obj.patient_user.username
        return None

    def get_patient_username(self, obj):
        if obj.patient_user:
            return obj.patient_user.username
        return None
    
    def get_appointment_date(self, obj):
        if obj.date:
            return obj.date
        return None
    
    def get_doctor_specialization(self, obj):
        if obj.doctor:
            return obj.doctor.specialization or 'General'
        elif obj.doctor_user and hasattr(obj.doctor_user, 'profile'):
            return obj.doctor_user.profile.specialization or 'General'
        return 'General'


class MedicineSerializer(serializers.ModelSerializer):
    class Meta:
        model = Medicine
        fields = ('id', 'name', 'price', 'stock', 'expiry_date', 'created_at')


class AddMedicineSerializer(serializers.ModelSerializer):
    class Meta:
        model = Medicine
        fields = ('name', 'price', 'stock', 'expiry_date')
    
    def create(self, validated_data):
        return Medicine.objects.create(**validated_data)


class PrescriptionSerializer(serializers.ModelSerializer):
    medicine_name = serializers.SerializerMethodField()
    doctor_name = serializers.SerializerMethodField()
    patient_name = serializers.SerializerMethodField()
    
    class Meta:
        model = Prescription
        fields = ('id', 'medicine', 'medicine_name', 'doctor_user', 'doctor_name', 'patient_user', 'patient_name', 'quantity', 'date', 'notes')
    
    def get_medicine_name(self, obj):
        return obj.medicine.name if obj.medicine else None
    
    def get_doctor_name(self, obj):
        if obj.doctor_user:
            return f"Dr. {obj.doctor_user.first_name or obj.doctor_user.username}"
        return None
    
    def get_patient_name(self, obj):
        if obj.patient_user:
            return obj.patient_user.first_name or obj.patient_user.username
        return None


class CreatePrescriptionSerializer(serializers.ModelSerializer):
    patient_user = serializers.PrimaryKeyRelatedField(
        queryset=User.objects.all(),
        write_only=True,
        required=False,
    )

    class Meta:
        model = Prescription
        fields = ('patient_user', 'medicine', 'quantity', 'notes')
    
    def validate(self, data):
        medicine = data.get('medicine')
        quantity = data.get('quantity')
        request_user = self.context['request'].user
        patient_user = data.get('patient_user')
        
        if medicine.stock < quantity:
            raise serializers.ValidationError(f"Insufficient stock. Available: {medicine.stock}, Required: {quantity}")

        # Doctors must prescribe to a selected patient user.
        if hasattr(request_user, 'doctor_profile') and not patient_user:
            raise serializers.ValidationError("patient_user is required for doctor prescriptions")
        
        return data
    
    def create(self, validated_data):
        request_user = self.context['request'].user
        patient_user = validated_data.pop('patient_user', None)
        doctor_user = request_user if hasattr(request_user, 'doctor_profile') else None

        # Backward compatibility: if patient creates for self, keep old behavior.
        if patient_user is None:
            patient_user = request_user
        
        medicine = validated_data['medicine']
        quantity = validated_data['quantity']
        
        # Reduce stock
        medicine.stock -= quantity
        medicine.save()
        
        prescription = Prescription.objects.create(
            patient_user=patient_user,
            doctor_user=doctor_user,
            **validated_data
        )
        
        return prescription


class DoctorScheduleSerializer(serializers.ModelSerializer):
    class Meta:
        model = DoctorSchedule
        fields = ('id', 'doctor', 'date', 'start_time', 'end_time', 'created_at')
    
    def create(self, validated_data):
        return DoctorSchedule.objects.create(**validated_data)


class DoctorProfileSerializer(serializers.ModelSerializer):
    username = serializers.CharField(source='user.username', read_only=True)
    email = serializers.CharField(source='user.email', read_only=True)
    first_name = serializers.CharField(source='user.first_name')
    last_name = serializers.CharField(source='user.last_name')
    
    class Meta:
        model = Doctor
        fields = ('id', 'username', 'email', 'first_name', 'last_name', 'name', 'specialization', 'phone', 'experience', 'qualification', 'bio', 'available')
    
    def update(self, instance, validated_data):
        user_data = {}
        if 'user' in validated_data:
            user_data = validated_data.pop('user')
            if 'first_name' in user_data:
                instance.user.first_name = user_data['first_name']
            if 'last_name' in user_data:
                instance.user.last_name = user_data['last_name']
            instance.user.save()
        
        for attr, value in validated_data.items():
            setattr(instance, attr, value)
        instance.save()
        return instance


class UpdateAppointmentStatusSerializer(serializers.Serializer):
    appointment_id = serializers.IntegerField()
    status = serializers.ChoiceField(choices=['accepted', 'rejected'])


class AvailableSlotsSerializer(serializers.Serializer):
    doctor_id = serializers.IntegerField()
    date = serializers.DateField()
    slots = serializers.ListField(child=serializers.TimeField())


class BillItemSerializer(serializers.ModelSerializer):
    medicine_name = serializers.CharField(source='medicine.name', read_only=True)
    
    class Meta:
        model = BillItem
        fields = ('id', 'medicine', 'medicine_name', 'quantity', 'price')


class BillSerializer(serializers.ModelSerializer):
    items = BillItemSerializer(many=True, read_only=True)
    patient_username = serializers.CharField(source='patient_user.username', read_only=True)
    
    class Meta:
        model = Bill
        fields = ('id', 'patient_user', 'patient_username', 'total_amount', 'date', 'items')


class CreateBillSerializer(serializers.Serializer):
    items = serializers.ListField(
        child=serializers.DictField(
            child=serializers.IntegerField(),
            required=True
        )
    )
    
    def create(self, validated_data):
        from .models import Bill, BillItem, Medicine
        
        request = self.context.get('request')
        items_data = validated_data.get('items', [])
        
        if not items_data:
            raise serializers.ValidationError("Items list cannot be empty")
        
        total_amount = 0
        bill_items = []
        
        for item in items_data:
            medicine_id = item.get('medicine_id')
            quantity = item.get('quantity')
            
            if not medicine_id or not quantity:
                raise serializers.ValidationError("Each item must have medicine_id and quantity")
            
            try:
                medicine = Medicine.objects.get(id=medicine_id)
            except Medicine.DoesNotExist:
                raise serializers.ValidationError(f"Medicine with id {medicine_id} not found")
            
            if medicine.stock < quantity:
                raise serializers.ValidationError(f"Insufficient stock for {medicine.name}. Available: {medicine.stock}")
            
            item_total = float(medicine.price) * quantity
            total_amount += item_total
            
            bill_items.append({
                'medicine': medicine,
                'quantity': quantity,
                'price': medicine.price,
                'item_total': item_total
            })
        
        bill = Bill.objects.create(
            patient_user=request.user,
            total_amount=total_amount
        )
        
        for bill_item in bill_items:
            BillItem.objects.create(
                bill=bill,
                medicine=bill_item['medicine'],
                quantity=bill_item['quantity'],
                price=bill_item['price']
            )
            bill_item['medicine'].stock -= bill_item['quantity']
            bill_item['medicine'].save()
        
        return bill
