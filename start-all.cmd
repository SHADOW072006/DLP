@echo off
title IntelliDLP Unified Launcher
echo ========================================================
echo   Launching IntelliDLP Defense Platform
echo   - Backend: http://localhost:8080/api/health
echo   - Frontend: http://localhost:3000/
echo ========================================================
start "IntelliDLP Backend" cmd /c "%~dp0start-backend.cmd"
timeout /t 5 /nobreak >nul
start "IntelliDLP Frontend" cmd /c "%~dp0start-frontend.cmd"
echo IntelliDLP services launched in separate windows.
