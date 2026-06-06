@echo off
REM Build + start all CodeSprout microservices with PM2 (Windows/local dev).
REM Usage: scripts\pm2-start.bat

setlocal

set "ROOT_DIR=%~dp0.."
cd /d "%ROOT_DIR%"

echo ==^> Installing backend deps
call npm ci --prefix backend
if errorlevel 1 exit /b 1

echo ==^> Building TypeScript
call npm run build --prefix backend
if errorlevel 1 exit /b 1

if not exist backend\logs mkdir backend\logs

where pm2 >nul 2>&1
if errorlevel 1 (
  echo ==^> PM2 not found, installing globally
  call npm install -g pm2
)

cd backend
call pm2 start ecosystem.config.cjs
call pm2 save

echo.
echo ==^> Status:
call pm2 list
echo.
echo Useful commands:
echo   pm2 logs
echo   pm2 logs codesprout-payment
echo   pm2 monit
echo   pm2 restart all
echo   pm2 stop all
echo   pm2 delete all
endlocal
