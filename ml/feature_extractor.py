import numpy as np
from typing import Dict, List, Any

class FeatureExtractor:
    """Extract numerical features from APK analysis for ML models"""
    
    def extract_features(self, analysis: Dict[str, Any]) -> np.ndarray:
        """Extract feature vector from APK analysis"""
        features = []
        
        # Permission-based features
        features.extend(self._permission_features(analysis.get('permissions', [])))
        
        # Certificate features
        features.extend(self._certificate_features(analysis.get('certificate', {})))
        
        # Network artifact features
        features.extend(self._network_features(analysis.get('artifacts', {})))
        
        # API usage features
        features.extend(self._api_features(analysis.get('suspicious_apis', [])))
        
        # Metadata features
        features.extend(self._metadata_features(analysis.get('metadata', {})))
        
        return np.array(features)
    
    def _permission_features(self, permissions: List[str]) -> List[float]:
        """Extract permission-based features"""
        dangerous_perms = [
            'SEND_SMS', 'READ_SMS', 'RECEIVE_SMS',
            'READ_CONTACTS', 'WRITE_CONTACTS',
            'ACCESS_FINE_LOCATION', 'ACCESS_COARSE_LOCATION',
            'CALL_PHONE', 'READ_PHONE_STATE',
            'CAMERA', 'RECORD_AUDIO',
            'READ_EXTERNAL_STORAGE', 'WRITE_EXTERNAL_STORAGE',
            'SYSTEM_ALERT_WINDOW', 'REQUEST_INSTALL_PACKAGES'
        ]
        
        features = [
            len(permissions),  # Total permissions
            sum(1 for p in permissions if any(d in p for d in dangerous_perms)),  # Dangerous count
        ]
        
        # Binary features for specific dangerous permissions
        for perm in dangerous_perms[:10]:  # Top 10 most dangerous
            features.append(1.0 if any(perm in p for p in permissions) else 0.0)
        
        return features
    
    def _certificate_features(self, certificate: Dict[str, Any]) -> List[float]:
        """Extract certificate-based features"""
        if not certificate:
            return [0.0] * 5
        
        subject = certificate.get('subject', '')
        issuer = certificate.get('issuer', '')
        
        return [
            1.0 if subject == issuer else 0.0,  # Self-signed
            1.0 if any(x in subject.lower() for x in ['android', 'test', 'debug']) else 0.0,  # Generic
            len(subject),  # Subject length
            len(issuer),  # Issuer length
            1.0 if 'CN=' in subject else 0.0  # Has common name
        ]
    
    def _network_features(self, artifacts: Dict[str, List[str]]) -> List[float]:
        """Extract network artifact features"""
        domains = artifacts.get('domains', [])
        ips = artifacts.get('ip_addresses', [])
        urls = artifacts.get('urls', [])
        
        suspicious_tlds = ['.tk', '.ml', '.ga', '.cf', '.gq', '.xyz']
        
        return [
            len(domains),  # Domain count
            len(ips),  # IP count
            len(urls),  # URL count
            sum(1 for d in domains if any(d.endswith(tld) for tld in suspicious_tlds)),  # Suspicious TLDs
            1.0 if len(ips) > 3 else 0.0  # Multiple IPs
        ]
    
    def _api_features(self, apis: List[str]) -> List[float]:
        """Extract API usage features"""
        high_risk = ['Runtime.exec', 'ProcessBuilder', 'DexClassLoader']
        medium_risk = ['getDeviceId', 'getSubscriberId', 'sendTextMessage']
        
        return [
            len(apis),  # Total suspicious APIs
            sum(1 for api in apis if any(h in api for h in high_risk)),  # High risk count
            sum(1 for api in apis if any(m in api for m in medium_risk))  # Medium risk count
        ]
    
    def _metadata_features(self, metadata: Dict[str, Any]) -> List[float]:
        """Extract metadata features"""
        return [
            metadata.get('min_sdk', 0),  # Min SDK
            metadata.get('target_sdk', 0),  # Target SDK
            len(metadata.get('activities', [])),  # Activity count
            len(metadata.get('services', [])),  # Service count
            len(metadata.get('receivers', []))  # Receiver count
        ]
    
    def get_feature_names(self) -> List[str]:
        """Get feature names for interpretability"""
        names = ['perm_count', 'dangerous_perm_count']
        names.extend([f'has_perm_{i}' for i in range(10)])
        names.extend(['self_signed', 'generic_cert', 'subject_len', 'issuer_len', 'has_cn'])
        names.extend(['domain_count', 'ip_count', 'url_count', 'suspicious_tld_count', 'multiple_ips'])
        names.extend(['api_count', 'high_risk_api_count', 'medium_risk_api_count'])
        names.extend(['min_sdk', 'target_sdk', 'activity_count', 'service_count', 'receiver_count'])
        return names
