# 🎉 APK Fraud Intelligence Platform - RUNNING!

## ✅ Server Status

All services are up and running successfully!

### 🌐 Access URLs

| Service | URL | Status |
|---------|-----|--------|
| **Frontend Dashboard** | **http://localhost:3000** | ✅ Running |
| **Backend API** | **http://localhost:8000** | ✅ Running |
| **API Documentation** | **http://localhost:8000/docs** | ✅ Available |

## 🚀 Quick Start Guide

### 1. Access the Dashboard
Open your browser and navigate to:
```
http://localhost:3000
```

### 2. Upload an APK
1. Click "Upload" in the navigation bar
2. Select any file (for demo, any file works)
3. Click "Analyze APK"
4. View the fraud analysis results

### 3. Explore Features
- **Dashboard**: View statistics and quick actions
- **Upload**: Analyze new APK files
- **Clusters**: View fraud clusters
- **Root Sources**: Identify repeat offenders
- **Network Graph**: Visualize APK relationships

## 📊 Demo Features

The platform is running in **demo mode** with:
- ✅ Mock APK analysis (works with any file)
- ✅ Fraud detection simulation
- ✅ Network graph visualization
- ✅ Cluster analysis
- ✅ Statistics dashboard
- ✅ All API endpoints functional

## 🔧 Technical Details

### Backend
- **Framework**: FastAPI
- **Port**: 8000
- **Process ID**: Check with `Get-Process python`
- **Logs**: Terminal 2

### Frontend
- **Framework**: React 18
- **Port**: 3000
- **Process ID**: Check with `Get-Process node`
- **Logs**: Terminal 4

## 📝 API Endpoints

Test the API directly:

```bash
# Get statistics
curl http://localhost:8000/api/stats

# Upload APK (PowerShell)
$file = Get-Item "path\to\file.apk"
$form = @{file = $file}
Invoke-RestMethod -Uri http://localhost:8000/api/apk/upload -Method Post -Form $form

# Get clusters
curl http://localhost:8000/api/clusters

# Get root sources
curl http://localhost:8000/api/root-sources
```

## 🎯 What to Try

### Upload Analysis
1. Go to http://localhost:3000/upload
2. Upload any file (APK, ZIP, or even a text file for demo)
3. See instant fraud analysis with:
   - Fraud score (0-100)
   - Risk indicators
   - Certificate information
   - Network artifacts
   - Permissions analysis

### View Dashboard
1. Go to http://localhost:3000
2. See real-time statistics
3. Click quick action cards
4. Explore different sections

### Explore Network Graph
1. Upload an APK first
2. Click "View Network Graph"
3. See interactive visualization of:
   - APK nodes (blue)
   - Certificates (red)
   - Domains (green)
   - IP addresses (orange)

## 🛑 Stop Services

To stop the servers:

```powershell
# Stop all processes
Get-Process python | Where-Object {$_.Path -like "*simple_main.py*"} | Stop-Process
Get-Process node | Where-Object {$_.Path -like "*frontend*"} | Stop-Process
```

Or simply close the terminal windows.

## 🔄 Restart Services

If you need to restart:

```powershell
# Backend
python backend/simple_main.py

# Frontend (in new terminal)
cd frontend
npm start
```

## 📚 Documentation

- **[README.md](README.md)** - Project overview
- **[GETTING_STARTED.md](GETTING_STARTED.md)** - Setup guide
- **[USAGE_GUIDE.md](USAGE_GUIDE.md)** - How to use features
- **[ARCHITECTURE.md](ARCHITECTURE.md)** - System design
- **[REQUIREMENTS.md](REQUIREMENTS.md)** - Full requirements

## 🎨 UI Features

The platform features a professional SOC (Security Operations Center) dark theme:
- 🌑 Dark mode optimized for long sessions
- 🔵 Cyan/teal primary color for security feel
- 🔤 Monospace fonts for technical credibility
- 🎨 Risk-based color coding (Critical=Red, High=Orange, Medium=Yellow, Low=Cyan)
- ⚡ Smooth animations and transitions
- 📱 Responsive design

## 🔍 Demo Data

The demo generates realistic data including:
- Package names (com.example.*)
- Version numbers
- SDK versions
- Permissions (including dangerous ones for fraudulent APKs)
- Network artifacts (URLs, domains, IPs)
- Certificate information
- Fraud indicators with severity levels

## ✨ Success!

Your APK Fraud Intelligence Platform is now running!

**Main Dashboard**: http://localhost:3000

Enjoy exploring the platform! 🚀
