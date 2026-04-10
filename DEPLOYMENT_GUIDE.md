# HMS-AI Deployment Guide

## Overview
- **Frontend**: React app deployed on Vercel
- **Backend**: Django REST API deployed on Render.com with PostgreSQL
- **Database**: PostgreSQL managed by Render

---

## Part 1: Deploy Backend to Render.com

### Step 1: Create Render Account
1. Go to https://render.com
2. Sign up with GitHub account
3. Authorize Render to access your GitHub repositories

### Step 2: Create PostgreSQL Database
1. Dashboard → New → PostgreSQL
2. Name: `hms-db`
3. Region: Choose closest to you
4. PostgreSQL Version: 15
5. Create Database
6. Copy the Internal Database URL (you'll need this)

### Step 3: Create Web Service
1. Dashboard → New → Web Service
2. Connect your HMS-AI GitHub repository
3. Settings:
   - **Name**: `hms-api`
   - **Runtime**: Python 3.11
   - **Build Command**: 
     ```
     cd hms_backend && pip install -r requirements.txt && python manage.py migrate
     ```
   - **Start Command**:
     ```
     cd hms_backend && gunicorn hms_backend.wsgi:application
     ```

### Step 4: Set Environment Variables
In Render dashboard, add these environment variables:

```
DEBUG=False
SECRET_KEY=<your-django-secret-key>
ALLOWED_HOSTS=hms-api.onrender.com
DB_NAME=hms_db
DB_USER=hms_user
DB_PASSWORD=<postgres-password-from-render>
DB_HOST=<internal-database-url>
DB_PORT=5432
GEMINI_API_KEY=AIzaSyBlGdzXtmtU6ia1gycsJJY3-7HIAbN-fJQ
```

### Step 5: Update Django Settings for Production
Edit `hms_backend/settings.py`:
```python
# Change ALLOWED_HOSTS
ALLOWED_HOSTS = os.getenv('ALLOWED_HOSTS', '*').split(',')

# Add Render deployment fixes
if os.getenv('RENDER'):
    DATABASES['default']['CONN_MAX_AGE'] = 600
    DATABASES['default']['DISABLE_SERVER_SIDE_CURSORS'] = True
```

### Step 6: Install Gunicorn
Add to `hms_backend/requirements.txt`:
```
gunicorn==21.2.0
whitenoise==6.6.0
```

### Step 7: Deploy
1. Commit changes: `git add -A && git commit -m "Prepare for Render deployment"`
2. Push to GitHub: `git push origin main`
3. Render will auto-deploy

---

## Part 2: Deploy Frontend to Vercel

### Step 1: Create Vercel Account
1. Go to https://vercel.com
2. Sign up with GitHub
3. Grant access to your HMS-AI repository

### Step 2: Import Project
1. Dashboard → Add New → Project
2. Select HMS-AI repository
3. Framework Preset: Create React App

### Step 3: Configure Environment Variables
Add environment variables:
```
REACT_APP_API_URL=https://hms-api.onrender.com
```

### Step 4: Build Settings
- **Root Directory**: `hms-frontend`
- **Build Command**: `npm run build`
- **Output Directory**: `build`

### Step 5: Deploy
Click "Deploy" - Vercel will handle the rest!

---

## Part 3: Post-Deployment Steps

### 1. Create Superuser on Render
```bash
# From Render dashboard, go to Web Service → Shell
python hms_backend/manage.py createsuperuser
```

### 2. Collect Static Files (if needed)
```bash
# In your local terminal
cd hms_backend
python manage.py collectstatic --noinput
git add -A && git commit -m "Add static files"
git push origin main
```

### 3. Test the Deployment
1. Visit: `https://hms-ai.vercel.app` (or your Vercel URL)
2. Try login with superuser credentials
3. Test chatbot functionality

### 4. Update CORS Settings
In `hms_backend/settings.py`, update CORS for production:
```python
CORS_ALLOWED_ORIGINS = [
    "https://hms-ai.vercel.app",
    "http://localhost:3000",
    "http://localhost:3001",
    "http://localhost:3002",
]
```

---

## Troubleshooting

### Build Fails
- Check logs in Render/Vercel dashboard
- Ensure Python 3.11+ is specified
- Verify all dependencies in requirements.txt

### Database Connection Issues
- Verify DATABASE_URL in environment variables
- Check PostgreSQL credentials
- Run migrations: `python manage.py migrate`

### CORS Errors
- Update CORS_ALLOWED_ORIGINS in settings.py
- Redeploy application

### Chatbot Not Responding
- Verify GEMINI_API_KEY environment variable
- Check API key is valid on https://ai.google.dev/

---

## Monitoring & Logs

### Render Logs
- Dashboard → Web Service → Logs

### Vercel Logs
- Dashboard → Project → Deployments → Logs

### Database Logs
- Dashboard → PostgreSQL → Logs

---

## Next Steps
1. Set up custom domain (optional)
2. Enable HTTPS (automatic on both platforms)
3. Set up monitoring/alerts
4. Configure email notifications
5. Plan database backup strategy
