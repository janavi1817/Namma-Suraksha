# System Flow Diagrams

## 1. APK Upload and Analysis Flow

```
┌─────────────┐
│    User     │
└──────┬──────┘
       │ 1. Upload APK
       ▼
┌─────────────────────┐
│  Frontend (React)   │
└──────────┬──────────┘
           │ 2. POST /api/apk/upload
           ▼
┌─────────────────────────────────────────────────────────┐
│              Backend (FastAPI)                          │
│  ┌──────────────────────────────────────────────────┐  │
│  │ 3. Save APK file                                 │  │
│  └────────────────┬─────────────────────────────────┘  │
│                   ▼                                     │
│  ┌──────────────────────────────────────────────────┐  │
│  │ 4. APK Analyzer                                  │  │
│  │    • Extract certificate                         │  │
│  │    • Parse manifest                              │  │
│  │    • Extract strings from DEX                    │  │
│  │    • Find URLs, IPs, domains                     │  │
│  │    • Detect suspicious APIs                      │  │
│  └────────────────┬─────────────────────────────────┘  │
│                   ▼                                     │
│  ┌──────────────────────────────────────────────────┐  │
│  │ 5. Graph Manager                                 │  │
│  │    • Create APK node                             │  │
│  │    • Create Certificate node                     │  │
│  │    • Create Domain nodes                         │  │
│  │    • Create IP nodes                             │  │
│  │    • Create relationships                        │  │
│  └────────────────┬─────────────────────────────────┘  │
│                   ▼                                     │
│  ┌──────────────────────────────────────────────────┐  │
│  │ 6. Fraud Detector                                │  │
│  │    • Check permissions                           │  │
│  │    • Validate certificate                        │  │
│  │    • Analyze APIs                                │  │
│  │    • Check network artifacts                     │  │
│  │    • Calculate fraud score                       │  │
│  └────────────────┬─────────────────────────────────┘  │
└───────────────────┼─────────────────────────────────────┘
                    │
                    ▼
         ┌─────────────────────┐
         │   Neo4j Database    │
         │  (Graph Storage)    │
         └─────────────────────┘
                    │
                    │ 7. Return results
                    ▼
         ┌─────────────────────┐
         │  Frontend Display   │
         │  • Fraud score      │
         │  • Indicators       │
         │  • Details link     │
         │  • Graph link       │
         └─────────────────────┘
```

## 2. Relationship Graph Query Flow

```
┌─────────────┐
│    User     │
│ (Clicks     │
│  "View      │
│  Graph")    │
└──────┬──────┘
       │ 1. Request graph
       ▼
┌─────────────────────┐
│  Frontend (React)   │
└──────────┬──────────┘
           │ 2. GET /api/graph/relationships/{id}?depth=2
           ▼
┌─────────────────────────────────────────────────────────┐
│              Backend (FastAPI)                          │
│  ┌──────────────────────────────────────────────────┐  │
│  │ 3. Graph Manager                                 │  │
│  │    Query: MATCH path = (a:APK {id: $id})        │  │
│  │           -[*1..2]-(related)                     │  │
│  │           RETURN path                            │  │
│  └────────────────┬─────────────────────────────────┘  │
└───────────────────┼─────────────────────────────────────┘
                    │
                    ▼
         ┌─────────────────────┐
         │   Neo4j Database    │
         │                     │
         │  (APK)─[SIGNED_BY]→(Cert)                     │
         │    │                  │                        │
         │    └─[CONNECTS_TO]→(Domain)                   │
         │    │                                           │
         │    └─[CONNECTS_TO]→(IP)                       │
         └─────────────────────┘
                    │
                    │ 4. Return nodes and edges
                    ▼
┌─────────────────────────────────────────────────────────┐
│              Backend (FastAPI)                          │
│  ┌──────────────────────────────────────────────────┐  │
│  │ 5. Transform to visualization format             │  │
│  │    • Extract nodes with properties               │  │
│  │    • Extract edges with types                    │  │
│  │    • Assign colors by node type                  │  │
│  └────────────────┬─────────────────────────────────┘  │
└───────────────────┼─────────────────────────────────────┘
                    │
                    │ 6. Return JSON
                    ▼
         ┌─────────────────────┐
         │  Frontend Display   │
         │  (Force Graph)      │
         │                     │
         │  • Blue: APK        │
         │  • Red: Certificate │
         │  • Green: Domain    │
         │  • Orange: IP       │
         └─────────────────────┘
```

## 3. Fraud Detection Pipeline

```
┌─────────────────────┐
│   APK Analysis      │
│   Results           │
└──────────┬──────────┘
           │
           ▼
┌─────────────────────────────────────────────────────────┐
│              Fraud Detector                             │
│                                                          │
│  ┌────────────────────────────────────────────────┐    │
│  │ Layer 1: Permission Analysis                   │    │
│  │  • Dangerous permissions (SEND_SMS, etc.)      │    │
│  │  • Permission combinations (SMS + CONTACTS)    │    │
│  │  Score: 0.0 - 0.6                              │    │
│  └────────────────┬───────────────────────────────┘    │
│                   │                                     │
│  ┌────────────────▼───────────────────────────────┐    │
│  │ Layer 2: Certificate Validation                │    │
│  │  • Self-signed detection                       │    │
│  │  • Generic subject names                       │    │
│  │  Score: 0.0 - 0.5                              │    │
│  └────────────────┬───────────────────────────────┘    │
│                   │                                     │
│  ┌────────────────▼───────────────────────────────┐    │
│  │ Layer 3: API Analysis                          │    │
│  │  • Runtime.exec, DexClassLoader                │    │
│  │  • Device fingerprinting APIs                  │    │
│  │  Score: 0.0 - 0.6                              │    │
│  └────────────────┬───────────────────────────────┘    │
│                   │                                     │
│  ┌────────────────▼───────────────────────────────┐    │
│  │ Layer 4: Network Artifacts                     │    │
│  │  • Suspicious TLDs (.tk, .ml)                  │    │
│  │  • Multiple IP connections                     │    │
│  │  Score: 0.0 - 0.4                              │    │
│  └────────────────┬───────────────────────────────┘    │
│                   │                                     │
│  ┌────────────────▼───────────────────────────────┐    │
│  │ Layer 5: Threat Intelligence                   │    │
│  │  • Hash matching                               │    │
│  │  • Known malware signatures                    │    │
│  │  Score: 0.0 - 0.5                              │    │
│  └────────────────┬───────────────────────────────┘    │
│                   │                                     │
│  ┌────────────────▼───────────────────────────────┐    │
│  │ Score Aggregation                              │    │
│  │  Total = (Layer1 + Layer2 + Layer3 +           │    │
│  │           Layer4 + Layer5) / 5                 │    │
│  │  Normalized: 0.0 - 1.0                         │    │
│  │  Threshold: 0.7 for fraud classification       │    │
│  └────────────────┬───────────────────────────────┘    │
└───────────────────┼─────────────────────────────────────┘
                    │
                    ▼
         ┌─────────────────────┐
         │   Result            │
         │  • Fraud score      │
         │  • Is fraudulent    │
         │  • Indicators list  │
         └─────────────────────┘
```

## 4. ML Clustering Flow

```
┌─────────────────────┐
│  Multiple APKs      │
│  in Database        │
└──────────┬──────────┘
           │
           ▼
┌─────────────────────────────────────────────────────────┐
│              Feature Extractor                          │
│  ┌────────────────────────────────────────────────┐    │
│  │ Extract 32-dimensional feature vectors:        │    │
│  │  • Permission features (12 dims)               │    │
│  │  • Certificate features (5 dims)               │    │
│  │  • Network features (5 dims)                   │    │
│  │  • API features (3 dims)                       │    │
│  │  • Metadata features (5 dims)                  │    │
│  └────────────────┬───────────────────────────────┘    │
└───────────────────┼─────────────────────────────────────┘
                    │
                    ▼
         ┌─────────────────────┐
         │  Feature Matrix     │
         │  (N x 32)           │
         └──────────┬──────────┘
                    │
                    ▼
┌─────────────────────────────────────────────────────────┐
│              Clustering Algorithm                       │
│  ┌────────────────────────────────────────────────┐    │
│  │ DBSCAN (Density-Based)                         │    │
│  │  • eps = 0.5                                   │    │
│  │  • min_samples = 2                             │    │
│  │  • Finds arbitrary-shaped clusters             │    │
│  │  • Identifies noise points                     │    │
│  └────────────────┬───────────────────────────────┘    │
│                   │                                     │
│                   │ OR                                  │
│                   │                                     │
│  ┌────────────────▼───────────────────────────────┐    │
│  │ KMeans (Centroid-Based)                        │    │
│  │  • n_clusters = 5                              │    │
│  │  • Finds spherical clusters                    │    │
│  │  • All points assigned to clusters             │    │
│  └────────────────┬───────────────────────────────┘    │
└───────────────────┼─────────────────────────────────────┘
                    │
                    ▼
         ┌─────────────────────┐
         │  Cluster Labels     │
         │  [0, 1, 0, 2, 1...] │
         └──────────┬──────────┘
                    │
                    ▼
┌─────────────────────────────────────────────────────────┐
│              Cluster Analysis                           │
│  ┌────────────────────────────────────────────────┐    │
│  │ For each cluster:                              │    │
│  │  • Find common certificate                     │    │
│  │  • Find common domains                         │    │
│  │  • Find common permissions                     │    │
│  │  • Calculate average fraud score               │    │
│  │  • Identify cluster size                       │    │
│  └────────────────┬───────────────────────────────┘    │
└───────────────────┼─────────────────────────────────────┘
                    │
                    ▼
         ┌─────────────────────┐
         │  Cluster Results    │
         │  • Cluster ID       │
         │  • Size             │
         │  • APK IDs          │
         │  • Common features  │
         │  • Fraud score      │
         └─────────────────────┘
```

## 5. Root Source Identification Flow

```
┌─────────────────────┐
│   Neo4j Database    │
│   (All APKs)        │
└──────────┬──────────┘
           │
           ▼
┌─────────────────────────────────────────────────────────┐
│              Graph Query                                │
│  ┌────────────────────────────────────────────────┐    │
│  │ MATCH (c:Certificate)<-[:SIGNED_BY]-(a:APK)   │    │
│  │ WITH c, count(a) as apk_count,                │    │
│  │      collect(a.id) as apk_ids                 │    │
│  │ WHERE apk_count > 1                           │    │
│  │ RETURN c.fingerprint, c.subject,              │    │
│  │        apk_count, apk_ids                     │    │
│  │ ORDER BY apk_count DESC                       │    │
│  └────────────────┬───────────────────────────────┘    │
└───────────────────┼─────────────────────────────────────┘
                    │
                    ▼
         ┌─────────────────────────────────────┐
         │  Results                            │
         │                                     │
         │  Certificate A → 15 APKs            │
         │  Certificate B → 8 APKs             │
         │  Certificate C → 5 APKs             │
         │                                     │
         │  (Potential fraud campaigns)        │
         └─────────────────────────────────────┘
                    │
                    │ Cross-reference with fraud scores
                    ▼
┌─────────────────────────────────────────────────────────┐
│              Repeat Offender Detection                  │
│  ┌────────────────────────────────────────────────┐    │
│  │ MATCH (c:Certificate)<-[:SIGNED_BY]-(a:APK)   │    │
│  │ WHERE a.fraud_score > 0.7                     │    │
│  │ WITH c, count(a) as fraud_count,              │    │
│  │      collect(a.package_name) as packages      │    │
│  │ WHERE fraud_count > 1                         │    │
│  │ RETURN c.fingerprint, c.subject,              │    │
│  │        fraud_count, packages                  │    │
│  └────────────────┬───────────────────────────────┘    │
└───────────────────┼─────────────────────────────────────┘
                    │
                    ▼
         ┌─────────────────────────────────────┐
         │  Repeat Offenders                   │
         │                                     │
         │  Certificate X → 10 fraudulent APKs │
         │  Certificate Y → 6 fraudulent APKs  │
         │                                     │
         │  (Confirmed threat actors)          │
         └─────────────────────────────────────┘
```

## 6. Data Flow Summary

```
APK File
   │
   ├─→ Metadata Extraction
   │      ├─→ Certificate
   │      ├─→ Permissions
   │      ├─→ Components
   │      └─→ Network Artifacts
   │
   ├─→ Graph Storage (Neo4j)
   │      ├─→ APK Node
   │      ├─→ Certificate Node
   │      ├─→ Domain Nodes
   │      ├─→ IP Nodes
   │      └─→ Relationships
   │
   ├─→ Fraud Detection
   │      ├─→ Rule-based Analysis
   │      ├─→ ML Anomaly Detection
   │      └─→ Fraud Score
   │
   ├─→ Feature Extraction
   │      └─→ 32D Feature Vector
   │
   └─→ Clustering
          ├─→ Campaign Identification
          └─→ Common Features

Results
   │
   ├─→ Frontend Dashboard
   │      ├─→ Fraud Score Display
   │      ├─→ Indicator List
   │      ├─→ Network Graph
   │      └─→ Cluster View
   │
   └─→ Investigation Reports
          ├─→ APK Details
          ├─→ Related APKs
          ├─→ Root Sources
          └─→ Recommendations
```
