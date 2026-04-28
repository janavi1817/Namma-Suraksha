import unittest
import sys
import os

sys.path.insert(0, os.path.join(os.path.dirname(__file__), '..', 'backend'))

from fraud_detector import FraudDetector

class TestFraudDetector(unittest.TestCase):
    
    def setUp(self):
        self.detector = FraudDetector()
    
    def test_dangerous_permissions_detection(self):
        """Test detection of dangerous permissions"""
        permissions = [
            'android.permission.SEND_SMS',
            'android.permission.READ_CONTACTS',
            'android.permission.INTERNET'
        ]
        
        score, indicators = self.detector._check_permissions(permissions)
        
        self.assertGreater(score, 0)
        self.assertGreater(len(indicators), 0)
        self.assertTrue(any('SEND_SMS' in str(ind) for ind in indicators))
    
    def test_permission_combination_detection(self):
        """Test detection of suspicious permission combinations"""
        permissions = [
            'android.permission.SEND_SMS',
            'android.permission.READ_SMS',
            'android.permission.READ_CONTACTS'
        ]
        
        score, indicators = self.detector._check_permissions(permissions)
        
        # Should detect SMS + CONTACTS combination
        self.assertTrue(any('phishing' in ind['description'].lower() for ind in indicators))
    
    def test_self_signed_certificate_detection(self):
        """Test detection of self-signed certificates"""
        certificate = {
            'subject': 'CN=Test',
            'issuer': 'CN=Test',  # Same as subject = self-signed
            'fingerprint': 'abc123'
        }
        
        score, indicators = self.detector._check_certificate(certificate)
        
        self.assertGreater(score, 0)
        self.assertTrue(any('self-signed' in ind['type'] for ind in indicators))
    
    def test_generic_certificate_detection(self):
        """Test detection of generic certificate names"""
        certificate = {
            'subject': 'CN=Android Debug',
            'issuer': 'CN=Android Debug',
            'fingerprint': 'abc123'
        }
        
        score, indicators = self.detector._check_certificate(certificate)
        
        self.assertTrue(any('generic' in ind['type'] for ind in indicators))
    
    def test_suspicious_api_detection(self):
        """Test detection of suspicious API calls"""
        apis = [
            'Runtime.exec',
            'DexClassLoader',
            'getDeviceId'
        ]
        
        score, indicators = self.detector._check_suspicious_apis(apis)
        
        self.assertGreater(score, 0)
        self.assertGreater(len(indicators), 0)
    
    def test_suspicious_domain_detection(self):
        """Test detection of suspicious domains"""
        artifacts = {
            'domains': ['malicious.tk', 'phishing.ml', 'legitimate.com'],
            'ip_addresses': ['1.2.3.4'],
            'urls': []
        }
        
        score, indicators = self.detector._check_network_artifacts(artifacts)
        
        self.assertGreater(score, 0)
        self.assertTrue(any('suspicious_domain' in ind['type'] for ind in indicators))
    
    def test_multiple_ip_detection(self):
        """Test detection of multiple IP connections"""
        artifacts = {
            'domains': [],
            'ip_addresses': ['1.1.1.1', '2.2.2.2', '3.3.3.3', '4.4.4.4'],
            'urls': []
        }
        
        score, indicators = self.detector._check_network_artifacts(artifacts)
        
        self.assertTrue(any('multiple_ips' in ind['type'] for ind in indicators))
    
    def test_complete_fraud_detection(self):
        """Test complete fraud detection pipeline"""
        analysis = {
            'permissions': [
                'android.permission.SEND_SMS',
                'android.permission.READ_CONTACTS'
            ],
            'certificate': {
                'subject': 'CN=Android Debug',
                'issuer': 'CN=Android Debug',
                'fingerprint': 'abc123'
            },
            'suspicious_apis': ['Runtime.exec'],
            'artifacts': {
                'domains': ['malicious.tk'],
                'ip_addresses': ['1.2.3.4'],
                'urls': []
            },
            'file_hash': 'deadbeef123'
        }
        
        result = self.detector.detect(analysis)
        
        self.assertIn('score', result)
        self.assertIn('is_fraudulent', result)
        self.assertIn('indicators', result)
        self.assertIsInstance(result['score'], float)
        self.assertGreaterEqual(result['score'], 0.0)
        self.assertLessEqual(result['score'], 1.0)
    
    def test_clean_apk_detection(self):
        """Test detection of clean APK"""
        analysis = {
            'permissions': ['android.permission.INTERNET'],
            'certificate': {
                'subject': 'CN=Legitimate Company',
                'issuer': 'CN=Trusted CA',
                'fingerprint': 'abc123'
            },
            'suspicious_apis': [],
            'artifacts': {
                'domains': ['api.legitimate.com'],
                'ip_addresses': [],
                'urls': []
            },
            'file_hash': '123456'
        }
        
        result = self.detector.detect(analysis)
        
        self.assertLess(result['score'], 0.5)
        self.assertFalse(result['is_fraudulent'])

if __name__ == '__main__':
    unittest.main()
