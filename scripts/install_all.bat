@echo off
REM APK Fraud Intelligence Platform - Windows Installation Script

echo ==========================================
echo APK Fraud Intelligence Platform
echo Complete Installation Script
echo ==========================================
echo.

REM Check Python
echo Checking prerequisites...
echo.

where python >nul 2>nul
if %ERRORLEVEL% NEQ 0 (
    echo X Python not found
    echo Please install Python 3.11+ from https://www.python.org/
    exit /b 1
)

for /f "tokens=2" %%i in ('python --version 2^>^&1') do set PYTHON_VERSION=%%i
echo Python: %PYTHON_VERSION%
echo + Python installed

REM Check Node.js
where node >nul 2>nul
if %ERRORLEVEL% NEQ 0 (
    echo X Node.js not found
    echo Please install Node.js 18+ from https://nodejs.org/
    exit /b 1
)

for /f "tokens=1" %%i in ('node --version 2^>^&1') do set NODE_VERSION=%%i
echo Node.js: %NODE_VERSION%
echo + Node.js installed

REM Check Docker
where docker >nul 2>nul
if %ERRORLEVEL% NEQ 0 (
    echo X Docker not found
    echo Please install Docker Desktop from https://www.docker.com/
    exit /b 1
)

for /f "tokens=3" %%i in ('docker --version 2^>^&1') do set DOCKER_VERSION=%%i
echo Docker: %DOCKER_VERSION%
echo + Docker installed

REM Check Docker Compose
where docker-compose >nul 2>nul
if %ERRORLEVEL% NEQ 0 (
    echo X Docker Compose not found
    exit /b 1
)

echo + Docker Compose installed

REM Check Kaggle
where kaggle >nul 2>nul
if %ERRORLEVEL% NEQ 0 (
    echo ! Kaggle CLI not found
    echo Installing Kaggle CLI...
    pip install kaggle
)

echo.
echo ==========================================
echo Installing Dependencies
echo ==========================================
echo.

REM Create virtual environment
echo Creating Python virtual environment...
if not exist "venv" (
    python -m venv venv
    echo + Virtual environment created
) else (
    echo Virtual environment already exists
)

REM Activate virtual environment
echo Activating virtual environment...
call venv\Scripts\activate.bat

REM Upgrade pip
echo Upgrading pip...
python -m pip install --upgrade pip >nul 2>&1
echo + Pip upgraded

REM Install Python dependencies
echo Installing Python dependencies...
pip install -r requirements.txt >nul 2>&1
echo + Python dependencies installed

REM Install frontend dependencies
echo Installing frontend dependencies...
cd frontend
call npm install >nul 2>&1
cd ..
echo + Frontend dependencies installed

echo.
echo ==========================================
echo Setting Up Directories
echo ==========================================
echo.

REM Create required directories
echo Creating data directories...
if not exist "data\apk-samples" mkdir data\apk-samples
if not exist "data\cicmaldroid" mkdir data\cicmaldroid
if not exist "data\drebin" mkdir data\drebin
if not exist "data\malicious-urls" mkdir data\malicious-urls
if not exist "data\malicious-ips" mkdir data\malicious-ips
if not exist "data\certificates" mkdir data\certificates
if not exist "uploads" mkdir uploads
if not exist "backend\uploads" mkdir backend\uploads
if not exist "models\trained" mkdir models\trained
if not exist "models\checkpoints" mkdir models\checkpoints
if not exist "logs" mkdir logs
if not exist "backups" mkdir backups
echo + Directories created

echo.
echo ==========================================
echo Starting Services
echo ==========================================
echo.

REM Start Neo4j
echo Starting Neo4j database...
docker-compose up -d neo4j
echo + Neo4j started

REM Wait for Neo4j
echo Waiting for Neo4j to initialize (30 seconds)...
timeout /t 30 /nobreak >nul

REM Check Neo4j health
curl -s http://localhost:7474 >nul 2>&1
if %ERRORLEVEL% EQU 0 (
    echo + Neo4j is running
) else (
    echo ! Neo4j health check failed
)

echo.
echo ==========================================
echo Installation Complete!
echo ==========================================
echo.
echo Services Status:
echo   - Neo4j:    http://localhost:7474 (neo4j/fraudintel123)
echo   - Backend:  Ready to start
echo   - Frontend: Ready to start
echo.
echo To start the platform:
echo.
echo   Terminal 1 - Backend:
echo     venv\Scripts\activate
echo     cd backend
echo     uvicorn main:app --reload --host 0.0.0.0 --port 8000
echo.
echo   Terminal 2 - Frontend:
echo     cd frontend
echo     npm start
echo.
echo   Or use Docker:
echo     docker-compose up -d
echo.
echo Access the platform:
echo   - Dashboard:  http://localhost:3000
echo   - API Docs:   http://localhost:8000/docs
echo   - Neo4j:      http://localhost:7474
echo.
echo For more information, see:
echo   - GETTING_STARTED.md
echo   - REQUIREMENTS.md
echo   - USAGE_GUIDE.md
echo.
pause
