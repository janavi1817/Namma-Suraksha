# APK Provenance & Fraud Intelligence Platform - Architecture

## System Overview

The platform consists of four main components working together to detect and trace fraudulent APKs:

```
┌─────────────┐      ┌─────────────┐      ┌─────────────┐      ┌─────────────┐
│   Frontend  │─────▶│   Backend   │─────▶│   Neo4j     │      │  ML Engine  │
│   (React)   │      │  (FastAPI)  │      │   Graph DB  │      │  (sklearn)  │
└─────────────┘      └─────────────┘      └─────────────┘      └─────────────┘
                            │
                            ▼
                     ┌─────────────┐
                     │ APK Analyzer│
                     │ (Androguard)│
                     └─────────────┘
```

## Component Details

### 1. APK Analyzer (`backend/apk_analyzer.py`)

Extracts comprehensive metadata from APK files:

- **Certificate Information**: Subject, issuer, fingerprint, validity period
- **Package Metadata**: Package name, version, SDK versions, components
- **Network Artifacts**: URLs, domains, IP addresses, emails, phone numbers
- **Suspicious APIs**: Dangerous method calls (Runtime.exec, DexClassLoader, etc.)
- **Permissions**: All requested Android permissions

**Technology**: Androguard for APK parsing, cryptography for certificate handling

### 2. Graph Database (`backend/graph_manager.py`)

Stores and queries relationships between APKs and infrastructure:

**Node Types**:
- APK: Represents analyzed applications
- Certificate: Signing certificates
- Domain: Contacted domains
- IP: IP addresses

**Relationships**:
- APK -[SIGNED_BY]-> Certificate
- APK -[CONNECTS_TO]-> Domain
- APK -[CONNECTS_TO]-> IP

**Key Queries**:
- Find root sources (certificates with multiple APKs)
- Identify repeat offenders (fraudulent APK campaigns)
- Trace relationship networks (depth-based graph traversal)

**Technology**: Neo4j graph database

### 3. Fraud Detection Engine (`backend/fraud_detector.py`)

Multi-layered fraud detection using rule-based and ML approaches:

**Detection Layers**:

1. **Permission Analysis**
   - Dangerous permission detection
   - Suspicious permission combinations (SMS + Contacts = phishing)
   - Weighted scoring based on risk level

2. **Certificate Validation**
   - Self-signed certificate detection
   - Generic subject name identification
   - Certificate reuse patterns

3. **API Usage Analysis**
   - High-risk API detection (code execution, dynamic loading)
   - Device fingerprinting APIs
   - SMS/call manipulation APIs

4. **Network Artifact Analysis**
   - Suspicious TLD detection (.tk, .ml, .ga, etc.)
   - Direct IP connection patterns
   - Domain reputation checking

5. **Threat Intelligence**
   - Hash-based malware signature matching
   - Integration point for VirusTotal/similar APIs

**Scoring**: Normalized 0-1 fraud score, threshold at 0.7 for classification

### 4. ML Clustering (`ml/clustering.py`)

Groups related APKs to identify fraud campaigns:

**Feature Extraction** (`ml/feature_extractor.py`):
- Permission-based features (32 dimensions)
- Certificate characteristics (5 dimensions)
- Network artifacts (5 dimensions)
- API usage patterns (3 dimensions)
- Metadata features (5 dimensions)

**Clustering Methods**:
- DBSCAN: Density-based clustering for campaign identification
- KMeans: Alternative for fixed-size clustering

**Output**: Clusters with common features, fraud scores, and member APKs

### 5. Frontend Dashboard (`frontend/`)

React-based investigator interface:

**Pages**:
- Dashboard: Statistics and quick actions
- Upload: APK submission and immediate analysis
- APK Details: Comprehensive analysis view
- Network Graph: Interactive relationship visualization
- Fraud Clusters: Campaign groupings
- Root Sources: Repeat offender identification

**Visualization**:
- Force-directed graph (react-force-graph)
- Charts and statistics (recharts)
- Material-UI components

## Data Flow

### APK Upload & Analysis Flow

```
1. User uploads APK → Frontend
2. Frontend sends to /api/apk/upload → Backend
3. Backend saves file and calls APKAnalyzer
4. APKAnalyzer extracts all metadata
5. GraphManager stores in Neo4j
6. FraudDetector runs analysis
7. Results returned to frontend
8. User views analysis + can explore graph
```

### Relationship Discovery Flow

```
1. User requests graph for APK ID
2. Backend queries Neo4j with depth parameter
3. Neo4j returns all connected nodes/edges
4. Backend transforms to visualization format
5. Frontend renders force-directed graph
6. User can click nodes to explore further
```

## Scalability Considerations

### Current Implementation
- Single-server deployment
- In-memory ML models
- Synchronous APK processing

### Production Enhancements

1. **Async Processing**
   - Celery task queue for APK analysis
   - Redis for job management
   - Background clustering jobs

2. **Distributed Storage**
   - S3/MinIO for APK storage
   - Neo4j clustering for graph data
   - Elasticsearch for full-text search

3. **ML Pipeline**
   - Batch feature extraction
   - Periodic model retraining
   - Online learning for new threats

4. **API Optimization**
   - Caching layer (Redis)
   - GraphQL for flexible queries
   - Pagination for large result sets

## Security Considerations

1. **APK Handling**
   - Sandboxed analysis environment
   - File size limits
   - Malware quarantine

2. **API Security**
   - Authentication (JWT)
   - Rate limiting
   - Input validation

3. **Data Privacy**
   - PII redaction from artifacts
   - Access control for sensitive data
   - Audit logging

## Evaluation Metrics

### Fraud Detection Accuracy
- Precision: TP / (TP + FP)
- Recall: TP / (TP + FN)
- F1 Score: Harmonic mean
- ROC-AUC: Overall performance

### Clustering Quality
- Silhouette score: Cluster cohesion
- Davies-Bouldin index: Cluster separation
- Manual validation: Expert review

### System Performance
- APK analysis time: < 30 seconds
- Graph query latency: < 1 second
- Clustering throughput: 1000 APKs/hour

## Future Enhancements

1. **Advanced ML**
   - Deep learning for bytecode analysis
   - Graph neural networks for relationship learning
   - Anomaly detection with autoencoders

2. **Threat Intelligence**
   - VirusTotal integration
   - MISP threat sharing
   - Real-time blacklist updates

3. **Forensics**
   - APK diffing for variant analysis
   - Timeline reconstruction
   - Attribution scoring

4. **Automation**
   - Automated takedown requests
   - Alert generation for new campaigns
   - Integration with SIEM systems
