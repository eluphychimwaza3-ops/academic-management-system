@echo off
echo ========================================
echo Database Connection Diagnostics
echo ========================================
echo.

echo [1] Checking if MySQL is listening on port 4406...
netstat -ano | findstr :4406
echo.

echo [2] Checking MySQL Connection Details...
echo Host: localhost
echo Port: 4406
echo User: root
echo Password: (empty)
echo Database: college_management_system
echo.

echo [3] Connection string being used:
echo mysql://root@localhost:4406/college_management_system
echo.

echo ========================================
echo ACTION REQUIRED:
echo ========================================
echo 1. Open XAMPP Control Panel
echo 2. Check that MySQL service shows as RUNNING
echo 3. Verify it's using port 4406
echo 4. If not running, click START next to MySQL
echo 5. Wait 10 seconds for MySQL to fully start
echo 6. Return to your app and try logging in again
echo.

echo If MySQL is already running but connection still fails:
echo - Check XAMPP MySQL Configuration
echo - Look in XAMPP logs for errors
echo - Try restarting MySQL service
echo.

pause
