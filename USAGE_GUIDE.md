# Usage Guide

## Getting Started

### 1. Upload and Analyze an APK

#### Via Web Interface

1. Navigate to http://localhost:3000
2. Click "Upload" in the navigation bar
3. Select an APK file from your computer
4. Click "Analyze APK"
5. View the fraud score and indicators
6. Click "View Details" or "View Network Graph" for more information

#### Via API

```bash
# Upload APK
curl -X POST http://localhost:8000/api/apk/upload \
  -F "file=@/path/to/app.apk"

# Response
{
  "id": "uuid-here",
  "analysis": {...},
  "fraud_score": 0.85,
  "is_fraudulent": true,
  "indicators": [...]
}
```

### 2. View APK Details

```bash
# Get detailed analysis
curl http://localhost:8000/api/apk/{apk_id}/analysis

# Response includes:
# - Package metadata
# - Certificate information
# - Network artifacts (domains, IPs)
# - Permissions
# - Suspicious APIs
```

### 3. Explore Relationship Graph

#### Via Web Interface

1. From APK details page, click "View Network Graph"
2. Interactive graph shows:
   - Blue nodes: APKs
   - Red nodes: Certificates
   - Green nodes: Domains
   - Orange nodes: IP addresses
3. Click nodes to see details
4. Zoom and pan to explore

#### Via API

```bash
# Get relationship graph
curl http://localhost:8000/api/graph/relationships/{apk_id}?depth=2

# Response
{
  "nodes": [
    {"id": "...", "label": "APK", "properties": {...}},
    {"id": "...", "label": "Certificate", "properties": {...}}
  ],
  "edges": [
    {"source": "...", "target": "...", "type": "SIGNED_BY"}
  ]
}
```

### 4. Identify Fraud Clusters

```bash
# Get fraud clusters
curl http://localhost:8000/api/clusters

# Response
[
  {
    "cluster_id": 0,
    "size": 5,
    "apk_ids": ["id1", "id2", ...],
    "common_features": {
      "certificate": "CN=...",
      "domains": ["malicious.tk"],
      "permissions": ["SEND_SMS"]
    },
    "fraud_score": 0.85
  }
]
```

### 5. Find Root Sources

```bash
# Get certificates used in multiple APKs
curl http://localhost:8000/api/root-sources

# Response
[
  {
    "cert_fingerprint": "abc123...",
    "subject": "CN=Attacker",
    "apk_count": 10,
    "apk_ids": [...]
  }
]
```

### 6. Identify Repeat Offenders

```bash
# Get certificates used in multiple fraudulent APKs
curl http://localhost:8000/api/repeat-offenders

# Response
[
  {
    "cert_fingerprint": "def456...",
    "subject": "CN=Fraudster",
    "fraud_count": 8,
    "packages": ["com.fake.app1", "com.fake.app2"]
  }
]
```

## Use Cases

### Use Case 1: Investigating a Suspicious APK

**Scenario**: Law enforcement receives a report about a fraudulent banking app.

**Steps**:

1. Upload the APK to the platform
2. Review the fraud score and indicators
3. Check for dangerous permissions (SMS, contacts, phone)
4. Examine network artifacts for suspicious domains
5. View the relationship graph to find related APKs
6. Identify the certificate used for signing
7. Search for other APKs signed with the same certificate
8. Generate a report with all findings

**Expected Output**:
- Fraud score > 0.7
- Indicators: SMS permissions, suspicious domains, self-signed cert
- Related APKs: 5-10 variants of the same malware
- Root source: Single certificate used across all variants

### Use Case 2: Tracking a Fraud Campaign

**Scenario**: Multiple users report similar phishing apps.

**Steps**:

1. Upload all reported APKs
2. Navigate to "Fraud Clusters" page
3. Identify clusters with high fraud scores
4. Examine common features across cluster members
5. Check "Root Sources" for the campaign origin
6. View network graph to map infrastructure
7. Export findings for takedown requests

**Expected Output**:
- Cluster of 15 related APKs
- Common certificate: CN=Android Debug
- Common domains: phishing.tk, fake-bank.ml
- Common permissions: SMS, contacts, phone
- Infrastructure map showing C2 servers

### Use Case 3: Proactive Threat Hunting

**Scenario**: Security team wants to identify new threats.

**Steps**:

1. Batch upload APKs from app stores
2. Run fraud detection on all uploads
3. Sort by fraud score
4. Investigate high-scoring APKs
5. Look for new patterns in clusters
6. Update detection rules based on findings

**Expected Output**:
- 100 APKs analyzed
- 15 flagged as fraudulent
- 3 new fraud clusters identified
- 2 new malware families discovered

## Advanced Features

### Custom Fraud Detection Rules

Edit `backend/fraud_detector.py` to add custom rules:

```python
def _check_custom_rule(self, analysis):
    """Custom fraud detection rule"""
    indicators = []
    score = 0.0
    
    # Example: Detect specific package name pattern
    package = analysis.get('metadata', {}).get('package_name', '')
    if 'fake' in package.lower() or 'phishing' in package.lower():
        score += 0.5
        indicators.append({
            'type': 'suspicious_package_name',
            'severity': 'high',
            'description': f'Suspicious package name: {package}',
            'evidence': package
        })
    
    return score, indicators
```

### Batch APK Analysis

```python
import requests
import os

API_URL = "http://localhost:8000"

def batch_analyze(apk_directory):
    """Analyze all APKs in a directory"""
    results = []
    
    for filename in os.listdir(apk_directory):
        if filename.endswith('.apk'):
            filepath = os.path.join(apk_directory, filename)
            
            with open(filepath, 'rb') as f:
                files = {'file': (filename, f, 'application/vnd.android.package-archive')}
                response = requests.post(f"{API_URL}/api/apk/upload", files=files)
                
                if response.status_code == 200:
                    result = response.json()
                    results.append({
                        'filename': filename,
                        'fraud_score': result['fraud_score'],
                        'is_fraudulent': result['is_fraudulent']
                    })
                    print(f"✓ {filename}: {result['fraud_score']:.2f}")
                else:
                    print(f"✗ {filename}: Error")
    
    return results

# Usage
results = batch_analyze('/path/to/apks')
```

### Export Graph Data

```python
import requests
import json

def export_graph(apk_id, output_file):
    """Export graph data to JSON"""
    response = requests.get(f"http://localhost:8000/api/graph/relationships/{apk_id}")
    
    if response.status_code == 200:
        with open(output_file, 'w') as f:
            json.dump(response.json(), f, indent=2)
        print(f"Graph exported to {output_file}")
    else:
        print("Error exporting graph")

# Usage
export_graph('apk-uuid-here', 'graph_data.json')
```

### Generate Investigation Report

```python
import requests
from datetime import datetime

def generate_report(apk_id):
    """Generate investigation report"""
    # Get APK details
    analysis = requests.get(f"http://localhost:8000/api/apk/{apk_id}/analysis").json()
    
    # Get relationships
    graph = requests.get(f"http://localhost:8000/api/graph/relationships/{apk_id}").json()
    
    report = f"""
APK FRAUD INVESTIGATION REPORT
Generated: {datetime.now().isoformat()}

=== BASIC INFORMATION ===
Package: {analysis['apk']['package_name']}
Version: {analysis['apk']['version_name']}
Hash: {analysis['apk']['file_hash']}

=== CERTIFICATE ===
Subject: {analysis['certificate']['subject']}
Issuer: {analysis['certificate']['issuer']}
Fingerprint: {analysis['certificate']['fingerprint']}

=== NETWORK ARTIFACTS ===
Domains: {', '.join(analysis['domains'])}
IPs: {', '.join(analysis['ips'])}

=== RELATIONSHIPS ===
Connected Nodes: {len(graph['nodes'])}
Relationships: {len(graph['edges'])}

=== RECOMMENDATION ===
This APK should be flagged for further investigation.
"""
    
    return report

# Usage
report = generate_report('apk-uuid-here')
print(report)
```

## Tips and Best Practices

1. **Regular Updates**: Keep the platform updated with latest threat intelligence
2. **Batch Processing**: Analyze multiple APKs together for better clustering
3. **Graph Exploration**: Use depth=3 or higher for comprehensive relationship mapping
4. **Custom Rules**: Add organization-specific detection rules
5. **Backup Data**: Regularly backup Neo4j database
6. **Monitor Performance**: Track analysis times and optimize as needed
7. **Validate Results**: Manually verify high-scoring detections
8. **Share Intelligence**: Export findings for collaboration

## Troubleshooting

### APK Analysis Fails

- Check APK file is valid and not corrupted
- Ensure file size is under limit (100MB default)
- Verify Androguard can parse the APK

### Graph Visualization Issues

- Reduce depth parameter for large graphs
- Check Neo4j connection is active
- Clear browser cache

### Low Fraud Scores

- Review detection rules
- Add custom rules for specific threats
- Update threat intelligence data

### Performance Issues

- Increase worker count
- Add caching layer
- Optimize Neo4j queries
- Use batch processing
