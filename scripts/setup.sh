#!/bin/bash

# APK Fraud Intelligence Platform - Setup Script

set -e

echo "=========================================="
echo "APK Fraud Intelligence Platform Setup"
echo "=========================================="
echo ""

# Check prerequisites
echo "Checking prerequisites..."

if ! command -v docker &> /dev/null; then
    echo "❌ Docker is not installed. Please install Docker first."
    exit 1
fi

if ! command -v docker-compose &> /dev/null; then
    echo "❌ Docker Compose is not installed. Please install Docker Compose first."
    exit 1
fi

echo "✅ Docker and Docker Compose are installed"
echo ""

# Create necessary directories
echo "Creating directories..."
mkdir -p uploads
mkdir -p backend/uploads
echo "✅ Directories created"
echo ""

# Start services
echo "Starting services with Docker Compose..."
docker-compose up -d

echo ""
echo "Waiting for services to start..."
sleep 10

# Check service health
echo ""
echo "Checking service health..."

# Check Neo4j
if curl -s http://localhost:7474 > /dev/null; then
    echo "✅ Neo4j is running"
else
    echo "⚠️  Neo4j may not be ready yet"
fi

# Check Backend
if curl -s http://localhost:8000/api/stats > /dev/null; then
    echo "✅ Backend API is running"
else
    echo "⚠️  Backend API may not be ready yet"
fi

# Check Frontend
if curl -s http://localhost:3000 > /dev/null; then
    echo "✅ Frontend is running"
else
    echo "⚠️  Frontend may not be ready yet"
fi

echo ""
echo "=========================================="
echo "Setup Complete!"
echo "=========================================="
echo ""
echo "Access the platform:"
echo "  • Frontend:    http://localhost:3000"
echo "  • Backend API: http://localhost:8000"
echo "  • API Docs:    http://localhost:8000/docs"
echo "  • Neo4j:       http://localhost:7474"
echo ""
echo "Neo4j Credentials:"
echo "  • Username: neo4j"
echo "  • Password: fraudintel123"
echo ""
echo "To view logs:"
echo "  docker-compose logs -f"
echo ""
echo "To stop services:"
echo "  docker-compose down"
echo ""
echo "To run demo script:"
echo "  python scripts/demo_analysis.py"
echo ""
