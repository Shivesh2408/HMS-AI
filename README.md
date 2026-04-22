# 🏥 Hospital Management System (HMS)

A full-stack healthcare management platform built with Django REST Framework and React. Manage appointments, prescriptions, patient records, and billing with role-based access control for patients, doctors, and administrators.

---

## ✨ Key Features

### 👤 Patient Features
- Browse and view doctor profiles with specialization and credentials
- Book appointments with available time slots
- View appointment history and status updates
- Access medical records and prescription history
- View and manage billing records
- Purchase medicines from pharmacy
- AI-powered diagnostic chatbot

### 👨‍⚕️ Doctor Features
- View and manage patient appointments
- Accept, reject, or complete appointments with diagnosis
- Set availability schedule and define appointment slots
- Create and manage patient prescriptions
- View doctor profile and credentials
- Track patient medical history

### 👨‍💼 Admin Features
- System-wide dashboard with key statistics
- View total patients, doctors, and appointment metrics
- Monitor appointment status breakdown
- Manage pharmacy inventory and medicines
- Access security audit logs
- Track all user activities

### 🔒 Security & Access Control
- Token-based API authentication
- Role-based access control (RBAC)
- Protected routes with automatic redirects
- Security audit logging for all actions
- CORS and CSRF protection

---

## 🏗️ Tech Stack

### Backend
- **Framework**: Django 4.x + Django REST Framework
- **Database**: SQLite
- **Authentication**: Token-based (DRF TokenAuthentication)
- **AI Integration**: Google Gemini API
- **Server**: Python WSGI/ASGI

### Frontend
- **Framework**: React 18.x
- **Styling**: Tailwind CSS
- **HTTP Client**: Fetch API
- **Routing**: React Router
- **State Management**: React Hooks

---

## 📁 Project Structure

```
HMS/
├── hms_backend/                    # Django REST API
│   ├── core/                       # Main application
│   │   ├── models.py              # Database models
│   │   ├── views.py               # API endpoints
│   │   ├── serializers.py         # Data serialization
│   │   ├── diag.py                # AI diagnostics
│   │   └── migrations/            # Database migrations
│   ├── hms_backend/               # Project config
│   │   ├── settings.py            # Django settings
│   │   ├── urls.py                # API routes
│   │   ├── wsgi.py                # Production server
│   │   └── asgi.py                # Async server
│   ├── manage.py                  # Django CLI
│   └── requirements.txt           # Python dependencies
│
└── hms-frontend/                   # React Frontend
    ├── src/
    │   ├── App.js                 # Main routing
    │   ├── ProtectedRoute.jsx     # Role-based route guard
    │   ├── *Dashboard.jsx         # Dashboard pages
    │   ├── authUtils.js           # Authentication utilities
    │   ├── firebase.config.js     # Firebase setup
    │   └── *.jsx                  # Feature components
    ├── package.json               # NPM dependencies
    └── public/                    # Static assets
```

---

## 🗄️ Database Models

| Model | Purpose |
|-------|---------|
| **User** | Django built-in authentication |
| **UserProfile** | Role assignment (patient/doctor/admin) |
| **Patient** | Patient demographic data |
| **Doctor** | Doctor credentials and profile |
| **Appointment** | Booking management with status tracking |
| **DoctorSchedule** | Doctor availability and slot definition |
| **Medicine** | Pharmacy inventory |
| **Prescription** | Medicine orders linked to appointments |
| **Bill / BillItem** | Billing and payment tracking |
| **MedicalRecord** | Patient medical history |
| **ChatLog** | AI chatbot conversation history |
| **SecurityManager** | Audit logs for all user actions |

---

## 🚀 Quick Start

### Prerequisites
- Python 3.8+
- Node.js 14+
- pip and npm
- Git

### Backend Setup

```bash
# Navigate to backend directory
cd hms_backend

# Create and activate virtual environment
python -m venv .venv
.venv\Scripts\activate          # Windows
source .venv/bin/activate       # macOS/Linux

# Install dependencies
pip install -r requirements.txt

# Create .env file with configuration
echo "SECRET_KEY=your-secret-key-here
DEBUG=True
ALLOWED_HOSTS=localhost,127.0.0.1
GEMINI_API_KEY=your-gemini-api-key" > .env

# Apply database migrations
python manage.py migrate

# (Optional) Load sample data
python manage.py populate_db

# Start development server
python manage.py runserver 0.0.0.0:8000
```

**Backend will be available at**: `http://localhost:8000`

### Frontend Setup

```bash
# Navigate to frontend directory
cd hms-frontend

# Install dependencies
npm install

# Create .env file
echo "REACT_APP_API_URL=http://localhost:8000" > .env

# Start development server
npm start
```

**Frontend will be available at**: `http://localhost:3000`

---

## 🔐 Authentication & Authorization

### Login Flow

1. User enters credentials on login page
2. Frontend sends `POST /api/login/` with username and password
3. Backend validates credentials and returns authentication token
4. Token stored in localStorage for subsequent API calls
5. User role determines which dashboard/routes are accessible

### API Authentication

All protected endpoints require the authorization token in the header:

```javascript
const token = localStorage.getItem('authToken');

fetch('http://localhost:8000/api/my-appointments/', {
  headers: {
    'Authorization': `Token ${token}`,
    'Content-Type': 'application/json'
  }
})
```

### Test Credentials (after `populate_db`)

```
Patient:  username=john    password=john
Doctor:   username=dr_smith password=dr_smith
Admin:    username=admin   password=admin
```

---

## 👥 Role-Based Access Control

### Patient Permissions
- ✅ View doctor list and profiles
- ✅ Book appointments with available slots
- ✅ View own appointments and status
- ✅ Access medical records
- ✅ View billing records
- ✅ Purchase medicines
- ❌ Access doctor or admin dashboards

### Doctor Permissions
- ✅ View own appointments
- ✅ Accept/reject appointments
- ✅ Add diagnosis and medical notes
- ✅ Create prescriptions
- ✅ Set availability schedule
- ✅ View own profile
- ❌ Access patient or admin dashboards
- ❌ Book appointments as patient

### Admin Permissions
- ✅ View system-wide statistics
- ✅ View all appointments
- ✅ Manage pharmacy medicines
- ✅ View security audit logs
- ✅ Monitor system health
- ❌ Direct patient/doctor data access

---

## 🔌 API Endpoints Overview

### Authentication
```
POST   /api/login/              Login with credentials
POST   /api/signup/             Register new user
```

### Patient Endpoints
```
GET    /api/doctors/            List all doctors
GET    /api/doctor/<id>/        Get doctor details
POST   /api/book-appointment/   Book appointment
GET    /api/my-appointments/    List user's appointments
GET    /api/patient-stats/      Dashboard statistics
GET    /api/medical-history/    Medical records
GET    /api/my-bills/           Billing records
GET    /api/available-slots/    Available appointment slots
```

### Doctor Endpoints
```
GET    /api/doctor/appointments/             List appointments
POST   /api/doctor/update-appointment-status/  Accept/reject appointment
POST   /api/add-schedule/                    Set availability
POST   /api/add-prescription/                Create prescription
GET    /api/doctor/profile/                  Doctor profile
```

### Admin Endpoints
```
GET    /api/admin/stats/        System statistics
GET    /api/security-logs/      Audit logs
POST   /api/add-medicine/       Add medicine
GET    /api/medicines/          List medicines
```

---

## 🔄 Key Workflows

### Workflow 1: Patient Books Appointment
1. Patient logs in (token stored)
2. Browse doctors via `/api/doctors/`
3. Select doctor and date
4. Fetch available slots via `/api/available-slots/?doctor_id=X&date=YYYY-MM-DD`
5. Book appointment via `POST /api/book-appointment/`
6. View booking in "My Appointments"

### Workflow 2: Doctor Manages Appointments
1. Doctor logs in
2. View appointments via `/api/doctor/appointments/`
3. Accept appointment via `POST /api/doctor/update-appointment-status/`
4. Add diagnosis and notes
5. Create prescription via `POST /api/add-prescription/`

### Workflow 3: Admin Views Dashboard
1. Admin logs in
2. Dashboard fetches `/api/admin/stats/`
3. Displays total patients, doctors, appointments
4. Shows appointment status breakdown
5. Lists recent bookings

---

## 🛠️ Development

### Database Migrations

```bash
# Create migration after model changes
python manage.py makemigrations

# Apply migrations
python manage.py migrate

# Show migration history
python manage.py showmigrations

# Rollback to specific migration
python manage.py migrate core 0009
```

### Django Management Commands

```bash
# Create admin superuser
python manage.py createsuperuser

# Access Django shell
python manage.py shell

# Load sample data
python manage.py populate_db
```

### Frontend Build

```bash
# Production build
npm run build

# Run tests
npm test

# Eject configuration (irreversible)
npm eject
```

---

## 📊 Data Flow

```
Frontend (React)
    ↓ Login/Authentication
    ↓ fetch() with auth token
Backend (Django)
    ↓ Validate token in header
    ↓ Route to APIView
    ↓ Check user role permissions
    ↓ Query database
Database (SQLite)
    ↓ Django ORM
    ↓ Return data
Backend (Django)
    ↓ Serialize response
Frontend (React)
    ↓ Set state & render UI
```

---

## 🐛 Troubleshooting

### Login Not Working
- Ensure both backend and frontend are running
- Check CORS configuration in `hms_backend/settings.py`
- Verify `ALLOWED_HOSTS` includes your frontend URL
- Check browser console for network errors

### Protected Routes Redirecting
- Verify auth token in localStorage: `localStorage.authToken`
- Check user role matches route requirements: `localStorage.userRole`
- Clear cache and retry login
- Check browser DevTools → Application tab → localStorage

### API Returns 401 Unauthorized
- Token may be expired, try login again
- Verify token header format: `Authorization: Token <token>`
- Check token doesn't have extra spaces
- Ensure backend is running and accessible

### Appointment Slots Not Showing
- Verify doctor has schedule set via `/api/add-schedule/`
- Check date format is `YYYY-MM-DD`
- Ensure doctor availability overlaps with selected date
- Check for existing appointments blocking slots

---

## 📚 Documentation Files

- **[QUICK_START.md](./QUICK_START.md)** - Fast setup guide
- **[COMPLETE_SETUP_GUIDE.md](./COMPLETE_SETUP_GUIDE.md)** - Detailed setup instructions
- **[FIREBASE_MIGRATION_GUIDE.md](./FIREBASE_MIGRATION_GUIDE.md)** - Firebase integration guide
- **[COMPONENT_MIGRATION_DETAILS.md](./COMPONENT_MIGRATION_DETAILS.md)** - Component structure details

---

## 🤝 Contributing

Contributions are welcome! To contribute:

1. Create a feature branch (`git checkout -b feature/amazing-feature`)
2. Commit changes (`git commit -m 'Add amazing feature'`)
3. Push to branch (`git push origin feature/amazing-feature`)
4. Open a Pull Request

---

## 📝 Environment Configuration

### Backend (.env)
```env
# Django settings
SECRET_KEY=your-django-secret-key
DEBUG=True
ALLOWED_HOSTS=localhost,127.0.0.1

# API Integration
GEMINI_API_KEY=your-google-gemini-api-key

# Database
# (SQLite is default, no additional config needed)
```

### Frontend (.env)
```env
REACT_APP_API_URL=http://localhost:8000
```

---

## 📞 Support & Issues

For issues and questions:
1. Check existing documentation files
2. Review the [COMPLETE_SETUP_GUIDE.md](./COMPLETE_SETUP_GUIDE.md)
3. Check backend logs: `python manage.py runserver` output
4. Check frontend logs: Browser DevTools Console tab
5. Open an issue with detailed error messages

---

## 📄 License

This project is part of the Hospital Management System initiative. All rights reserved.

---

## 🎯 Next Steps

1. **Run the application** following the Quick Start guide
2. **Explore the code**:
   - Start with `hms_backend/core/models.py` for database structure
   - Review `hms_backend/core/views.py` for API logic
   - Check `hms-frontend/src/App.js` for routing
3. **Test workflows** using provided test credentials
4. **Customize** for your specific hospital needs

---

## 📅 Project Information

- **Created**: 2024-2025
- **Last Updated**: April 2026
- **Status**: Production Ready
- **Maintenance**: Active

---

**Happy coding! 🚀**
