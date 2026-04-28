#!/bin/bash

echo "=========================================="
echo "APK Fraud Intelligence Platform"
echo "Complete Installation Script"
echo "=========================================="
echo ""

# Color codes
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Function to check command exists
command_exists() {
    command -v "$1" >/dev/null 2>&1
}

# Function to print status
print_status() {
    if [ $1 -eq 0 ]; then
        echo -e "${GREEN}✅ $2${NC}"
    else
        echo -e "${RED}❌ $2${NC}"
    fi
}

# Check prerequisites
echo "Checking prerequisites..."
echo ""

# Check Python
if command_exists python3; then
    python_version=$(python3 --version 2>&1 | awk '{print $2}')
    echo "Python: $python_version"
    print_status 0 "Python installed"
else
    print_status 1 "Python not found"
    echo "Please install Python 3.11+ from https://www.python.org/"
    exit 1
fi

# Check Node.js
if command_exists node; then
    node_version=$(node --version 2>&1)
    echo "Node.js: $node_version"
    print_status 0 "Node.js installed"
else
    print_status 1 "Node.js not found"
    echo "Please install Node.js 18+ from https://nodejs.org/"
    exit 1
fi

# Check Docker
if command_exists docker; then
    docker_version=$(docker --version 2>&1 | awk '{print $3}' | sed 's/,//')
    echo "Docker: $docker_version"
    print_status 0 "Docker installed"
else
    print_status 1 "Docker not found"
    echo "Please install Docker from https://www.docker.com/"
    exit 1
fi

# Check Docker Compose
if command_exists docker-compose; then
    compose_version=$(docker-compose --version 2>&1 | awk '{print $3}' | sed 's/,//')
    echo "Docker Compose: $compose_version"
    print_status 0 "Docker Compose installed"
else
    print_status 1 "Docker Compose not found"
    exit 1
fi

# Check Kaggle
if command_exists kaggle; then
    print_status 0 "Kaggle CLI installed"
else
    echo -e "${YELLOW}⚠️  Kaggle CLI not found${NC}"
    echo "Installing Kaggle CLI..."
    pip3 install kaggle
fi

echo ""
echo "=========================================="
echo "Installing Dependencies"
echo "=========================================="
echo ""

# Create virtual environment
echo "Creating Python virtual environment..."
if [ ! -d "venv" ]; then
    python3 -m venv venv
    print_status $? "Virtual environment created"
else
    echo "Virtual environment already exists"
fi

# Activate virtual environment
echo "Activating virtual environment..."
source venv/bin/activate
print_status $? "Virtual environment activated"

# Upgrade pip
echo "Upgrading pip..."
pip install --upgrade pip > /dev/null 2>&1
print_status $? "Pip upgraded"

# Install Python dependencies
echo "Installing Python dependencies..."
pip install -r requirements.txt > /dev/null 2>&1
print_status $? "Python dependencies installed"

# Install frontend dependencies
echo "Installing frontend dependencies..."
cd frontend
npm install > /dev/null 2>&1
install_status=$?
cd ..
print_status $install_status "Frontend dependencies installed"

echo ""
echo "=========================================="
echo "Setting Up Directories"
echo "=========================================="
echo ""

# Create required directories
echo "Creating data directories..."
mkdir -p data/{apk-samples,cicmaldroid,drebin,malicious-urls,malicious-ips,certificates}
mkdir -p uploads backend/uploads
mkdir -p models/{trained,checkpoints}
mkdir -p logs backups
print_status 0 "Directories created"

echo ""
echo "=========================================="
echo "Starting Services"
echo "=========================================="
echo ""

# Start Neo4j
echo "Starting Neo4j database..."
docker-compose up -d neo4j
print_status $? "Neo4j started"

# Wait for Neo4j
echo "Waiting for Neo4j to initialize (30 seconds)..."
sleep 30

# Check Neo4j health
if curl -s http://localhost:7474 > /dev/null; then
    print_status 0 "Neo4j is running"
else
    print_status 1 "Neo4j health check failed"
fi

echo ""
echo "=========================================="
echo "Downloading Datasets (Optional)"
echo "=========================================="
echo ""

read -p "Do you want to download datasets now? (y/n) " -n 1 -r
echo
if [[ $REPLY =~ ^[Yy]$ ]]; then
    if [ -f "scripts/download_datasets.sh" ]; then
        chmod +x scripts/download_datasets.sh
        ./scripts/download_datasets.sh
    else
        echo "Dataset download script not found"
    fi
else
    echo "Skipping dataset download. You can run it later with:"
    echo "  ./scripts/download_datasets.sh"
fi

echo ""
echo "=========================================="
echo "Installation Complete!"
echo "=========================================="
echo ""
echo "Services Status:"
echo "  • Neo4j:    http://localhost:7474 (neo4j/fraudintel123)"
echo "  • Backend:  Ready to start"
echo "  • Frontend: Ready to start"
echo ""
echo "To start the platform:"
echo ""
echo "  Terminal 1 - Backend:"
echo "    source venv/bin/activate"
echo "    cd backend"
echo "    uvicorn main:app --reload --host 0.0.0.0 --port 8000"
echo ""
echo "  Terminal 2 - Frontend:"
echo "    cd frontend"
echo "    npm start"
echo ""
echo "  Or use Docker:"
echo "    docker-compose up -d"
echo ""
echo "Access the platform:"
echo "  • Dashboard:  http://localhost:3000"
echo "  • API Docs:   http://localhost:8000/docs"
echo "  • Neo4j:      http://localhost:7474"
echo ""
echo "For more information, see:"
echo "  • GETTING_STARTED.md"
echo "  • REQUIREMENTS.md"
echo "  • USAGE_GUIDE.md"
echo ""
