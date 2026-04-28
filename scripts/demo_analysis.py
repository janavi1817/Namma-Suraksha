#!/usr/bin/env python3
"""
Demo script showing APK analysis workflow
"""

import requests
import json
import time
from typing import Dict, Any

API_URL = "http://localhost:8000"

def print_section(title: str):
    """Print formatted section header"""
    print(f"\n{'='*60}")
    print(f"  {title}")
    print(f"{'='*60}\n")

def upload_apk(filepath: str) -> Dict[str, Any]:
    """Upload and analyze APK"""
    print(f"Uploading: {filepath}")
    
    with open(filepath, 'rb') as f:
        files = {'file': (filepath.split('/')[-1], f, 'application/vnd.android.package-archive')}
        response = requests.post(f"{API_URL}/api/apk/upload", files=files)
    
    if response.status_code == 200:
        result = response.json()
        print(f"✓ Analysis complete")
        print(f"  APK ID: {result['id']}")
        print(f"  Fraud Score: {result['fraud_score']:.2%}")
        print(f"  Status: {'FRAUDULENT' if result['is_fraudulent'] else 'CLEAN'}")
        return result
    else:
        print(f"✗ Upload failed: {response.text}")
        return None

def display_indicators(indicators: list):
    """Display fraud indicators"""
    print_section("Fraud Indicators")
    
    if not indicators:
        print("No indicators found")
        return
    
    severity_order = {'critical': 0, 'high': 1, 'medium': 2, 'low': 3}
    sorted_indicators = sorted(indicators, key=lambda x: severity_order.get(x['severity'], 4))
    
    for ind in sorted_indicators:
        severity_icon = {
            'critical': '🔴',
            'high': '🟠',
            'medium': '🟡',
            'low': '🟢'
        }.get(ind['severity'], '⚪')
        
        print(f"{severity_icon} [{ind['severity'].upper()}] {ind['description']}")
        print(f"   Type: {ind['type']}")
        print()

def get_apk_details(apk_id: str):
    """Get detailed APK information"""
    print_section("APK Details")
    
    response = requests.get(f"{API_URL}/api/apk/{apk_id}/analysis")
    
    if response.status_code == 200:
        data = response.json()
        
        print(f"Package: {data['apk']['package_name']}")
        print(f"Version: {data['apk']['version_name']}")
        print(f"Hash: {data['apk']['file_hash']}")
        print(f"Size: {data['apk']['size'] / 1024 / 1024:.2f} MB")
        
        if data.get('certificate'):
            print(f"\nCertificate:")
            print(f"  Subject: {data['certificate']['subject']}")
            print(f"  Issuer: {data['certificate']['issuer']}")
            print(f"  Fingerprint: {data['certificate']['fingerprint'][:32]}...")
        
        if data.get('domains'):
            print(f"\nDomains ({len(data['domains'])}):")
            for domain in data['domains'][:5]:
                print(f"  • {domain}")
        
        if data.get('ips'):
            print(f"\nIP Addresses ({len(data['ips'])}):")
            for ip in data['ips'][:5]:
                print(f"  • {ip}")
    else:
        print(f"✗ Failed to get details: {response.text}")

def get_relationships(apk_id: str):
    """Get and display relationship graph"""
    print_section("Relationship Graph")
    
    response = requests.get(f"{API_URL}/api/graph/relationships/{apk_id}?depth=2")
    
    if response.status_code == 200:
        graph = response.json()
        
        node_types = {}
        for node in graph['nodes']:
            label = node['label']
            node_types[label] = node_types.get(label, 0) + 1
        
        print(f"Total Nodes: {len(graph['nodes'])}")
        print(f"Total Edges: {len(graph['edges'])}")
        print(f"\nNode Distribution:")
        for label, count in node_types.items():
            print(f"  {label}: {count}")
        
        print(f"\nRelationship Types:")
        rel_types = {}
        for edge in graph['edges']:
            rel_type = edge['type']
            rel_types[rel_type] = rel_types.get(rel_type, 0) + 1
        
        for rel_type, count in rel_types.items():
            print(f"  {rel_type}: {count}")
    else:
        print(f"✗ Failed to get relationships: {response.text}")

def get_platform_stats():
    """Get platform statistics"""
    print_section("Platform Statistics")
    
    response = requests.get(f"{API_URL}/api/stats")
    
    if response.status_code == 200:
        stats = response.json()
        print(f"Total APKs Analyzed: {stats.get('total_apks', 0)}")
        print(f"Unique Certificates: {stats.get('total_certs', 0)}")
        print(f"Tracked Domains: {stats.get('total_domains', 0)}")
        print(f"IP Addresses: {stats.get('total_ips', 0)}")
    else:
        print(f"✗ Failed to get stats: {response.text}")

def get_root_sources():
    """Get root sources"""
    print_section("Root Sources")
    
    response = requests.get(f"{API_URL}/api/root-sources")
    
    if response.status_code == 200:
        sources = response.json()
        
        if not sources:
            print("No root sources found (need multiple APKs with same certificate)")
            return
        
        print(f"Found {len(sources)} certificates used in multiple APKs:\n")
        
        for source in sources[:5]:
            print(f"Certificate: {source['subject']}")
            print(f"  Fingerprint: {source['cert_fingerprint'][:32]}...")
            print(f"  APK Count: {source['apk_count']}")
            print()
    else:
        print(f"✗ Failed to get root sources: {response.text}")

def main():
    """Main demo workflow"""
    print_section("APK Fraud Intelligence Platform - Demo")
    
    # Check if API is available
    try:
        response = requests.get(f"{API_URL}/api/stats")
        if response.status_code != 200:
            print("✗ API is not available. Please start the backend server.")
            return
    except requests.exceptions.ConnectionError:
        print("✗ Cannot connect to API. Please start the backend server.")
        return
    
    print("✓ API is available")
    
    # Get platform stats
    get_platform_stats()
    
    # Example: Upload APK (you need to provide a real APK file)
    apk_path = input("\nEnter path to APK file (or press Enter to skip): ").strip()
    
    if apk_path:
        result = upload_apk(apk_path)
        
        if result:
            # Display indicators
            display_indicators(result['indicators'])
            
            # Get detailed information
            time.sleep(1)
            get_apk_details(result['id'])
            
            # Get relationships
            time.sleep(1)
            get_relationships(result['id'])
    
    # Get root sources
    time.sleep(1)
    get_root_sources()
    
    print_section("Demo Complete")
    print("Visit http://localhost:3000 for the web interface")

if __name__ == "__main__":
    main()
