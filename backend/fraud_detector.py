from typing import Dict, List, Any
import numpy as np
from sklearn.ensemble import IsolationForest, RandomForestClassifier
from sklearn.cluster import DBSCAN
from sklearn.preprocessing import StandardScaler
import requests

class FraudDetector:
    """ML-based fraud detection and clustering"""
    
    def __init__(self):
        self.anomaly_detector = IsolationForest(contamination=0.1, random_state=42)
        self.scaler = StandardScaler()
        self.threat_intel_cache = {}
        
    def detect(self, analysis: Dict[str, Any]) -> Dict[str, Any]:
        """Detect fraud indicators in a single APK"""
        indicators = []
        score = 0.0
        
        # Check permissions
        perm_score, perm_indicators = self._check_permissions(analysis.get('permissions', []))
        score += perm_score
        indicators.extend(perm_indicators)
        
        # Check certificate
        cert_score, cert_indicators = self._check_certificate(analysis.get('certificate', {}))
        score += cert_score
        indicators.extend(cert_indicators)
        
        # Check suspicious APIs
        api_score, api_indicators = self._check_suspicious_apis(analysis.get('suspicious_apis', []))
        score += api_score
        indicators.extend(api_indicators)
        
        # Check network artifacts
        net_score, net_indicators = self._check_network_artifacts(analysis.get('artifacts', {}))
        score += net_score
        indicators.extend(net_indicators)
        
        # Check threat intelligence
        ti_score, ti_indicators = self._check_threat_intel(analysis)
        score += ti_score
        indicators.extend(ti_indicators)
        
        # Normalize score
        score = min(score / 5.0, 1.0)
        
        return {
            'score': score,
            'is_fraudulent': score > 0.7,
            'indicators': indicators
        }
    
    def _check_permissions(self, permissions: List[str]) -> tuple:
        """Check for dangerous permission combinations"""
        indicators = []
        score = 0.0
        
        dangerous_perms = {
            'android.permission.SEND_SMS': 0.3,
            'android.permission.READ_SMS': 0.3,
            'android.permission.RECEIVE_SMS': 0.2,
            'android.permission.READ_CONTACTS': 0.2,
            'android.permission.ACCESS_FINE_LOCATION': 0.1,
            'android.permission.CALL_PHONE': 0.3,
            'android.permission.READ_PHONE_STATE': 0.2,
            'android.permission.SYSTEM_ALERT_WINDOW': 0.2,
            'android.permission.REQUEST_INSTALL_PACKAGES': 0.4
        }
        
        for perm in permissions:
            if perm in dangerous_perms:
                weight = dangerous_perms[perm]
                score += weight
                indicators.append({
                    'type': 'dangerous_permission',
                    'severity': 'high' if weight > 0.2 else 'medium',
                    'description': f'Dangerous permission: {perm}',
                    'evidence': perm
                })
        
        # Check for SMS + contacts combination (phishing indicator)
        if any('SMS' in p for p in permissions) and any('CONTACTS' in p for p in permissions):
            score += 0.3
            indicators.append({
                'type': 'permission_combination',
                'severity': 'high',
                'description': 'SMS and contacts access (phishing indicator)',
                'evidence': 'SMS + CONTACTS permissions'
            })
        
        return score, indicators
    
    def _check_certificate(self, certificate: Dict[str, Any]) -> tuple:
        """Check certificate validity and characteristics"""
        indicators = []
        score = 0.0
        
        if not certificate:
            return 0.0, []
        
        # Self-signed certificate
        if certificate.get('subject') == certificate.get('issuer'):
            score += 0.2
            indicators.append({
                'type': 'self_signed_cert',
                'severity': 'medium',
                'description': 'Self-signed certificate',
                'evidence': certificate.get('subject')
            })
        
        # Generic subject names
        generic_names = ['Android', 'Test', 'Debug', 'Unknown', 'User']
        subject = certificate.get('subject', '')
        if any(name.lower() in subject.lower() for name in generic_names):
            score += 0.3
            indicators.append({
                'type': 'generic_cert',
                'severity': 'high',
                'description': 'Generic certificate subject',
                'evidence': subject
            })
        
        return score, indicators
    
    def _check_suspicious_apis(self, apis: List[str]) -> tuple:
        """Check for suspicious API usage"""
        indicators = []
        score = 0.0
        
        high_risk_apis = ['Runtime.exec', 'ProcessBuilder', 'DexClassLoader']
        medium_risk_apis = ['getDeviceId', 'getSubscriberId', 'sendTextMessage']
        
        for api in apis:
            if any(risk in api for risk in high_risk_apis):
                score += 0.3
                indicators.append({
                    'type': 'suspicious_api',
                    'severity': 'high',
                    'description': f'High-risk API usage: {api}',
                    'evidence': api
                })
            elif any(risk in api for risk in medium_risk_apis):
                score += 0.1
                indicators.append({
                    'type': 'suspicious_api',
                    'severity': 'medium',
                    'description': f'Suspicious API usage: {api}',
                    'evidence': api
                })
        
        return score, indicators
    
    def _check_network_artifacts(self, artifacts: Dict[str, List[str]]) -> tuple:
        """Check network artifacts for suspicious patterns"""
        indicators = []
        score = 0.0
        
        # Check for suspicious domains
        suspicious_tlds = ['.tk', '.ml', '.ga', '.cf', '.gq', '.xyz']
        for domain in artifacts.get('domains', []):
            if any(domain.endswith(tld) for tld in suspicious_tlds):
                score += 0.2
                indicators.append({
                    'type': 'suspicious_domain',
                    'severity': 'medium',
                    'description': f'Suspicious TLD: {domain}',
                    'evidence': domain
                })
        
        # Check for IP addresses (direct IP connections)
        if len(artifacts.get('ip_addresses', [])) > 3:
            score += 0.2
            indicators.append({
                'type': 'multiple_ips',
                'severity': 'medium',
                'description': 'Multiple direct IP connections',
                'evidence': artifacts.get('ip_addresses', [])
            })
        
        return score, indicators
    
    def _check_threat_intel(self, analysis: Dict[str, Any]) -> tuple:
        """Check against threat intelligence (mock implementation)"""
        indicators = []
        score = 0.0
        
        file_hash = analysis.get('file_hash')
        
        # Mock threat intel check (in production, use VirusTotal API)
        # For demo, check hash against known patterns
        if file_hash and file_hash[:2] in ['00', 'ff', 'de', 'ad']:
            score += 0.5
            indicators.append({
                'type': 'threat_intel',
                'severity': 'critical',
                'description': 'Hash matches known malware signature',
                'evidence': file_hash
            })
        
        return score, indicators
    
    def batch_detect(self, threshold: float = 0.7) -> List[Dict[str, Any]]:
        """Run fraud detection on multiple APKs"""
        # This would query all APKs from the database
        # For now, return empty list
        return []
    
    def get_clusters(self) -> List[Dict[str, Any]]:
        """Cluster related APKs using DBSCAN"""
        # Extract features from all APKs
        # For demo, return mock clusters
        return [
            {
                'cluster_id': 0,
                'size': 5,
                'apk_ids': ['apk1', 'apk2', 'apk3', 'apk4', 'apk5'],
                'common_features': {
                    'certificate': 'CN=Android Debug',
                    'domains': ['malicious-domain.tk'],
                    'permissions': ['SEND_SMS', 'READ_CONTACTS']
                },
                'fraud_score': 0.85
            }
        ]
    
    def cluster_apks(self, features: np.ndarray) -> np.ndarray:
        """Cluster APKs based on features"""
        clustering = DBSCAN(eps=0.3, min_samples=2)
        return clustering.fit_predict(features)
