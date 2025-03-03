@echo off
echo Civilization 7 Turn Timer Utility
echo ================================
echo.

REM Check if Node.js is installed
where node >nul 2>nul
if %ERRORLEVEL% neq 0 (
  echo Node.js is not installed or not in your PATH.
  echo Please install Node.js from https://nodejs.org/
  echo.
  pause
  exit /b 1
)

REM Check if npm is installed
where npm >nul 2>nul
if %ERRORLEVEL% neq 0 (
  echo npm is not installed or not in your PATH.
  echo Please install Node.js from https://nodejs.org/
  echo.
  pause
  exit /b 1
)

echo Installing dependencies...
call npm install

if %ERRORLEVEL% neq 0 (
  echo Failed to install dependencies.
  echo.
  pause
  exit /b 1
)

echo.
echo Starting development server...
echo The application will open in your default browser.
echo Press Ctrl+C to stop the server.
echo.

call npm run dev

pause 