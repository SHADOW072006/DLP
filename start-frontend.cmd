@echo off
title IntelliDLP Frontend Dashboard
cd /d "%~dp0\frontend"
echo ========================================================
echo   Starting IntelliDLP React 18 + Vite Frontend
echo   URL: http://localhost:3000
echo ========================================================
call npm run dev
pause
