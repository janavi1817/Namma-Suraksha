import unittest
from unittest.mock import Mock, patch, MagicMock
import sys
import os

sys.path.insert(0, os.path.join(os.path.dirname(__file__), '..', 'backend'))

from apk_analyzer import APKAnalyzer

class TestAPKAnalyzer(unittest.TestCase):
    
    def setUp(self):
        self.analyzer = APKAnalyzer()
    
    def test_url_pattern_extraction(self):
        """Test URL pattern matching"""
        test_string = "Visit https://example.com and http://test.org"
        urls = self.analyzer.url_pattern.findall(test_string)
        self.assertEqual(len(urls), 2)
        self.assertIn('https://example.com', urls)
    
    def test_ip_pattern_extraction(self):
        """Test IP address pattern matching"""
        test_string = "Connect to 192.168.1.1 and 10.0.0.1"
        ips = self.analyzer.ip_pattern.findall(test_string)
        self.assertEqual(len(ips), 2)
        self.assertIn('192.168.1.1', ips)
    
    def test_email_pattern_extraction(self):
        """Test email pattern matching"""
        test_string = "Contact test@example.com or admin@test.org"
        emails = self.analyzer.email_pattern.findall(test_string)
        self.assertEqual(len(emails), 2)
    
    def test_domain_extraction(self):
        """Test domain extraction from URL"""
        url = "https://example.com/path/to/resource"
        domain = self.analyzer._extract_domain(url)
        self.assertEqual(domain, 'example.com')
    
    def test_domain_extraction_with_port(self):
        """Test domain extraction with port"""
        url = "https://example.com:8080/path"
        domain = self.analyzer._extract_domain(url)
        self.assertEqual(domain, 'example.com:8080')
    
    def test_calculate_hash(self):
        """Test file hash calculation"""
        # Create temporary test file
        test_file = 'test_temp.txt'
        with open(test_file, 'w') as f:
            f.write('test content')
        
        hash_value = self.analyzer._calculate_hash(test_file)
        self.assertEqual(len(hash_value), 64)  # SHA256 produces 64 hex chars
        
        # Cleanup
        os.remove(test_file)
    
    @patch('apk_analyzer.APK')
    def test_extract_metadata(self, mock_apk_class):
        """Test metadata extraction"""
        mock_apk = Mock()
        mock_apk.get_package.return_value = 'com.example.app'
        mock_apk.get_androidversion_name.return_value = '1.0.0'
        mock_apk.get_androidversion_code.return_value = 1
        mock_apk.get_min_sdk_version.return_value = 21
        mock_apk.get_target_sdk_version.return_value = 30
        mock_apk.get_activities.return_value = ['MainActivity']
        mock_apk.get_services.return_value = []
        mock_apk.get_receivers.return_value = []
        mock_apk.get_providers.return_value = []
        
        metadata = self.analyzer._extract_metadata(mock_apk)
        
        self.assertEqual(metadata['package_name'], 'com.example.app')
        self.assertEqual(metadata['version_name'], '1.0.0')
        self.assertEqual(metadata['min_sdk'], 21)
        self.assertEqual(len(metadata['activities']), 1)

if __name__ == '__main__':
    unittest.main()
