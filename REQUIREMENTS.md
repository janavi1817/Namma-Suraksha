# APK Fraud Intelligence Platform - Requirements & Setup

## 📊 Datasets Required

### 1. APK Malware Datasets (Kaggle)

#### Primary Dataset: Android Malware Dataset
**Source**: [Kaggle - Android Malware Dataset](https://www.kaggle.com/datasets/shashwatwork/android-malware-dataset-for-machine-learning)

**Contents**:
- 15,000+ Android APK samples
- Malware and benign classifications
- Permission features
- API call patterns
- Network behavior data

**Download**:
```bash
# Using Kaggle API
kaggle datasets download -d shashwatwork/android-malware-dataset-for-machine-learning
unzip android-malware-dataset-for-machine-learning.zip -d data/apk-samples/
```

#### Alternative Dataset: CICMalDroid 2020
**Source**: [Kaggle - CICMalDroid 2020](https://www.kaggle.com/datasets/subhajournal/cicmaldroid-2020)

**Contents**:
- 17,341 samples (4,354 malware, 12,987 benign)
- Static and dynamic analysis features
- Network traffic data
- API calls and permissions

**Download**:
```bash
kaggle datasets download -d subhajournal/cicmaldroid-2020
unzip cicmaldroid-2020.zip -d data/cicmaldroid/
```

#### Supplementary: Drebin Dataset
**Source**: [Kaggle - Drebin Android Malware](https://www.kaggle.com/datasets/xwolf12/drebin)

**Contents**:
- 5,560 malware samples
- 123,453 benign samples
- Feature vectors extracted
- Malware family labels

**Download**:
```bash
kaggle datasets download -d xwolf12/drebin
unzip drebin.zip -d data/drebin/
```

### 2. Threat Intelligence Datasets

#### Malicious URLs Dataset
**Source**: [Kaggle - Malicious URLs Dataset](https://www.kaggle.com/datasets/sid321axn/malicious-urls-dataset)

**Contents**:
- 651,191 URLs
- Benign, defacement, phishing, malware categories
- Domain features

**Download**:
```bash
kaggle datasets download -d sid321axn/malicious-urls-dataset
unzip malicious-urls-dataset.zip -d data/malicious-urls/
```

#### Malicious IP Addresses
**Source**: [Kaggle - Malicious IP Addresses](https://www.kaggle.com/datasets/kkhandekar/malicious-ip-addresses)

**Contents**:
- Known malicious IP addresses
- Threat categories
- Geographic data

**Download**:
```bash
kaggle datasets download -d kkhandekar/malicious-ip-addresses
unzip malicious-ip-addresses.zip -d data/malicious-ips/
```

### 3. Certificate & Signing Data

#### Android App Certificates
**Source**: [Kaggle - Android Certificates](https://www.kaggle.com/datasets/gauthamp10/android-app-certificates)

**Contents**:
- Certificate fingerprints
- Signing information
- Developer data

**Download**:
```bash
kaggle datasets download -d gauthamp10/android-app-certificates
unzip android-app-certificates.zip -d data/certificates/
```

## 🔧 System Requirements

### Hardware Requirements

#### Minimum
- **CPU**: 4 cores, 2.5 GHz
- **RAM**: 8 GB
- **Storage**: 50 GB free space
- **Network**: Stable internet connection

#### Recommended
- **CPU**: 8+ cores, 3.0+ GHz
- **RAM**: 16 GB
- **Storage**: 100 GB SSD
- **GPU**: Optional, for ML training acceleration
- **Network**: High-speed internet (for dataset downloads)

### Software Requirements

#### Operating System
- **Linux**: Ubuntu 20.04+ / Debian 11+ / CentOS 8+
- **macOS**: 10.15 (Catalina) or later
- **Windows**: Windows 10/11 with WSL2

#### Core Dependencies

##### Python (3.11+)
```bash
# Check version
python --version

# Install on Ubuntu/Debian
sudo apt update
sudo apt install python3.11 python3.11-venv python3-pip

# Install on macOS
brew install python@3.11

# Install on Windows
# Download from https://www.python.org/downloads/
```

##### Node.js (18+)
```bash
# Check version
node --version

# Install on Ubuntu/Debian
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt install -y nodejs

# Install on macOS
brew install node@18

# Install on Windows
# Download from https://nodejs.org/
```

##### Docker & Docker Compose
```bash
# Check versions
docker --version
docker-compose --version

# Install on Ubuntu/Debian
sudo apt update
sudo apt install docker.io docker-compose
sudo systemctl start docker
sudo systemctl enable docker
sudo usermod -aG docker $USER

# Install on macOS
# Download Docker Desktop from https://www.docker.com/products/docker-desktop

# Install on Windows
# Download Docker Desktop from https://www.docker.com/products/docker-desktop
```

##### Neo4j (5.13+)
```bash
# Using Docker (Recommended)
docker run -d \
  --name neo4j \
  -p 7474:7474 -p 7687:7687 \
  -e NEO4J_AUTH=neo4j/fraudintel123 \
  -e NEO4J_PLUGINS='["apoc"]' \
  -v neo4j_data:/data \
  neo4j:5.13

# Or install locally
# Ubuntu/Debian
wget -O - https://debian.neo4j.com/neotechnology.gpg.key | sudo apt-key add -
echo 'deb https://debian.neo4j.com stable latest' | sudo tee /etc/apt/sources.list.d/neo4j.list
sudo apt update
sudo apt install neo4j

# macOS
brew install neo4j
```

## 📦 Python Dependencies

### Backend Requirements
```txt
# Core Framework
fastapi==0.104.1
uvicorn[standard]==0.24.0
python-multipart==0.0.6

# APK Analysis
androguard==3.4.0
cryptography==41.0.7
python-magic==0.4.27

# Database
neo4j==5.14.1

# Machine Learning
scikit-learn==1.3.2
numpy==1.26.2
pandas==2.1.3
scipy==1.11.4

# Utilities
requests==2.31.0
aiofiles==23.2.1
pydantic==2.5.0
networkx==3.2.1

# Optional: For GPU acceleration
# torch==2.1.0
# tensorflow==2.15.0
```

### ML Training Requirements
```txt
# Additional for model training
jupyter==1.0.0
matplotlib==3.8.2
seaborn==0.13.0
plotly==5.18.0
imbalanced-learn==0.11.0
xgboost==2.0.3
lightgbm==4.1.0
```

## 📦 Frontend Dependencies

### Node.js Packages
```json
{
  "dependencies": {
    "react": "^18.2.0",
    "react-dom": "^18.2.0",
    "react-router-dom": "^6.20.1",
    "@mui/material": "^5.14.20",
    "@mui/icons-material": "^5.14.19",
    "@emotion/react": "^11.11.1",
    "@emotion/styled": "^11.11.0",
    "axios": "^1.6.2",
    "recharts": "^2.10.3",
    "react-force-graph": "^1.44.1",
    "lucide-react": "^0.294.0",
    "date-fns": "^3.0.0"
  }
}
```

## 🔑 API Keys & Credentials

### Optional External Services

#### VirusTotal API (Optional)
**Purpose**: Enhanced threat intelligence
**Sign up**: https://www.virustotal.com/gui/join-us
**Free tier**: 500 requests/day

```bash
# Add to .env file
VIRUSTOTAL_API_KEY=your_api_key_here
```

#### AbuseIPDB API (Optional)
**Purpose**: IP reputation checking
**Sign up**: https://www.abuseipdb.com/register
**Free tier**: 1,000 requests/day

```bash
# Add to .env file
ABUSEIPDB_API_KEY=your_api_key_here
```

#### URLScan.io API (Optional)
**Purpose**: URL analysis
**Sign up**: https://urlscan.io/user/signup
**Free tier**: 100 requests/day

```bash
# Add to .env file
URLSCAN_API_KEY=your_api_key_here
```

## 📁 Directory Structure Setup

```bash
# Create required directories
mkdir -p data/{apk-samples,cicmaldroid,drebin,malicious-urls,malicious-ips,certificates}
mkdir -p uploads
mkdir -p models/{trained,checkpoints}
mkdir -p logs
mkdir -p backups

# Set permissions
chmod 755 data uploads models logs backups
```

## 🔧 Kaggle API Setup

### Install Kaggle CLI
```bash
pip install kaggle
```

### Configure Kaggle Credentials
1. Go to https://www.kaggle.com/account
2. Scroll to "API" section
3. Click "Create New API Token"
4. Download `kaggle.json`

```bash
# Linux/macOS
mkdir -p ~/.kaggle
mv ~/Downloads/kaggle.json ~/.kaggle/
chmod 600 ~/.kaggle/kaggle.json

# Windows
mkdir %USERPROFILE%\.kaggle
move %USERPROFILE%\Downloads\kaggle.json %USERPROFILE%\.kaggle\
```

## 📥 Complete Dataset Download Script

Create `scripts/download_datasets.sh`:

```bash
#!/bin/bash

echo "Downloading APK Fraud Intelligence Datasets..."

# Create data directories
mkdir -p data/{apk-samples,cicmaldroid,drebin,malicious-urls,malicious-ips,certificates}

# Download Android Malware Dataset
echo "Downloading Android Malware Dataset..."
kaggle datasets download -d shashwatwork/android-malware-dataset-for-machine-learning
unzip -q android-malware-dataset-for-machine-learning.zip -d data/apk-samples/
rm android-malware-dataset-for-machine-learning.zip

# Download CICMalDroid 2020
echo "Downloading CICMalDroid 2020..."
kaggle datasets download -d subhajournal/cicmaldroid-2020
unzip -q cicmaldroid-2020.zip -d data/cicmaldroid/
rm cicmaldroid-2020.zip

# Download Drebin Dataset
echo "Downloading Drebin Dataset..."
kaggle datasets download -d xwolf12/drebin
unzip -q drebin.zip -d data/drebin/
rm drebin.zip

# Download Malicious URLs
echo "Downloading Malicious URLs Dataset..."
kaggle datasets download -d sid321axn/malicious-urls-dataset
unzip -q malicious-urls-dataset.zip -d data/malicious-urls/
rm malicious-urls-dataset.zip

# Download Malicious IPs
echo "Downloading Malicious IP Addresses..."
kaggle datasets download -d kkhandekar/malicious-ip-addresses
unzip -q malicious-ip-addresses.zip -d data/malicious-ips/
rm malicious-ip-addresses.zip

# Download Android Certificates
echo "Downloading Android Certificates..."
kaggle datasets download -d gauthamp10/android-app-certificates
unzip -q android-app-certificates.zip -d data/certificates/
rm android-app-certificates.zip

echo "All datasets downloaded successfully!"
echo "Total size: $(du -sh data/ | cut -f1)"
```

Make it executable:
```bash
chmod +x scripts/download_datasets.sh
./scripts/download_datasets.sh
```

## 🐍 Python Environment Setup

### Using venv
```bash
# Create virtual environment
python3.11 -m venv venv

# Activate
source venv/bin/activate  # Linux/macOS
venv\Scripts\activate     # Windows

# Install dependencies
pip install --upgrade pip
pip install -r requirements.txt
```

### Using conda
```bash
# Create environment
conda create -n apk-fraud python=3.11

# Activate
conda activate apk-fraud

# Install dependencies
pip install -r requirements.txt
```

## 🚀 Complete Installation Script

Create `scripts/install_all.sh`:

```bash
#!/bin/bash

echo "=== APK Fraud Intelligence Platform - Complete Installation ==="

# Check Python version
python_version=$(python3 --version 2>&1 | awk '{print $2}')
echo "Python version: $python_version"

# Check Node.js version
node_version=$(node --version 2>&1)
echo "Node.js version: $node_version"

# Check Docker
docker_version=$(docker --version 2>&1)
echo "Docker version: $docker_version"

# Install Python dependencies
echo ""
echo "Installing Python dependencies..."
pip install -r requirements.txt

# Install frontend dependencies
echo ""
echo "Installing frontend dependencies..."
cd frontend
npm install
cd ..

# Download datasets
echo ""
echo "Downloading datasets (this may take a while)..."
./scripts/download_datasets.sh

# Start Neo4j
echo ""
echo "Starting Neo4j database..."
docker-compose up -d neo4j

# Wait for Neo4j to be ready
echo "Waiting for Neo4j to initialize..."
sleep 30

echo ""
echo "=== Installation Complete! ==="
echo ""
echo "Next steps:"
echo "1. Start backend: cd backend && uvicorn main:app --reload"
echo "2. Start frontend: cd frontend && npm start"
echo "3. Access dashboard: http://localhost:3000"
```

Make it executable:
```bash
chmod +x scripts/install_all.sh
./scripts/install_all.sh
```

## 📋 Pre-flight Checklist

Before running the platform, ensure:

- [ ] Python 3.11+ installed
- [ ] Node.js 18+ installed
- [ ] Docker & Docker Compose installed
- [ ] Kaggle API configured
- [ ] Datasets downloaded (at least one)
- [ ] Neo4j running
- [ ] Python dependencies installed
- [ ] Frontend dependencies installed
- [ ] Ports available: 3000, 7474, 7687, 8000
- [ ] At least 50GB free disk space

## 🔍 Verification Commands

```bash
# Check Python packages
pip list | grep -E "fastapi|androguard|neo4j|scikit-learn"

# Check Node packages
cd frontend && npm list --depth=0

# Check Neo4j connection
curl http://localhost:7474

# Check dataset sizes
du -sh data/*

# Test backend
cd backend && python -c "import androguard; print('Androguard OK')"

# Test frontend
cd frontend && npm run build
```

## 📊 Dataset Statistics

After downloading, you should have approximately:

| Dataset | Size | Samples | Type |
|---------|------|---------|------|
| Android Malware | ~5 GB | 15,000+ | APK files |
| CICMalDroid 2020 | ~8 GB | 17,341 | APK files |
| Drebin | ~2 GB | 129,013 | Feature vectors |
| Malicious URLs | ~100 MB | 651,191 | URLs |
| Malicious IPs | ~10 MB | 50,000+ | IP addresses |
| Certificates | ~500 MB | 100,000+ | Certificates |

**Total**: ~15-20 GB

## 🆘 Troubleshooting

### Kaggle API Issues
```bash
# Test Kaggle connection
kaggle datasets list

# If authentication fails
cat ~/.kaggle/kaggle.json
chmod 600 ~/.kaggle/kaggle.json
```

### Dataset Download Failures
```bash
# Resume interrupted download
kaggle datasets download -d <dataset-name> --force

# Check disk space
df -h
```

### Memory Issues
```bash
# Increase Docker memory limit
# Docker Desktop > Settings > Resources > Memory: 8GB+

# For large datasets, process in batches
# Edit backend/apk_analyzer.py to add batch processing
```

## 📚 Additional Resources

- **Androguard Documentation**: https://androguard.readthedocs.io/
- **Neo4j Documentation**: https://neo4j.com/docs/
- **FastAPI Documentation**: https://fastapi.tiangolo.com/
- **React Documentation**: https://react.dev/
- **Kaggle Datasets**: https://www.kaggle.com/datasets

## 🔄 Keeping Datasets Updated

Create a cron job to update threat intelligence:

```bash
# Edit crontab
crontab -e

# Add weekly update (every Sunday at 2 AM)
0 2 * * 0 /path/to/scripts/download_datasets.sh >> /var/log/apk-fraud-update.log 2>&1
```

---

**Ready to start?** Follow the [GETTING_STARTED.md](GETTING_STARTED.md) guide after completing these requirements!
