"""
URL configuration for hms_backend project.

The `urlpatterns` list routes URLs to views. For more information please see:
    https://docs.djangoproject.com/en/6.0/topics/http/urls/
Examples:
Function views
    1. Add an import:  from my_app import views
    2. Add a URL to urlpatterns:  path('', views.home, name='home')
Class-based views
    1. Add an import:  from other_app.views import Home
    2. Add a URL to urlpatterns:  path('', Home.as_view(), name='home')
Including another URLconf
    1. Import the include() function: from django.urls import include, path
    2. Add a URL to urlpatterns:  path('blog/', include('blog.urls'))
"""
from django.contrib import admin
from django.urls import path, include
from rest_framework.routers import DefaultRouter
from core.views import (
    PatientViewSet,
    DoctorViewSet,
    AppointmentViewSet,
    BillingViewSet,
    MedicalRecordViewSet,
    ChatLogViewSet,
    SecurityManagerViewSet,
    SecurityLogsView,
    ChatbotView,
    LoginView,
    SignupView,
    DoctorListView,
    BookAppointmentView,
    MyAppointmentsView,
    PatientStatsView,
    UpdateDiagnosisView,
    MedicinesView,
    AddMedicineView,
    CreateBillView,
    MyBillsView,
    PrescriptionView,
    AddScheduleView,
    AvailableSlotsView,
    DoctorProfileView,
    DoctorAppointmentsView,
    UpdateAppointmentStatusView,
    AdminStatsView,
)

router = DefaultRouter()
router.register(r'patients', PatientViewSet)
router.register(r'doctors', DoctorViewSet)
router.register(r'appointments', AppointmentViewSet)
router.register(r'billings', BillingViewSet)
router.register(r'medical-records', MedicalRecordViewSet)
router.register(r'chatlogs', ChatLogViewSet)
router.register(r'security', SecurityManagerViewSet)

urlpatterns = [
    path('admin/', admin.site.urls),
    path('api/login/', LoginView.as_view()),
    path('api/signup/', SignupView.as_view()),
    path('api/chat/', ChatbotView.as_view()),
    path('api/security-logs/', SecurityLogsView.as_view()),
    path('api/doctors/', DoctorListView.as_view()),
    path('api/book-appointment/', BookAppointmentView.as_view()),
    path('api/my-appointments/', MyAppointmentsView.as_view()),
    path('api/patient-stats/', PatientStatsView.as_view()),
    path('api/appointments/<int:appointment_id>/diagnosis/', UpdateDiagnosisView.as_view()),
    path('api/medicines/', MedicinesView.as_view()),
    path('api/add-medicine/', AddMedicineView.as_view()),
    path('api/create-bill/', CreateBillView.as_view()),
    path('api/my-bills/', MyBillsView.as_view()),
    path('api/prescription/', PrescriptionView.as_view()),
    path('api/add-schedule/', AddScheduleView.as_view()),
    path('api/available-slots/', AvailableSlotsView.as_view()),
    path('api/doctor/profile/', DoctorProfileView.as_view()),
    path('api/doctor/appointments/', DoctorAppointmentsView.as_view()),
    path('api/doctor/update-appointment-status/', UpdateAppointmentStatusView.as_view()),
    path('api/admin/stats/', AdminStatsView.as_view()),
    path('api/', include(router.urls)),
]
