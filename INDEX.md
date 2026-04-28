# APK Provenance & Fraud Intelligence Platform - Documentation Index

## 📖 Documentation Overview

This platform provides comprehensive documentation to help you understand, deploy, and use the system effectively.

## 🚀 Getting Started

Start here if you're new to the platform:

1. **[GETTING_STARTED.md](GETTING_STARTED.md)** ⭐ START HERE
   - Prerequisites and installation
   - Quick start guide (5 minutes)
   - First APK analysis walkthrough
   - Troubleshooting common issues
   - Essential commands and URLs

2. **[README.md](README.md)**
   - Project overview
   - Key features
   - Quick start commands
   - Performance metrics
   - Technology stack

## 🏗️ Technical Documentation

Deep dive into the system architecture and design:

3. **[ARCHITECTURE.md](ARCHITECTURE.md)**
   - System components
   - Data flow diagrams
   - Technology choices
   - Scalability considerations
   - Security design

4. **[SYSTEM_FLOW.md](SYSTEM_FLOW.md)**
   - Visual flow diagrams
   - APK upload process
   - Fraud detection pipeline
   - Graph query flow
   - ML clustering process

## 🚢 Deployment & Operations

Production deployment and maintenance:

5. **[DEPLOYMENT.md](DEPLOYMENT.md)**
   - Production setup
   - Docker configuration
   - Environment variables
   - Monitoring and logging
   - Backup and recovery
   - Performance tuning

## 📚 Usage & Examples

Learn how to use the platform effectively:

6. **[USAGE_GUIDE.md](USAGE_GUIDE.md)**
   - Detailed feature walkthrough
   - API endpoint documentation
   - Use case examples
   - Batch processing scripts
   - Custom rule creation
   - Investigation workflows

## 📊 Evaluation & Metrics

Performance analysis and validation:

7. **[EVALUATION.md](EVALUATION.md)**
   - Accuracy metrics (F1, precision, recall)
   - Clustering quality
   - Tracing accuracy
   - Scalability benchmarks
   - Real-world applicability
   - Limitations and future work

## 📋 Project Summary

High-level overview for stakeholders:

8. **[PROJECT_SUMMARY.md](PROJECT_SUMMARY.md)**
   - Problem statement
   - Solution overview
   - Key features
   - Technology stack
   - Performance highlights
   - Use cases

## 📂 Code Documentation

### Backend (`backend/`)

- **main.py** - FastAPI application with REST endpoints
- **apk_analyzer.py** - APK metadata extraction using Androguard
- **fraud_detector.py** - Multi-layered fraud detection engine
- **graph_manager.py** - Neo4j graph database operations
- **models.py** - Pydantic data models

### Frontend (`frontend/src/`)

- **App.js** - Main React application
- **components/Dashboard.js** - Statistics dashboard
- **components/APKUpload.js** - APK upload interface
- **components/NetworkGraph.js** - Interactive graph visualization
- **components/FraudClusters.js** - Cluster exploration
- **components/RootSources.js** - Root source identification

### ML (`ml/`)

- **feature_extractor.py** - 32-dimensional feature engineering
- **clustering.py** - DBSCAN and KMeans clustering

### Tests (`tests/`)

- **test_apk_analyzer.py** - APK analyzer unit tests
- **test_fraud_detector.py** - Fraud detector unit tests

### Scripts (`scripts/`)

- **setup.sh** - Linux/Mac setup script
- **setup.bat** - Windows setup script
- **demo_analysis.py** - Interactive demo

## 🎯 Quick Navigation by Role

### For Investigators

Start with:
1. [GETTING_STARTED.md](GETTING_STARTED.md) - Setup
2. [USAGE_GUIDE.md](USAGE_GUIDE.md) - How to investigate
3. [README.md](README.md) - Feature overview

### For Developers

Start with:
1. [ARCHITECTURE.md](ARCHITECTURE.md) - System design
2. [SYSTEM_FLOW.md](SYSTEM_FLOW.md) - Data flows
3. Code documentation in `backend/` and `frontend/`

### For DevOps

Start with:
1. [DEPLOYMENT.md](DEPLOYMENT.md) - Production setup
2. [GETTING_STARTED.md](GETTING_STARTED.md) - Quick start
3. `docker-compose.yml` - Container configuration

### For Managers/Stakeholders

Start with:
1. [PROJECT_SUMMARY.md](PROJECT_SUMMARY.md) - Overview
2. [EVALUATION.md](EVALUATION.md) - Performance metrics
3. [README.md](README.md) - Key features

### For Security Researchers

Start with:
1. [EVALUATION.md](EVALUATION.md) - Accuracy metrics
2. [ARCHITECTURE.md](ARCHITECTURE.md) - Detection methods
3. [USAGE_GUIDE.md](USAGE_GUIDE.md) - Advanced features

## 📖 Documentation by Topic

### Installation & Setup
- [GETTING_STARTED.md](GETTING_STARTED.md) - Quick start
- [DEPLOYMENT.md](DEPLOYMENT.md) - Production deployment
- `docker-compose.yml` - Container configuration

### Features & Usage
- [README.md](README.md) - Feature overview
- [USAGE_GUIDE.md](USAGE_GUIDE.md) - Detailed usage
- [GETTING_STARTED.md](GETTING_STARTED.md) - First analysis

### Architecture & Design
- [ARCHITECTURE.md](ARCHITECTURE.md) - System design
- [SYSTEM_FLOW.md](SYSTEM_FLOW.md) - Flow diagrams
- [PROJECT_SUMMARY.md](PROJECT_SUMMARY.md) - Technical overview

### Performance & Evaluation
- [EVALUATION.md](EVALUATION.md) - Metrics and benchmarks
- [PROJECT_SUMMARY.md](PROJECT_SUMMARY.md) - Performance highlights

### API & Integration
- [USAGE_GUIDE.md](USAGE_GUIDE.md) - API examples
- http://localhost:8000/docs - Interactive API docs
- `backend/main.py` - Endpoint definitions

## 🔍 Finding Information

### Common Questions

**"How do I install the platform?"**
→ [GETTING_STARTED.md](GETTING_STARTED.md)

**"How accurate is the fraud detection?"**
→ [EVALUATION.md](EVALUATION.md) - 84% F1 score

**"How do I analyze an APK?"**
→ [USAGE_GUIDE.md](USAGE_GUIDE.md) - Section 1

**"What technology is used?"**
→ [README.md](README.md) - Technology Stack section

**"How does the system work?"**
→ [ARCHITECTURE.md](ARCHITECTURE.md) + [SYSTEM_FLOW.md](SYSTEM_FLOW.md)

**"How do I deploy to production?"**
→ [DEPLOYMENT.md](DEPLOYMENT.md)

**"What are the API endpoints?"**
→ [USAGE_GUIDE.md](USAGE_GUIDE.md) + http://localhost:8000/docs

**"How do I troubleshoot issues?"**
→ [GETTING_STARTED.md](GETTING_STARTED.md) - Troubleshooting section

**"Can I customize fraud detection?"**
→ [USAGE_GUIDE.md](USAGE_GUIDE.md) - Custom Rules section

**"What are the system requirements?"**
→ [GETTING_STARTED.md](GETTING_STARTED.md) - Prerequisites

## 📝 Additional Resources

### Configuration Files

- `docker-compose.yml` - Service orchestration
- `requirements.txt` - Python dependencies
- `frontend/package.json` - Node.js dependencies
- `.gitignore` - Git exclusions

### Example Scripts

- `scripts/demo_analysis.py` - Interactive demo
- `scripts/setup.sh` - Linux/Mac setup
- `scripts/setup.bat` - Windows setup

### Test Files

- `tests/test_apk_analyzer.py` - Analyzer tests
- `tests/test_fraud_detector.py` - Detector tests

## 🎓 Learning Path

### Beginner (Day 1)
1. Read [README.md](README.md) - 10 minutes
2. Follow [GETTING_STARTED.md](GETTING_STARTED.md) - 30 minutes
3. Upload first APK - 5 minutes
4. Explore dashboard - 15 minutes

### Intermediate (Week 1)
1. Read [USAGE_GUIDE.md](USAGE_GUIDE.md) - 1 hour
2. Try all features - 2 hours
3. Explore API documentation - 1 hour
4. Run demo script - 30 minutes

### Advanced (Month 1)
1. Read [ARCHITECTURE.md](ARCHITECTURE.md) - 2 hours
2. Read [SYSTEM_FLOW.md](SYSTEM_FLOW.md) - 1 hour
3. Review code - 4 hours
4. Customize detection rules - 2 hours

### Expert (Ongoing)
1. Read [DEPLOYMENT.md](DEPLOYMENT.md) - 2 hours
2. Deploy to production - 4 hours
3. Integrate with other tools - varies
4. Contribute improvements - varies

## 🔄 Documentation Updates

This documentation is maintained alongside the codebase. When making changes:

1. Update relevant documentation files
2. Keep examples current
3. Update version numbers
4. Add new sections as needed
5. Review for accuracy

## 📞 Support

If you can't find what you're looking for:

1. Check the [GETTING_STARTED.md](GETTING_STARTED.md) troubleshooting section
2. Review API documentation at http://localhost:8000/docs
3. Search this index for keywords
4. Check code comments in source files
5. Contact support team

## ✅ Documentation Checklist

Before starting:
- [ ] Read [README.md](README.md) for overview
- [ ] Follow [GETTING_STARTED.md](GETTING_STARTED.md) for setup
- [ ] Verify all services are running
- [ ] Complete first APK analysis
- [ ] Bookmark this index for reference

---

**Start your journey: [GETTING_STARTED.md](GETTING_STARTED.md)**
