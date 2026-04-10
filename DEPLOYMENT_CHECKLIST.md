# HMS Backend Deployment Checklist

## Database Setup
- [ ] PostgreSQL installed/running
- [ ] Database created
- [ ] Database user created with proper permissions
- [ ] Connection verified
- [ ] `.env` file created with correct credentials

## Django Setup
- [ ] `pip install -r requirements.txt` executed
- [ ] `.env` file configured
- [ ] Run `python manage.py migrate`
- [ ] Run `python manage.py collectstatic` (if DEBUG=False)
- [ ] Create superuser: `python manage.py createsuperuser`

## Security (Production)
- [ ] DEBUG = False in .env
- [ ] SECRET_KEY updated and stored securely
- [ ] ALLOWED_HOSTS configured for production domain
- [ ] CORS settings reviewed and restricted
- [ ] HTTPS enabled on server
- [ ] Database password stored securely (use AWS Secrets, Vault, etc.)

## Environment Variables Required
```
DB_NAME=hms_db
DB_USER=hms_user
DB_PASSWORD=[SECURE PASSWORD]
DB_HOST=postgres_server_ip
DB_PORT=5432
DEBUG=False
SECRET_KEY=[DJANGO SECRET KEY]
ALLOWED_HOSTS=yourdomain.com,www.yourdomain.com
```

## Testing
- [ ] Local development works: `python manage.py runserver`
- [ ] Admin panel accessible
- [ ] API endpoints responding
- [ ] Database operations working

## Deployment Options
- **Local Server**: PostgreSQL + Django runserver
- **Docker**: docker-compose up -d
- **Cloud**: 
  - Railway.app
  - Heroku
  - DigitalOcean App Platform
  - AWS (RDS + EC2/ECS)

## Frontend Integration
- [ ] Django CORS properly configured
- [ ] React API endpoints point to correct backend URL
- [ ] Authentication tokens working

## Post-Deployment
- [ ] Monitor database performance
- [ ] Set up automated backups
- [ ] Configure logging
- [ ] Test API rate limiting
- [ ] Monitor API response times
