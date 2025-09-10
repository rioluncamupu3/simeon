@echo off
echo ===================================
echo INCOME TRACKER - Vercel Deployment
echo ===================================
echo.

echo Checking if Vercel CLI is installed...
vercel --version > nul 2>&1
if %errorlevel% neq 0 (
  echo Vercel CLI is not installed. Installing now...
  npm install -g vercel
) else (
  echo Vercel CLI is already installed.
)

echo.
echo Building the application...
npm run build

echo.
echo Ready to deploy to Vercel!
echo.
echo Options:
echo 1. Deploy to preview (development)
echo 2. Deploy to production
echo 3. Exit
echo.

set /p choice=Enter your choice (1-3): 

if "%choice%"=="1" (
  echo.
  echo Deploying to preview environment...
  vercel
) else if "%choice%"=="2" (
  echo.
  echo Deploying to production environment...
  vercel --prod
) else if "%choice%"=="3" (
  echo.
  echo Deployment cancelled.
  exit /b 0
) else (
  echo.
  echo Invalid choice. Exiting.
  exit /b 1
)

echo.
echo Deployment process completed!