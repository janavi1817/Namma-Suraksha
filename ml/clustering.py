import numpy as np
from sklearn.cluster import DBSCAN, KMeans
from sklearn.preprocessing import StandardScaler
from typing import List, Dict, Any

class APKClusterer:
    """Cluster APKs based on similarity for fraud campaign identification"""
    
    def __init__(self, method='dbscan'):
        self.method = method
        self.scaler = StandardScaler()
        self.model = None
        
    def fit_predict(self, features: np.ndarray, **kwargs) -> np.ndarray:
        """Cluster APKs and return cluster labels"""
        # Normalize features
        features_scaled = self.scaler.fit_transform(features)
        
        if self.method == 'dbscan':
            eps = kwargs.get('eps', 0.5)
            min_samples = kwargs.get('min_samples', 2)
            self.model = DBSCAN(eps=eps, min_samples=min_samples, metric='euclidean')
        elif self.method == 'kmeans':
            n_clusters = kwargs.get('n_clusters', 5)
            self.model = KMeans(n_clusters=n_clusters, random_state=42)
        
        labels = self.model.fit_predict(features_scaled)
        return labels
    
    def analyze_clusters(self, labels: np.ndarray, apk_data: List[Dict[str, Any]]) -> List[Dict[str, Any]]:
        """Analyze clusters to identify common patterns"""
        unique_labels = set(labels)
        clusters = []
        
        for label in unique_labels:
            if label == -1:  # DBSCAN noise
                continue
            
            cluster_indices = np.where(labels == label)[0]
            cluster_apks = [apk_data[i] for i in cluster_indices]
            
            # Find common features
            common_features = self._find_common_features(cluster_apks)
            
            clusters.append({
                'cluster_id': int(label),
                'size': len(cluster_apks),
                'apk_ids': [apk['id'] for apk in cluster_apks],
                'common_features': common_features,
                'fraud_score': self._calculate_cluster_fraud_score(cluster_apks)
            })
        
        return sorted(clusters, key=lambda x: x['fraud_score'], reverse=True)
    
    def _find_common_features(self, apks: List[Dict[str, Any]]) -> Dict[str, Any]:
        """Identify common features across APKs in a cluster"""
        if not apks:
            return {}
        
        # Find common certificate
        certs = [apk.get('certificate', {}).get('fingerprint') for apk in apks]
        common_cert = max(set(certs), key=certs.count) if certs else None
        
        # Find common domains
        all_domains = []
        for apk in apks:
            all_domains.extend(apk.get('artifacts', {}).get('domains', []))
        common_domains = [d for d in set(all_domains) if all_domains.count(d) > len(apks) * 0.5]
        
        # Find common permissions
        all_perms = []
        for apk in apks:
            all_perms.extend(apk.get('permissions', []))
        common_perms = [p for p in set(all_perms) if all_perms.count(p) > len(apks) * 0.7]
        
        return {
            'certificate': common_cert,
            'domains': common_domains[:5],
            'permissions': common_perms[:10]
        }
    
    def _calculate_cluster_fraud_score(self, apks: List[Dict[str, Any]]) -> float:
        """Calculate average fraud score for cluster"""
        scores = [apk.get('fraud_score', 0.0) for apk in apks]
        return sum(scores) / len(scores) if scores else 0.0
