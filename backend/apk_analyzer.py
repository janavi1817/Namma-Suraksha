import hashlib
import re
from typing import Dict, List, Any
from pathlib import Path
from androguard.core.bytecodes.apk import APK
from androguard.core.bytecodes.dvm import DalvikVMFormat
from cryptography import x509
from cryptography.hazmat.backends import default_backend
import zipfile

class APKAnalyzer:
    """Extract comprehensive metadata from APK files"""
    
    def __init__(self):
        self.url_pattern = re.compile(r'https?://[^\s<>"{}|\\^`\[\]]+')
        self.ip_pattern = re.compile(r'\b(?:\d{1,3}\.){3}\d{1,3}\b')
        self.email_pattern = re.compile(r'\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,}\b')
        self.phone_pattern = re.compile(r'\+?\d{10,15}')
    
    def analyze(self, apk_path: str) -> Dict[str, Any]:
        """Perform complete APK analysis"""
        apk = APK(apk_path)
        
        return {
            'file_hash': self._calculate_hash(apk_path),
            'size': Path(apk_path).stat().st_size,
            'metadata': self._extract_metadata(apk),
            'certificate': self._extract_certificate(apk),
            'artifacts': self._extract_artifacts(apk, apk_path),
            'permissions': apk.get_permissions(),
            'suspicious_apis': self._detect_suspicious_apis(apk)
        }
    
    def _calculate_hash(self, file_path: str) -> str:
        """Calculate SHA256 hash"""
        sha256 = hashlib.sha256()
        with open(file_path, 'rb') as f:
            for chunk in iter(lambda: f.read(4096), b''):
                sha256.update(chunk)
        return sha256.hexdigest()
    
    def _extract_metadata(self, apk: APK) -> Dict[str, Any]:
        """Extract APK metadata"""
        return {
            'package_name': apk.get_package(),
            'version_name': apk.get_androidversion_name(),
            'version_code': apk.get_androidversion_code(),
            'min_sdk': apk.get_min_sdk_version(),
            'target_sdk': apk.get_target_sdk_version(),
            'activities': apk.get_activities(),
            'services': apk.get_services(),
            'receivers': apk.get_receivers(),
            'providers': apk.get_providers()
        }
    
    def _extract_certificate(self, apk: APK) -> Dict[str, Any]:
        """Extract certificate information"""
        cert_data = apk.get_certificate_der(apk.get_signature_names()[0])
        cert = x509.load_der_x509_certificate(cert_data, default_backend())
        
        return {
            'subject': cert.subject.rfc4514_string(),
            'issuer': cert.issuer.rfc4514_string(),
            'serial_number': str(cert.serial_number),
            'fingerprint': cert.fingerprint(hashlib.sha256()).hex(),
            'valid_from': cert.not_valid_before.isoformat(),
            'valid_to': cert.not_valid_after.isoformat()
        }
    
    def _extract_artifacts(self, apk: APK, apk_path: str) -> Dict[str, List[str]]:
        """Extract URLs, IPs, domains, emails from APK"""
        artifacts = {
            'urls': set(),
            'ip_addresses': set(),
            'domains': set(),
            'emails': set(),
            'phone_numbers': set()
        }
        
        # Extract from strings in DEX files
        for dex in apk.get_all_dex():
            strings = self._extract_strings_from_dex(dex)
            for s in strings:
                artifacts['urls'].update(self.url_pattern.findall(s))
                artifacts['ip_addresses'].update(self.ip_pattern.findall(s))
                artifacts['emails'].update(self.email_pattern.findall(s))
                artifacts['phone_numbers'].update(self.phone_pattern.findall(s))
        
        # Extract domains from URLs
        for url in artifacts['urls']:
            domain = self._extract_domain(url)
            if domain:
                artifacts['domains'].add(domain)
        
        return {k: list(v) for k, v in artifacts.items()}
    
    def _extract_strings_from_dex(self, dex: bytes) -> List[str]:
        """Extract strings from DEX bytecode"""
        try:
            d = DalvikVMFormat(dex)
            return [s for s in d.get_strings() if len(s) > 5]
        except:
            return []
    
    def _extract_domain(self, url: str) -> str:
        """Extract domain from URL"""
        match = re.search(r'https?://([^/]+)', url)
        return match.group(1) if match else None
    
    def _detect_suspicious_apis(self, apk: APK) -> List[str]:
        """Detect suspicious API calls"""
        suspicious = []
        dangerous_apis = [
            'getDeviceId', 'getSubscriberId', 'getSimSerialNumber',
            'getAccounts', 'sendTextMessage', 'Runtime.exec',
            'ProcessBuilder', 'DexClassLoader', 'PathClassLoader',
            'getInstalledPackages', 'setWifiEnabled'
        ]
        
        for dex in apk.get_all_dex():
            try:
                d = DalvikVMFormat(dex)
                for method in d.get_methods():
                    method_name = method.get_name()
                    if any(api in method_name for api in dangerous_apis):
                        suspicious.append(method_name)
            except:
                pass
        
        return list(set(suspicious))
