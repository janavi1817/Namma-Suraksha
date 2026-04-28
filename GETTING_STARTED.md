# Getting Started Guide

Welcome to the APK Provenance & Fraud Intelligence Platform! This guide will help you get up and running quickly.

## 📋 Prerequisites

Before you begin, ensure you have the following installed:

### Required
- **Docker Desktop** (recommended) - [Download](https://www.docker.com/products/docker-desktop)
- **Docker Compose** (included with Docker Desktop)

### Optional (for manual setup)
- **Python 3.11+** - [Download](https://www.python.org/downloads/)
- **Node.js 18+** - [Download](https://nodejs.org/)
- **Neo4j 5.13+** - [Download](https://neo4j.com/download/)

### System Requirements
- **RAM**: 8GB minimum, 16GB recommended
- **Disk Space**: 50GB free space
- **OS**: Windows 10/11, macOS 10.15+, or Linux

## 🚀 Quick Start (5 minutes)

### Step 1: Get the Code

```bash
# Clone the repository
git clone <repository-url>
cd apk-fraud-intel
```

### Step 2: Start the Platform

#### On Windows
```bash
# Run the setup script
scripts\setup.bat
```

#### On Linux/Mac
```bash
# Make script executable
chmod +x scripts/setup.sh

# Run the setup script
./scripts/setup.sh
```

#### Manual Docker Start
```bash
# Start all services
docker-compose up -d

# Wait for services to initialize (30-60 seconds)
```

### Step 3: Access the Platform

Open your browser and navigate to:

- **Frontend Dashboard**: http://localhost:3000
- **API Documentation**: http://localhost:8000/docs
- **Neo4j Browser**: http://localhost:7474

### Step 4: Verify Installation

```bash
# Check service status
docker-compose ps

# All services should show "Up" status
```

## 📱 First APK Analysis

### Using the Web Interface

1. **Navigate to Upload Page**
   - Open http://localhost:3000
   - Click "Upload" in the navigation bar

2. **Select APK File**
   - Click "Select APK File"
   - Choose an APK from your computer
   - Click "Analyze APK"

3. **View Results**
   - Wait 15-40 seconds for analysis
   - Review fraud score and indicators
   - Click "View Details" for comprehensive analysis
   - Click "View Network Graph" for relationship visualization

### Using the API

```bash
# Upload APK
curl -X POST http://localhost:8000/api/apk/upload \
  -F "file=@/path/to/your/app.apk"

# Response includes:
# - APK ID
# - Fraud score
# - Indicators
# - Analysis details
```

### Using the Demo Script

```bash
# Run interactive demo
python scripts/demo_analysis.py

# Follow the prompts to upload and analyze an APK
```

## 🎓 Learning the Platform

### 1. Explore the Dashboard

The main dashboard shows:
- Total APKs analyzed
- Unique certificates tracked
- Domains and IPs discovered
- Quick action cards

### 2. Understand Fraud Indicators

Each detection includes:
- **Type**: Category (permission, certificate, API, network)
- **Severity**: Critical, high, medium, low
- **Description**: What was detected
- **Evidence**: Specific data that triggered the alert

Example indicators:
- 🔴 **Critical**: Known malware signature
- 🟠 **High**: SMS + Contacts permissions (phishing)
- 🟡 **Medium**: Self-signed certificate
- 🟢 **Low**: Suspicious domain TLD

### 3. Explore the Network Graph

The interactive graph shows:
- **Blue nodes**: APKs
- **Red nodes**: Certificates
- **Green nodes**: Domains
- **Orange nodes**: IP addresses

Actions:
- **Click** nodes to see details
- **Drag** to rearrange
- **Scroll** to zoom
- **Pan** to explore

### 4. Investigate Fraud Clusters

Clusters group related APKs by:
- Common certificates
- Shared domains
- Similar permissions
- Behavioral patterns

Use clusters to:
- Identify fraud campaigns
- Track malware families
- Find related threats

### 5. Find Root Sources

Root sources are certificates used in multiple APKs, indicating:
- Coordinated campaigns
- Repeat offenders
- Threat actor infrastructure

## 🔧 Configuration

### Neo4j Credentials

Default credentials:
- **Username**: neo4j
- **Password**: fraudintel123

To change:
1. Edit `docker-compose.yml`
2. Update `NEO4J_AUTH` environment variable
3. Restart services: `docker-compose restart`

### Upload Limits

Default: 100MB per APK

To change:
1. Edit `backend/main.py`
2. Update `MAX_UPLOAD_SIZE`
3. Restart backend: `docker-compose restart backend`

### Fraud Detection Threshold

Default: 0.7 (70%)

To change:
1. Edit `backend/fraud_detector.py`
2. Update threshold in detection logic
3. Restart backend

## 📊 Understanding Results

### Fraud Score Interpretation

| Score | Classification | Action |
|-------|---------------|--------|
| 0.0 - 0.3 | Clean | Low risk, likely legitimate |
| 0.3 - 0.5 | Suspicious | Review indicators, investigate |
| 0.5 - 0.7 | Likely Fraud | High priority investigation |
| 0.7 - 1.0 | Fraudulent | Immediate action required |

### Common Fraud Patterns

1. **Phishing Apps**
   - SMS + Contacts permissions
   - Suspicious domains
   - Generic certificate

2. **Banking Trojans**
   - Overlay permissions
   - Accessibility service
   - C2 server connections

3. **Spyware**
   - Location + Camera + Microphone
   - Background services
   - Data exfiltration URLs

## 🛠️ Troubleshooting

### Services Won't Start

```bash
# Check Docker is running
docker --version

# Check ports are available
netstat -an | grep 3000  # Frontend
netstat -an | grep 8000  # Backend
netstat -an | grep 7474  # Neo4j

# View logs
docker-compose logs backend
docker-compose logs neo4j
```

### APK Upload Fails

**Issue**: "Only APK files allowed"
- **Solution**: Ensure file has .apk extension

**Issue**: "Upload failed"
- **Solution**: Check file size < 100MB
- **Solution**: Verify APK is not corrupted

**Issue**: "Analysis timeout"
- **Solution**: Large APKs take longer (up to 60s)
- **Solution**: Check backend logs for errors

### Graph Not Loading

**Issue**: Empty graph
- **Solution**: Ensure APK was analyzed successfully
- **Solution**: Check Neo4j connection in backend logs

**Issue**: Graph too large
- **Solution**: Reduce depth parameter (default: 2)
- **Solution**: Use filters to focus on specific nodes

### Frontend Not Loading

```bash
# Check frontend is running
curl http://localhost:3000

# Restart frontend
docker-compose restart frontend

# Check browser console for errors
```

## 📚 Next Steps

### Learn More

1. **Read Documentation**
   - [ARCHITECTURE.md](ARCHITECTURE.md) - System design
   - [USAGE_GUIDE.md](USAGE_GUIDE.md) - Detailed usage
   - [EVALUATION.md](EVALUATION.md) - Performance metrics

2. **Explore API**
   - Visit http://localhost:8000/docs
   - Try interactive API documentation
   - Test endpoints with sample data

3. **Run Tests**
   ```bash
   # Unit tests
   python -m pytest tests/
   
   # Integration tests
   python scripts/demo_analysis.py
   ```

### Advanced Usage

1. **Batch Analysis**
   - Upload multiple APKs
   - Compare results
   - Identify patterns

2. **Custom Rules**
   - Edit `backend/fraud_detector.py`
   - Add organization-specific detection
   - Adjust scoring weights

3. **Export Data**
   - Use API to export graph data
   - Generate investigation reports
   - Share findings with team

### Production Deployment

For production use:
1. Read [DEPLOYMENT.md](DEPLOYMENT.md)
2. Configure HTTPS
3. Set up authentication
4. Enable monitoring
5. Configure backups

## 🆘 Getting Help

### Common Questions

**Q: How accurate is the fraud detection?**
A: 84% F1 score, 87% precision, 82% recall on test dataset

**Q: Can I analyze iOS apps?**
A: Currently only Android APKs are supported

**Q: How long does analysis take?**
A: 15-40 seconds depending on APK size and complexity

**Q: Is my data secure?**
A: APKs are stored locally, not shared externally

**Q: Can I integrate with other tools?**
A: Yes, via REST API (see API documentation)

### Support Resources

- **Documentation**: See docs/ folder
- **API Reference**: http://localhost:8000/docs
- **Issue Tracker**: [GitHub Issues]
- **Community**: [Discussion Forum]

## ✅ Checklist

Before you start investigating:

- [ ] All services running (docker-compose ps)
- [ ] Frontend accessible (http://localhost:3000)
- [ ] Backend accessible (http://localhost:8000)
- [ ] Neo4j accessible (http://localhost:7474)
- [ ] Test APK uploaded successfully
- [ ] Fraud score displayed
- [ ] Network graph loads
- [ ] Dashboard shows statistics

## 🎯 Quick Reference

### Essential Commands

```bash
# Start platform
docker-compose up -d

# Stop platform
docker-compose down

# View logs
docker-compose logs -f

# Restart service
docker-compose restart backend

# Check status
docker-compose ps

# Run demo
python scripts/demo_analysis.py
```

### Essential URLs

- Dashboard: http://localhost:3000
- API Docs: http://localhost:8000/docs
- Neo4j: http://localhost:7474
- Upload: http://localhost:3000/upload
- Clusters: http://localhost:3000/clusters

### Essential API Endpoints

```bash
# Upload APK
POST /api/apk/upload

# Get analysis
GET /api/apk/{id}/analysis

# Get graph
GET /api/graph/relationships/{id}

# Get clusters
GET /api/clusters

# Get stats
GET /api/stats
```

---

**Ready to start? Upload your first APK at http://localhost:3000/upload**
