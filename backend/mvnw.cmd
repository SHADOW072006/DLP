@REM ----------------------------------------------------------------------------
@REM IntelliDLP Maven Wrapper Batch Script
@REM ----------------------------------------------------------------------------
@echo off
setlocal

where mvn >nul 2>nul
if %ERRORLEVEL% equ 0 (
    mvn %*
    exit /b %ERRORLEVEL%
)

set "IDEA_MVN=C:\Program Files\JetBrains\IntelliJ IDEA 2025.3.3\plugins\maven\lib\maven3\bin\mvn.cmd"
if exist "%IDEA_MVN%" (
    call "%IDEA_MVN%" %*
    exit /b %ERRORLEVEL%
)

echo [ERROR] Apache Maven was not found on PATH or in standard JetBrains plugin directory.
echo Please install Maven or add it to PATH.
exit /b 1

