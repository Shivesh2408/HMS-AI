from django.contrib import admin
from .models import (
    Patient,
    Doctor,
    Appointment,
    Billing,
    MedicalRecord,
    ChatLog,
    SecurityManager,
    Medicine,
    Prescription,
    DoctorSchedule,
)

admin.site.register(Patient)
admin.site.register(Doctor)
admin.site.register(DoctorSchedule)


@admin.register(Appointment)
class AppointmentAdmin(admin.ModelAdmin):
    list_display = ('patient_user', 'doctor_user', 'date', 'time', 'status')
    list_filter = ('doctor_user', 'date', 'status')
    search_fields = ('patient_user__username', 'doctor_user__username')
    ordering = ('-date', '-time')


admin.site.register(Billing)
admin.site.register(MedicalRecord)
admin.site.register(ChatLog)
admin.site.register(SecurityManager)
admin.site.register(Medicine)
admin.site.register(Prescription)