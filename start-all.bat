@echo off
title DeployFlow Full-Stack Starter
echo ===================================================
echo    Starting DeployFlow Full-Stack System...
echo ===================================================

for /f "tokens=1-2 delims=: " %%a in ('netstat -ano ^| findstr :5000') do (
  if not "%%b"=="" (
    echo Port 5000 is already in use. A stale DeployFlow backend may still be running.
    echo Leaving the existing backend running and starting only the frontend.
    goto start_frontend
  )
)

echo Starting DeployFlow Backend (Port 5000)...
start "DeployFlow Backend (Port 5000)" cmd /k "cd /d %~dp0server && npm run dev"

:start_frontend
echo ===================================================
echo    Starting DeployFlow Frontend (Port 5173)...
echo ===================================================
start "DeployFlow Frontend (Port 5173)" cmd /k "cd /d %~dp0client && npm run dev"

echo.
echo Frontend and backend are launching in separate windows.
echo If port 5000 was already occupied, the existing backend was left active.
echo MongoDB is already active in the background.
echo.
pause
