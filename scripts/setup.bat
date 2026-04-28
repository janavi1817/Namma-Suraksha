@echo off
REM APK Fraud Intelligence Platform - Setup Script for Windows

echo ==========================================
echo APK Fraud Intelligence Platform Setup
echo ==========================================
echo.

REM Check prerequisites
echo Checking prerequisites...

where docker >nul 2>nul
if %ERRORLEVEL% NEQ 0 (
    echo X Docker is not installed. Please install Docker Desktop first.
    exit /b 1
)

where docker-compose >nul 2>nul
if %ERRORLEVEL% NEQ 0 (
    echo X Docker Compose is not installed. Please install Docker Compose first.
    exit /b 1
)

echo + Docker and Docker Compose are installed
echo.

REM Create necessary directories
echo Creating directories...
if not exist "uploads" mkdir uploads
if not exist "backend\uploads" mkdir backend\uploads
echo + Directories created
echo.

REM Start services
echo Starting services with Docker Compose...
docker-compose up -d

echo.
echo Waiting for services to start...
timeout /t 10 /nobreak >nul

REM Check service health
echo.
echo Checking service health...

curl -s http://localhost:7474 >nul 2>nul
if %ERRORLEVEL% EQU 0 (
    echo + Neo4j is running
) else (
    echo ! Neo4j may not be ready yet
)

curl -s http://localhost:8000/api/stats >nul 2>nul
if %ERRORLEVEL% EQU 0 (
    echo + Backend API is running
) else (
    echo ! Backend API may not be ready yet
)

curl -s http://localhost:3000 >nul 2>nul
if %ERRORLEVEL% EQU 0 (
    echo + Frontend is running
) else (
    echo ! Frontend may not be ready yet
)

echo.
echo ==========================================
echo Setup Complete!
echo ==========================================
echo.
echo Access the platform:
echo   - Frontend:    http://localhost:3000
echo   - Backend API: http://localhost:8000
echo   - API Docs:    http://localhost:8000/docs
echo   - Neo4j:       http://localhost:7474
echo.
echo Neo4j Credentials:
echo   - Username: neo4j
echo   - Password: fraudintel123
echo.
echo To view logs:
echo   docker-compose logs -f
echo.
echo To stop services:
echo   docker-compose down
echo.
echo To run demo script:
echo   python scripts\demo_analysis.py
echo.
pause
