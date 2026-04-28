# Dataset Reference Guide

## 📊 Quick Reference

| Dataset | Size | Samples | Purpose | Priority |
|---------|------|---------|---------|----------|
| Android Malware | ~5 GB | 15,000+ | Training fraud detection | ⭐⭐⭐ High |
| CICMalDroid 2020 | ~8 GB | 17,341 | Validation & testing | ⭐⭐⭐ High |
| Drebin | ~2 GB | 129,013 | Feature engineering | ⭐⭐ Medium |
| Malicious URLs | ~100 MB | 651,191 | Network artifact detection | ⭐⭐⭐ High |
| Malicious IPs | ~10 MB | 50,000+ | IP reputation | ⭐⭐ Medium |
| Certificates | ~500 MB | 100,000+ | Certificate analysis | ⭐ Low |

## 🎯 Dataset Details

### 1. Android Malware Dataset
**Kaggle**: `shashwatwork/android-malware-dataset-for-machine-learning`

**Contents**:
```
android-malware-dataset/
├── malware/          # Malicious APK samples
├── benign/           # Clean APK samples
├── features.csv      # Extracted features
└── labels.csv        # Classifications
```

**Use Cases**:
- Training fraud detection models
- Permission pattern analysis
- API call behavior learning
- Baseline accuracy testing

**Features Included**:
- 215 permission features
- 20 API call features
- Network behavior indicators
- File system access patterns

### 2. CICMalDroid 2020
**Kaggle**: `subhajournal/cicmaldroid-2020`

**Contents**:
```
cicmaldroid-2020/
├── malware/
│   ├── adware/
│   ├── ransomware/
│   ├── scareware/
│   └── sms_malware/
├── benign/
└── features/
    ├── static_features.csv
    └── dynamic_features.csv
```

**Use Cases**:
- Malware family classification
- Dynamic behavior analysis
- Network traffic patterns
- Validation dataset

**Malware Categories**:
- Adware: 1,253 samples
- Ransomware: 1,474 samples
- Scareware: 210 samples
- SMS Malware: 1,417 samples
- Benign: 12,987 samples

### 3. Drebin Dataset
**Kaggle**: `xwolf12/drebin`

**Contents**:
```
drebin/
├── feature_vectors/  # Pre-extracted features
├── sha256.txt       # File hashes
└── malware_families.txt
```

**Use Cases**:
- Large-scale feature analysis
- Clustering experiments
- Benchmark comparisons
- Research validation

**Features**:
- 545,333 features total
- Hardware components
- Requested permissions
- App components
- Filtered intents
- API calls
- Network addresses

### 4. Malicious URLs Dataset
**Kaggle**: `sid321axn/malicious-urls-dataset`

**Contents**:
```
malicious_urls.csv
Columns:
- url: The URL string
- type: benign/defacement/phishing/malware
```

**Use Cases**:
- URL pattern detection
- Domain reputation
- Phishing detection
- Network artifact validation

**Distribution**:
- Benign: 428,103
- Defacement: 96,457
- Phishing: 94,111
- Malware: 32,520

### 5. Malicious IP Addresses
**Kaggle**: `kkhandekar/malicious-ip-addresses`

**Contents**:
```
malicious_ips.csv
Columns:
- ip: IP address
- category: threat type
- country: origin country
- asn: Autonomous System Number
```

**Use Cases**:
- IP reputation checking
- C2 server detection
- Geographic threat analysis
- Network infrastructure mapping

### 6. Android App Certificates
**Kaggle**: `gauthamp10/android-app-certificates`

**Contents**:
```
certificates/
├── fingerprints.csv
├── subjects.csv
└── issuers.csv
```

**Use Cases**:
- Certificate pattern analysis
- Developer identification
- Self-signed detection
- Trust chain validation

## 📥 Download Commands

### Individual Downloads

```bash
# Android Malware Dataset
kaggle datasets download -d shashwatwork/android-malware-dataset-for-machine-learning
unzip android-malware-dataset-for-machine-learning.zip -d data/apk-samples/

# CICMalDroid 2020
kaggle datasets download -d subhajournal/cicmaldroid-2020
unzip cicmaldroid-2020.zip -d data/cicmaldroid/

# Drebin Dataset
kaggle datasets download -d xwolf12/drebin
unzip drebin.zip -d data/drebin/

# Malicious URLs
kaggle datasets download -d sid321axn/malicious-urls-dataset
unzip malicious-urls-dataset.zip -d data/malicious-urls/

# Malicious IPs
kaggle datasets download -d kkhandekar/malicious-ip-addresses
unzip malicious-ip-addresses.zip -d data/malicious-ips/

# Android Certificates
kaggle datasets download -d gauthamp10/android-app-certificates
unzip android-app-certificates.zip -d data/certificates/
```

### Batch Download

```bash
# Use the provided script
chmod +x scripts/download_datasets.sh
./scripts/download_datasets.sh
```

## 🔄 Data Processing Pipeline

### 1. Initial Setup
```python
# Load datasets
import pandas as pd

# Load malicious URLs
urls_df = pd.read_csv('data/malicious-urls/malicious_urls.csv')

# Load malicious IPs
ips_df = pd.read_csv('data/malicious-ips/malicious_ips.csv')

# Load Drebin features
drebin_df = pd.read_csv('data/drebin/feature_vectors/features.csv')
```

### 2. Feature Extraction
```python
from ml.feature_extractor import FeatureExtractor

extractor = FeatureExtractor()

# Extract features from APK analysis
features = extractor.extract_features(apk_analysis)
```

### 3. Model Training
```python
from sklearn.ensemble import RandomForestClassifier
from sklearn.model_selection import train_test_split

# Split data
X_train, X_test, y_train, y_test = train_test_split(
    features, labels, test_size=0.2, random_state=42
)

# Train model
model = RandomForestClassifier(n_estimators=100)
model.fit(X_train, y_train)

# Evaluate
accuracy = model.score(X_test, y_test)
print(f"Accuracy: {accuracy:.2%}")
```

## 📊 Dataset Statistics

### Storage Requirements

```bash
# Minimum (essential datasets only)
Android Malware:  5 GB
Malicious URLs:   100 MB
Malicious IPs:    10 MB
Total:            ~5.1 GB

# Recommended (all datasets)
Android Malware:  5 GB
CICMalDroid:      8 GB
Drebin:           2 GB
Malicious URLs:   100 MB
Malicious IPs:    10 MB
Certificates:     500 MB
Total:            ~15.6 GB

# With processing space
Total Required:   ~25 GB
```

### Sample Counts

```
Total APK Samples:     161,354
  - Malware:            20,354
  - Benign:            141,000

Total URLs:           651,191
  - Malicious:         223,088
  - Benign:            428,103

Total IPs:             50,000+
Total Certificates:   100,000+
```

## 🎓 Usage Examples

### Example 1: Load Training Data

```python
import pandas as pd
from pathlib import Path

# Load Android Malware Dataset
malware_dir = Path('data/apk-samples/malware')
benign_dir = Path('data/apk-samples/benign')

malware_files = list(malware_dir.glob('*.apk'))
benign_files = list(benign_dir.glob('*.apk'))

print(f"Malware samples: {len(malware_files)}")
print(f"Benign samples: {len(benign_files)}")
```

### Example 2: Check URL Reputation

```python
import pandas as pd

# Load malicious URLs
urls_df = pd.read_csv('data/malicious-urls/malicious_urls.csv')

def check_url(url):
    """Check if URL is in malicious database"""
    result = urls_df[urls_df['url'] == url]
    if not result.empty:
        return result['type'].values[0]
    return 'unknown'

# Test
url = "http://malicious-domain.com"
threat_type = check_url(url)
print(f"URL threat type: {threat_type}")
```

### Example 3: IP Reputation Lookup

```python
import pandas as pd

# Load malicious IPs
ips_df = pd.read_csv('data/malicious-ips/malicious_ips.csv')

def check_ip(ip_address):
    """Check IP reputation"""
    result = ips_df[ips_df['ip'] == ip_address]
    if not result.empty:
        return {
            'malicious': True,
            'category': result['category'].values[0],
            'country': result['country'].values[0]
        }
    return {'malicious': False}

# Test
ip = "185.199.108.153"
reputation = check_ip(ip)
print(f"IP reputation: {reputation}")
```

## 🔍 Data Quality Checks

### Verify Downloads

```bash
# Check file counts
echo "APK Samples:"
find data/apk-samples -name "*.apk" | wc -l

echo "CSV Files:"
find data -name "*.csv" | wc -l

# Check sizes
du -sh data/*

# Verify integrity
md5sum data/malicious-urls/*.csv
```

### Validate Data

```python
import pandas as pd

# Check for missing values
df = pd.read_csv('data/malicious-urls/malicious_urls.csv')
print(f"Missing values: {df.isnull().sum()}")

# Check data types
print(df.dtypes)

# Check distributions
print(df['type'].value_counts())
```

## 🆘 Troubleshooting

### Dataset Not Found
```bash
# Re-download specific dataset
kaggle datasets download -d <dataset-name> --force
```

### Corrupted Files
```bash
# Remove and re-download
rm -rf data/apk-samples/*
kaggle datasets download -d shashwatwork/android-malware-dataset-for-machine-learning
```

### Insufficient Space
```bash
# Check available space
df -h

# Clean up old files
rm -rf data/*/cache
rm -rf data/*/.ipynb_checkpoints
```

## 📚 Additional Resources

- **Kaggle Datasets**: https://www.kaggle.com/datasets
- **VirusTotal**: https://www.virustotal.com/
- **MalwareBazaar**: https://bazaar.abuse.ch/
- **AndroZoo**: https://androzoo.uni.lu/

## 🔄 Keeping Data Fresh

### Update Schedule

```bash
# Weekly updates (recommended)
0 2 * * 0 /path/to/scripts/download_datasets.sh

# Monthly full refresh
0 3 1 * * rm -rf data/* && /path/to/scripts/download_datasets.sh
```

### Manual Updates

```bash
# Update threat intelligence
kaggle datasets download -d sid321axn/malicious-urls-dataset --force
kaggle datasets download -d kkhandekar/malicious-ip-addresses --force

# Update APK samples
kaggle datasets download -d shashwatwork/android-malware-dataset-for-machine-learning --force
```

---

**Need help?** Check [REQUIREMENTS.md](REQUIREMENTS.md) for setup instructions or [USAGE_GUIDE.md](USAGE_GUIDE.md) for analysis examples.
