# PostgreSQL Setup Guide for HMS Backend

## Option 1: Using Docker (Recommended)

### Prerequisites
- Docker and Docker Compose installed

### Steps
1. Navigate to the backend directory:
   ```bash
   cd hms_backend
   ```

2. Start PostgreSQL container:
   ```bash
   docker-compose up -d
   ```

3. Verify PostgreSQL is running:
   ```bash
   docker-compose ps
   ```

4. Run migrations:
   ```bash
   python manage.py migrate
   ```

5. Create a superuser (optional):
   ```bash
   python manage.py createsuperuser
   ```

6. Stop PostgreSQL:
   ```bash
   docker-compose down
   ```

---

## Option 2: Manual PostgreSQL Installation (Windows)

### Prerequisites
- PostgreSQL 15+ installed from https://www.postgresql.org/download/windows/

### Steps
1. Open pgAdmin or PostgreSQL command line
2. Create a new database:
   ```sql
   CREATE DATABASE hms_db;
   CREATE USER hms_user WITH PASSWORD 'hms_password';
   ALTER ROLE hms_user SET client_encoding TO 'utf8';
   ALTER ROLE hms_user SET default_transaction_isolation TO 'read committed';
   ALTER ROLE hms_user SET default_transaction_deferrable TO on;
   ALTER ROLE hms_user SET default_transaction_deferrable TO on;
   GRANT ALL PRIVILEGES ON DATABASE hms_db TO hms_user;
   ```

3. Update `.env` file with your credentials:
   ```
   DB_NAME=hms_db
   DB_USER=hms_user
   DB_PASSWORD=your_password
   DB_HOST=localhost
   DB_PORT=5432
   ```

4. Activate virtual environment:
   ```bash
   venv\Scripts\activate
   ```

5. Install dependencies:
   ```bash
   pip install -r requirements.txt
   ```

6. Run migrations:
   ```bash
   python manage.py migrate
   ```

---

## Option 3: Manual PostgreSQL Installation (Ubuntu/Linux)

### Prerequisites
- Ubuntu/Linux with apt package manager

### Steps
1. Install PostgreSQL:
   ```bash
   sudo apt update
   sudo apt install postgresql postgresql-contrib
   ```

2. Create database and user:
   ```bash
   sudo su - postgres
   psql
   ```
   
   Then run these SQL commands:
   ```sql
   CREATE DATABASE hms_db;
   CREATE USER hms_user WITH PASSWORD 'hms_password';
   GRANT ALL PRIVILEGES ON DATABASE hms_db TO hms_user;
   ```

3. Update `.env` file with your credentials

4. Activate environment and install dependencies:
   ```bash
   source venv/bin/activate
   pip install -r requirements.txt
   ```

5. Run migrations:
   ```bash
   python manage.py migrate
   ```

---

## Environment Variables (.env)

Copy `.env.example` to `.env` and update values:
```
DB_NAME=hms_db
DB_USER=hms_user
DB_PASSWORD=your_secure_password
DB_HOST=localhost
DB_PORT=5432
DEBUG=True
SECRET_KEY=your-secret-key-here
ALLOWED_HOSTS=localhost,127.0.0.1
```

---

## Testing the Setup

1. Connect to database:
   ```bash
   python manage.py dbshell
   ```

2. Run migrations:
   ```bash
   python manage.py migrate
   ```

3. Create superuser:
   ```bash
   python manage.py createsuperuser
   ```

4. Start development server:
   ```bash
   python manage.py runserver
   ```

5. Access admin panel: http://localhost:8000/admin

---

## Troubleshooting

### Connection refused
- Check PostgreSQL is running (docker-compose ps)
- Verify credentials in .env file
- Check port 5432 is open

### psycopg2 installation error
- Install build tools: `pip install psycopg2-binary`
- On Windows, ensure Visual C++ build tools are installed

### Migration errors
- Run `python manage.py migrate --fake-initial` if database already has tables
