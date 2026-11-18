@echo off
title IntelliDLP Backend Server
cd /d "%~dp0\backend"
echo ========================================================
echo   Starting IntelliDLP Spring Boot 3.3.4 Backend Server
echo   Port: 8080 (Context: /)
echo ========================================================
call mvnw.cmd spring-boot:run
pause
