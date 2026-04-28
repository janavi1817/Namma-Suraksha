#!/bin/bash

echo "=========================================="
echo "APK Fraud Intelligence - Dataset Downloader"
echo "=========================================="
echo ""

# Check if Kaggle is configured
if [ ! -f ~/.kaggle/kaggle.json ]; then
    echo "❌ Kaggle API not configured!"
    echo "Please follow these steps:"
    echo "1. Go to https://www.kaggle.com/account"
    echo "2. Scroll to 'API' section"
    echo "3. Click 'Create New API Token'"
    echo "4. Move kaggle.json to ~/.kaggle/"
    echo "5. Run: chmod 600 ~/.kaggle/kaggle.json"
    exit 1
fi

echo "✅ Kaggle API configured"
echo ""

# Create data directories
echo "Creating data directories..."
mkdir -p data/{apk-samples,cicmaldroid,drebin,malicious-urls,malicious-ips,certificates}
echo "✅ Directories created"
echo ""

# Function to download and extract dataset
download_dataset() {
    local dataset_name=$1
    local output_dir=$2
    local display_name=$3
    
    echo "📥 Downloading $display_name..."
    if kaggle datasets download -d "$dataset_name" -p "$output_dir" --unzip; then
        echo "✅ $display_name downloaded successfully"
    else
        echo "⚠️  Failed to download $display_name (may require acceptance on Kaggle)"
    fi
    echo ""
}

# Download datasets
echo "Starting dataset downloads (this may take 30-60 minutes)..."
echo ""

# 1. Android Malware Dataset
download_dataset \
    "shashwatwork/android-malware-dataset-for-machine-learning" \
    "data/apk-samples" \
    "Android Malware Dataset"

# 2. CICMalDroid 2020
download_dataset \
    "subhajournal/cicmaldroid-2020" \
    "data/cicmaldroid" \
    "CICMalDroid 2020"

# 3. Drebin Dataset
download_dataset \
    "xwolf12/drebin" \
    "data/drebin" \
    "Drebin Dataset"

# 4. Malicious URLs
download_dataset \
    "sid321axn/malicious-urls-dataset" \
    "data/malicious-urls" \
    "Malicious URLs Dataset"

# 5. Malicious IPs
download_dataset \
    "kkhandekar/malicious-ip-addresses" \
    "data/malicious-ips" \
    "Malicious IP Addresses"

# 6. Android Certificates
download_dataset \
    "gauthamp10/android-app-certificates" \
    "data/certificates" \
    "Android Certificates"

# Summary
echo "=========================================="
echo "Download Summary"
echo "=========================================="
echo ""

if [ -d "data" ]; then
    echo "Total data size: $(du -sh data/ 2>/dev/null | cut -f1)"
    echo ""
    echo "Dataset breakdown:"
    for dir in data/*/; do
        if [ -d "$dir" ]; then
            size=$(du -sh "$dir" 2>/dev/null | cut -f1)
            name=$(basename "$dir")
            count=$(find "$dir" -type f 2>/dev/null | wc -l)
            echo "  • $name: $size ($count files)"
        fi
    done
fi

echo ""
echo "=========================================="
echo "✅ Dataset download complete!"
echo "=========================================="
echo ""
echo "Next steps:"
echo "1. Verify datasets: ls -lh data/*/"
echo "2. Start the platform: docker-compose up -d"
echo "3. Run analysis: python scripts/demo_analysis.py"
