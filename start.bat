@echo off
echo ========================================================
echo   Maneuver Voice AI Agent - Launch Script
echo   Made by Soumoditya Das
echo ========================================================
echo.

echo [1/3] Setting up Next.js Frontend...
cd apps\web
call npm install
if %errorlevel% neq 0 (
    echo [ERROR] Frontend npm install failed. Please check your Node.js installation.
    pause
    exit /b %errorlevel%
)
cd ..\..

echo [2/3] Setting up Python Backend...
cd apps\agent

:: Try to find Python 3.12 or fallback to python
set PYTHON_CMD=python
py -3.12 --version >nul 2>&1
if %errorlevel% equ 0 set PYTHON_CMD=py -3.12

if not exist .venv (
    echo Creating Python virtual environment using %PYTHON_CMD%...
    %PYTHON_CMD% -m venv .venv
)

call .venv\Scripts\activate.bat
echo Installing Python dependencies (this might take a minute)...
python -m pip install --upgrade pip
pip install -r requirements.txt
if %errorlevel% neq 0 (
    echo [ERROR] Backend pip install failed. Please ensure you have Python 3.10-3.12 installed.
    pause
    exit /b %errorlevel%
)
cd ..\..

echo.
echo ========================================================
echo   All dependencies installed successfully!
echo   Launching full-stack services in separate windows...
echo ========================================================
echo.

:: Start Next.js Frontend
echo Starting Frontend (Port 5000) in Production Mode...
start "Founder Voice - Frontend (Next.js)" cmd /c "cd apps\web && npm run build && npm run start"

:: Start FastAPI Lead Server
echo Starting API Server (Port 8001)...
start "Founder Voice - Lead API (FastAPI)" cmd /c "cd apps\agent && call .venv\Scripts\activate.bat && python api.py"

:: Start LiveKit Voice Agent
echo Starting LiveKit Voice Agent...
start "Founder Voice - AI Agent (LiveKit)" cmd /c "cd apps\agent && call .venv\Scripts\activate.bat && python agent.py"

echo.
echo The app is now launching! 
echo Please wait about 10-15 seconds for the servers to boot up, 
echo then open your browser and navigate to: http://localhost:5000
echo.
pause
