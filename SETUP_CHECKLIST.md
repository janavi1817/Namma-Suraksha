# Setup Checklist - APK Fraud Intelligence Platform

Use this checklist to ensure you have everything needed to run the platform.

## ✅ Pre-Installation Checklist

### System Requirements
- [ ] Operating System: Windows 10/11, macOS 10.15+, or Linux (Ubuntu 20.04+)
- [ ] CPU: 4+ cores (8+ recommended)
- [ ] RAM: 8GB minimum (16GB recommended)
- [ ] Storage: 50GB free space (100GB recommended)
- [ ] Internet: Stable connection for downloads

### Software Prerequisites
- [ ] Python 3.11 or higher installed
- [ ] Node.js 18 or higher installed
- [ ] Docker Desktop installed and running
- [ ] Docker Compose available
- [ ] Git installed (for cloning repository)

### Account Setup
- [ ] Kaggle account created
- [ ] Kaggle API token downloaded (`kaggle.json`)
- [ ] Kaggle API configured (`~/.kaggle/kaggle.json`)

## ✅ Installation Checklist

### Step 1: Clone Repository
- [ ] Repository cloned to local machine
- [ ] Changed directory to project root
- [ ] Verified all files present

### Step 2: Install Dependencies
- [ ] Python virtual environment created
- [ ] Python dependencies installed (`pip install -r requirements.txt`)
- [ ] Frontend dependencies installed (`npm install`)
- [ ] All packages installed without errors

### Step 3: Setup Directories
- [ ] Data directories created (`data/`)
- [ ] Upload directories created (`uploads/`)
- [ ] Model directories created (`models/`)
- [ ] Log directories created (`logs/`)

### Step 4: Download Datasets (Optional)
- [ ] Kaggle CLI working (`kaggle datasets list`)
- [ ] Android Malware Dataset downloaded
- [ ] CICMalDroid 2020 downloaded (optional)
- [ ] Malicious URLs dataset downloaded
- [ ] Malicious IPs dataset downloaded
- [ ] Datasets extracted to correct directories

### Step 5: Start Services
- [ ] Neo4j container started
- [ ] Neo4j accessible at http://localhost:7474
- [ ] Neo4j credentials working (neo4j/fraudintel123)
- [ ] Backend server started
- [ ] Backend accessible at http://localhost:8000
- [ ] Frontend server started
- [ ] Frontend accessible at http://localhost:3000

## ✅ Verification Checklist

### Backend Verification
- [ ] API docs accessible at http://localhost:8000/docs
- [ ] `/api/stats` endpoint returns data
- [ ] No errors in backend logs
- [ ] Python imports working correctly

### Frontend Verification
- [ ] Dashboard loads without errors
- [ ] Navigation working
- [ ] Charts rendering correctly
- [ ] No console errors in browser

### Database Verification
- [ ] Neo4j browser accessible
- [ ] Can connect with credentials
- [ ] Database is empty (ready for data)
- [ ] Constraints created successfully

### Integration Verification
- [ ] Frontend can communicate with backend
- [ ] Backend can communicate with Neo4j
- [ ] File upload works
- [ ] API responses are correct

## ✅ Optional Features Checklist

### External APIs (Optional)
- [ ] VirusTotal API key obtained
- [ ] AbuseIPDB API key obtained
- [ ] URLScan.io API key obtained
- [ ] API keys added to `.env` file

### ML Models (Optional)
- [ ] Training datasets prepared
- [ ] Feature extraction tested
- [ ] Models trained
- [ ] Models saved to `models/trained/`

### Production Setup (Optional)
- [ ] HTTPS configured
- [ ] Authentication enabled
- [ ] Rate limiting configured
- [ ] Monitoring setup
- [ ] Backup strategy defined

## ✅ Testing Checklist

### Unit Tests
- [ ] Backend tests pass (`pytest tests/`)
- [ ] No test failures
- [ ] Code coverage acceptable

### Integration Tests
- [ ] Can upload sample APK
- [ ] Analysis completes successfully
- [ ] Results displayed correctly
- [ ] Graph visualization works

### Demo Script
- [ ] Demo script runs (`python scripts/demo_analysis.py`)
- [ ] Sample data loads
- [ ] Analysis completes
- [ ] Results are accurate

## 🔧 Troubleshooting Checklist

If something doesn't work, check:

### Port Conflicts
- [ ] Port 3000 available (frontend)
- [ ] Port 7474 available (Neo4j browser)
- [ ] Port 7687 available (Neo4j bolt)
- [ ] Port 8000 available (backend)

### Permission Issues
- [ ] Docker has necessary permissions
- [ ] User in docker group (Linux)
- [ ] File permissions correct (755 for scripts)
- [ ] Kaggle credentials readable (600)

### Network Issues
- [ ] Internet connection stable
- [ ] Firewall not blocking ports
- [ ] Docker network working
- [ ] DNS resolution working

### Dependency Issues
- [ ] Python version correct (3.11+)
- [ ] Node version correct (18+)
- [ ] All pip packages installed
- [ ] All npm packages installed
- [ ] No version conflicts

## 📊 Dataset Checklist

### Essential Datasets (Minimum)
- [ ] Android Malware Dataset (~5GB)
- [ ] Malicious URLs (~100MB)
- [ ] Malicious IPs (~10MB)
- [ ] Total: ~5.1GB

### Recommended Datasets (Full)
- [ ] Android Malware Dataset (~5GB)
- [ ] CICMalDroid 2020 (~8GB)
- [ ] Drebin Dataset (~2GB)
- [ ] Malicious URLs (~100MB)
- [ ] Malicious IPs (~10MB)
- [ ] Android Certificates (~500MB)
- [ ] Total: ~15.6GB

### Dataset Verification
- [ ] Files extracted correctly
- [ ] No corrupted archives
- [ ] CSV files readable
- [ ] APK files valid
- [ ] Correct directory structure

## 🎯 Quick Commands Reference

### Check Installations
```bash
python --version          # Should be 3.11+
node --version           # Should be 18+
docker --version         # Should be installed
kaggle datasets list     # Should work
```

### Start Services
```bash
# All services
docker-compose up -d

# Backend only
cd backend && uvicorn main:app --reload

# Frontend only
cd frontend && npm start
```

### Check Status
```bash
# Docker containers
docker-compose ps

# Backend health
curl http://localhost:8000/api/stats

# Frontend health
curl http://localhost:3000

# Neo4j health
curl http://localhost:7474
```

### View Logs
```bash
# Docker logs
docker-compose logs -f

# Backend logs
cd backend && tail -f logs/app.log

# Frontend logs
cd frontend && npm start (shows in terminal)
```

## 📞 Getting Help

If you're stuck:

1. **Check Documentation**
   - [REQUIREMENTS.md](REQUIREMENTS.md) - Detailed requirements
   - [GETTING_STARTED.md](GETTING_STARTED.md) - Step-by-step guide
   - [DATASETS.md](DATASETS.md) - Dataset information
   - [DEPLOYMENT.md](DEPLOYMENT.md) - Production setup

2. **Check Logs**
   - Backend: `docker-compose logs backend`
   - Neo4j: `docker-compose logs neo4j`
   - Frontend: Browser console (F12)

3. **Common Issues**
   - Port conflicts: Change ports in `docker-compose.yml`
   - Permission denied: Run with `sudo` or fix permissions
   - Out of memory: Increase Docker memory limit
   - Dataset errors: Re-download with `--force` flag

4. **Verify Setup**
   - Run: `./scripts/install_all.sh` again
   - Check: All items in this checklist
   - Test: Upload a sample APK

## ✨ Success Criteria

You're ready to use the platform when:

- ✅ All services running without errors
- ✅ Dashboard accessible and loading
- ✅ Can upload and analyze an APK
- ✅ Results display correctly
- ✅ Graph visualization works
- ✅ No errors in logs

## 🎉 Next Steps

Once everything is checked:

1. **Upload First APK**
   - Go to http://localhost:3000/upload
   - Select an APK file
   - Click "Analyze APK"
   - Review results

2. **Explore Features**
   - View dashboard statistics
   - Check fraud clusters
   - Explore network graphs
   - Identify root sources

3. **Read Documentation**
   - [USAGE_GUIDE.md](USAGE_GUIDE.md) - How to use features
   - [ARCHITECTURE.md](ARCHITECTURE.md) - System design
   - [EVALUATION.md](EVALUATION.md) - Performance metrics

4. **Customize Platform**
   - Add custom fraud rules
   - Train ML models
   - Configure external APIs
   - Set up production deployment

---

**Completed all checks?** You're ready to start investigating APK fraud! 🚀
