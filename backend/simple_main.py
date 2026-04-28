from fastapi import FastAPI, UploadFile, File, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from typing import Dict, Any, List
import uuid
import hashlib
import random
from datetime import datetime
from pathlib import Path

app = FastAPI(title="APK Fraud Intelligence Platform - Demo")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

UPLOAD_DIR = Path("uploads")
UPLOAD_DIR.mkdir(exist_ok=True)

# Mock database
mock_apks = {}
mock_stats = {
    "total_apks": 0,
    "total_certs": 0,
    "total_domains": 0,
    "total_ips": 0
}

def generate_mock_analysis(filename: str, file_hash: str) -> Dict[str, Any]:
    """Generate mock APK analysis"""
    
    # Simulate fraud detection
    fraud_score = random.uniform(0.3, 0.95)
    is_fraudulent = fraud_score > 0.7
    
    indicators = []
    
    if fraud_score > 0.7:
        indicators.append({
            'type': 'dangerous_permission',
            'severity': 'high',
            'description': 'Dangerous permission: SEND_SMS',
            'evidence': 'android.permission.SEND_SMS'
        })
        indicators.append({
            'type': 'suspicious_domain',
            'severity': 'medium',
            'description': 'Suspicious TLD: malicious.tk',
            'evidence': 'malicious.tk'
        })
    
    if fraud_score > 0.8:
        indicators.append({
            'type': 'self_signed_cert',
            'severity': 'high',
            'description': 'Self-signed certificate detected',
            'evidence': 'CN=Android Debug'
        })
        indicators.append({
            'type': 'suspicious_api',
            'severity': 'critical',
            'description': 'High-risk API usage: Runtime.exec',
            'evidence': 'Runtime.exec'
        })
    
    analysis = {
        'id': str(uuid.uuid4()),
        'filename': filename,
        'file_hash': file_hash,
        'size': random.randint(1000000, 50000000),
        'metadata': {
            'package_name': f'com.example.{filename.split(".")[0].lower()}',
            'version_name': f'{random.randint(1,5)}.{random.randint(0,9)}.{random.randint(0,9)}',
            'version_code': random.randint(1, 100),
            'min_sdk': random.choice([21, 23, 26, 28, 30]),
            'target_sdk': random.choice([30, 31, 32, 33]),
            'activities': ['MainActivity', 'LoginActivity', 'SettingsActivity'],
            'services': ['BackgroundService'],
            'receivers': ['BootReceiver'],
            'providers': []
        },
        'certificate': {
            'subject': 'CN=Android Debug, O=Android, C=US' if is_fraudulent else 'CN=Legitimate Corp, O=Company Inc, C=US',
            'issuer': 'CN=Android Debug, O=Android, C=US' if is_fraudulent else 'CN=DigiCert, O=DigiCert Inc, C=US',
            'serial_number': str(random.randint(100000, 999999)),
            'fingerprint': hashlib.sha256(file_hash.encode()).hexdigest(),
            'valid_from': '2023-01-01T00:00:00',
            'valid_to': '2025-12-31T23:59:59'
        },
        'artifacts': {
            'urls': ['http://api.example.com/v1', 'https://analytics.example.com'] if not is_fraudulent else ['http://malicious.tk/api', 'http://phishing-site.ml/data'],
            'ip_addresses': ['192.168.1.1', '10.0.0.1'] if not is_fraudulent else ['185.199.108.153', '45.33.32.156'],
            'domains': ['example.com', 'api.example.com'] if not is_fraudulent else ['malicious.tk', 'phishing-site.ml'],
            'emails': ['support@example.com'],
            'phone_numbers': []
        },
        'permissions': [
            'android.permission.INTERNET',
            'android.permission.ACCESS_NETWORK_STATE',
        ] + (['android.permission.SEND_SMS', 'android.permission.READ_CONTACTS'] if is_fraudulent else []),
        'suspicious_apis': ['Runtime.exec', 'DexClassLoader'] if is_fraudulent else [],
        'analyzed_at': datetime.now().isoformat()
    }
    
    return {
        'analysis': analysis,
        'fraud_score': fraud_score,
        'is_fraudulent': is_fraudulent,
        'indicators': indicators
    }

@app.post("/api/apk/upload")
async def upload_apk(file: UploadFile = File(...)) -> Dict[str, Any]:
    """Upload and analyze APK file"""
    
    # Read file content
    content = await file.read()
    file_hash = hashlib.sha256(content).hexdigest()
    
    # Save file
    apk_id = str(uuid.uuid4())
    file_path = UPLOAD_DIR / f"{apk_id}_{file.filename}"
    with open(file_path, "wb") as f:
        f.write(content)
    
    # Generate mock analysis
    result = generate_mock_analysis(file.filename, file_hash)
    result['id'] = apk_id
    
    # Store in mock database
    mock_apks[apk_id] = result
    mock_stats['total_apks'] += 1
    mock_stats['total_certs'] += 1
    mock_stats['total_domains'] += len(result['analysis']['artifacts']['domains'])
    mock_stats['total_ips'] += len(result['analysis']['artifacts']['ip_addresses'])
    
    return result

@app.get("/api/apk/{apk_id}/analysis")
async def get_analysis(apk_id: str) -> Dict[str, Any]:
    """Get detailed analysis for an APK"""
    if apk_id not in mock_apks:
        raise HTTPException(404, "APK not found")
    
    result = mock_apks[apk_id]
    return {
        'apk': result['analysis']['metadata'],
        'certificate': result['analysis']['certificate'],
        'domains': result['analysis']['artifacts']['domains'],
        'ips': result['analysis']['artifacts']['ip_addresses']
    }

@app.get("/api/graph/relationships/{apk_id}")
async def get_relationships(apk_id: str, depth: int = 2) -> Dict[str, Any]:
    """Get relationship graph for an APK"""
    if apk_id not in mock_apks:
        raise HTTPException(404, "APK not found")
    
    result = mock_apks[apk_id]
    
    # Generate mock graph
    nodes = [
        {'id': apk_id, 'label': 'APK', 'properties': {'name': result['analysis']['filename']}},
        {'id': 'cert1', 'label': 'Certificate', 'properties': {'subject': result['analysis']['certificate']['subject']}},
    ]
    
    edges = [
        {'source': apk_id, 'target': 'cert1', 'type': 'SIGNED_BY'}
    ]
    
    # Add domains
    for i, domain in enumerate(result['analysis']['artifacts']['domains']):
        node_id = f'domain{i}'
        nodes.append({'id': node_id, 'label': 'Domain', 'properties': {'name': domain}})
        edges.append({'source': apk_id, 'target': node_id, 'type': 'CONNECTS_TO'})
    
    # Add IPs
    for i, ip in enumerate(result['analysis']['artifacts']['ip_addresses']):
        node_id = f'ip{i}'
        nodes.append({'id': node_id, 'label': 'IP', 'properties': {'address': ip}})
        edges.append({'source': apk_id, 'target': node_id, 'type': 'CONNECTS_TO'})
    
    return {'nodes': nodes, 'edges': edges}

@app.get("/api/fraud/detect")
async def detect_fraud(threshold: float = 0.7) -> List[Dict[str, Any]]:
    """Run fraud detection on all APKs"""
    results = []
    for apk_id, data in mock_apks.items():
        if data['is_fraudulent']:
            results.append({
                'apk_id': apk_id,
                'score': data['fraud_score'],
                'is_fraudulent': data['is_fraudulent'],
                'indicators': data['indicators']
            })
    return results

@app.get("/api/clusters")
async def get_clusters() -> List[Dict[str, Any]]:
    """Get fraud clusters"""
    return [
        {
            'cluster_id': 0,
            'size': 5,
            'apk_ids': list(mock_apks.keys())[:5] if len(mock_apks) >= 5 else list(mock_apks.keys()),
            'common_features': {
                'certificate': 'CN=Android Debug',
                'domains': ['malicious.tk'],
                'permissions': ['SEND_SMS', 'READ_CONTACTS']
            },
            'fraud_score': 0.85
        }
    ]

@app.get("/api/stats")
async def get_stats() -> Dict[str, Any]:
    """Get platform statistics"""
    return mock_stats

@app.get("/api/root-sources")
async def get_root_sources() -> List[Dict[str, Any]]:
    """Identify root sources"""
    if not mock_apks:
        return []
    
    return [
        {
            'cert_fingerprint': 'abc123...',
            'subject': 'CN=Android Debug',
            'apk_count': len(mock_apks),
            'apk_ids': list(mock_apks.keys())
        }
    ]

@app.get("/api/repeat-offenders")
async def get_repeat_offenders() -> List[Dict[str, Any]]:
    """Identify repeat offenders"""
    fraudulent = [data for data in mock_apks.values() if data['is_fraudulent']]
    
    if not fraudulent:
        return []
    
    return [
        {
            'cert_fingerprint': 'def456...',
            'subject': 'CN=Android Debug',
            'fraud_count': len(fraudulent),
            'packages': [data['analysis']['metadata']['package_name'] for data in fraudulent[:3]]
        }
    ]

@app.get("/")
async def root():
    """Root endpoint"""
    return {
        "message": "APK Fraud Intelligence Platform API",
        "version": "1.0.0",
        "docs": "/docs",
        "status": "running"
    }

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
