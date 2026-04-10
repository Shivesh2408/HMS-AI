@echo off
cd /d "C:\Program Files\PostgreSQL\18\bin"
psql.exe -U postgres -d hms_db -c "ALTER USER hms_user CREATEDB;"
echo Permissions updated. Press Enter to exit.
pause
