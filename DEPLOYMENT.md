# Deployment Guide

## Prerequisites

- Docker & Docker Compose
- Python 3.11+
- Node.js 18+
- 8GB RAM minimum
- 50GB disk space

## Quick Start (Docker)

```bash
# Clone repository
git clone <repository-url>
cd apk-fraud-intel

# Start all services
docker-compose up -d

# Check service status
docker-compose ps

# View logs
docker-compose logs -f
```

Services will be available at:
- Frontend: http://localhost:3000
- Backend API: http://localhost:8000
- Neo4j Browser: http://localhost:7474
- API Docs: http://localhost:8000/docs

## Manual Setup

### 1. Backend Setup

```bash
cd backend

# Create virtual environment
python -m venv venv
source venv/bin/activate  # Windows: venv\Scripts\activate

# Install dependencies
pip install -r requirements.txt

# Set environment variables
export NEO4J_URI=bolt://localhost:7687
export NEO4J_USER=neo4j
export NEO4J_PASSWORD=fraudintel123

# Run server
uvicorn main:app --reload --host 0.0.0.0 --port 8000
```

### 2. Neo4j Setup

```bash
# Using Docker
docker run -d \
  --name neo4j \
  -p 7474:7474 -p 7687:7687 \
  -e NEO4J_AUTH=neo4j/fraudintel123 \
  -e NEO4J_PLUGINS='["apoc"]' \
  -v neo4j_data:/data \
  neo4j:5.13

# Or install locally from https://neo4j.com/download/
```

### 3. Frontend Setup

```bash
cd frontend

# Install dependencies
npm install

# Set environment
echo "REACT_APP_API_URL=http://localhost:8000" > .env

# Start development server
npm start
```

## Production Deployment

### Using Docker Compose (Recommended)

```bash
# Production configuration
docker-compose -f docker-compose.prod.yml up -d
```

### Manual Production Setup

#### Backend (with Gunicorn)

```bash
# Install production server
pip install gunicorn

# Run with multiple workers
gunicorn main:app \
  --workers 4 \
  --worker-class uvicorn.workers.UvicornWorker \
  --bind 0.0.0.0:8000 \
  --access-logfile - \
  --error-logfile -
```

#### Frontend (Build & Serve)

```bash
# Build production bundle
npm run build

# Serve with nginx
# Copy build/ to /var/www/html
# Configure nginx reverse proxy
```

#### Nginx Configuration

```nginx
server {
    listen 80;
    server_name your-domain.com;

    # Frontend
    location / {
        root /var/www/html;
        try_files $uri /index.html;
    }

    # Backend API
    location /api {
        proxy_pass http://localhost:8000;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
    }
}
```

## Environment Variables

### Backend

```bash
NEO4J_URI=bolt://neo4j:7687
NEO4J_USER=neo4j
NEO4J_PASSWORD=your-secure-password
UPLOAD_DIR=/app/uploads
MAX_UPLOAD_SIZE=100MB
```

### Frontend

```bash
REACT_APP_API_URL=http://your-api-domain.com
```

## Database Initialization

```bash
# Connect to Neo4j
docker exec -it neo4j cypher-shell -u neo4j -p fraudintel123

# Create constraints (automatically done by backend)
CREATE CONSTRAINT IF NOT EXISTS FOR (a:APK) REQUIRE a.id IS UNIQUE;
CREATE CONSTRAINT IF NOT EXISTS FOR (c:Certificate) REQUIRE c.fingerprint IS UNIQUE;
```

## Monitoring

### Health Checks

```bash
# Backend health
curl http://localhost:8000/api/stats

# Neo4j health
curl http://localhost:7474/db/neo4j/tx/commit
```

### Logs

```bash
# Docker logs
docker-compose logs -f backend
docker-compose logs -f neo4j

# Application logs
tail -f backend/app.log
```

## Backup & Recovery

### Neo4j Backup

```bash
# Stop Neo4j
docker-compose stop neo4j

# Backup data
docker run --rm \
  -v neo4j_data:/data \
  -v $(pwd)/backups:/backup \
  neo4j:5.13 \
  neo4j-admin database dump neo4j --to=/backup/neo4j-backup.dump

# Start Neo4j
docker-compose start neo4j
```

### Restore

```bash
docker run --rm \
  -v neo4j_data:/data \
  -v $(pwd)/backups:/backup \
  neo4j:5.13 \
  neo4j-admin database load neo4j --from=/backup/neo4j-backup.dump
```

## Scaling

### Horizontal Scaling

```bash
# Scale backend workers
docker-compose up -d --scale backend=3

# Add load balancer (nginx/haproxy)
```

### Neo4j Clustering

- Use Neo4j Enterprise for clustering
- Configure causal cluster with 3+ core servers
- Add read replicas for query scaling

## Troubleshooting

### Backend won't start

```bash
# Check Python version
python --version  # Should be 3.11+

# Check dependencies
pip list

# Check Neo4j connection
nc -zv localhost 7687
```

### Frontend build fails

```bash
# Clear cache
rm -rf node_modules package-lock.json
npm install

# Check Node version
node --version  # Should be 18+
```

### Neo4j connection errors

```bash
# Check Neo4j is running
docker ps | grep neo4j

# Check credentials
docker exec -it neo4j cypher-shell -u neo4j -p fraudintel123

# Reset password if needed
docker exec -it neo4j neo4j-admin set-initial-password newpassword
```

## Security Hardening

1. **Change default passwords**
2. **Enable HTTPS** (Let's Encrypt)
3. **Configure firewall** (UFW/iptables)
4. **Enable authentication** on all services
5. **Regular updates** of dependencies
6. **Implement rate limiting**
7. **Set up monitoring** (Prometheus/Grafana)

## Performance Tuning

### Neo4j

```conf
# neo4j.conf
dbms.memory.heap.initial_size=2g
dbms.memory.heap.max_size=4g
dbms.memory.pagecache.size=2g
```

### Backend

```python
# Increase worker count
workers = (2 * cpu_count) + 1

# Enable caching
# Add Redis for session/query caching
```

### Frontend

```bash
# Enable compression
# Use CDN for static assets
# Implement code splitting
```
