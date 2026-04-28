from pydantic import BaseModel
from typing import List, Dict, Any, Optional
from datetime import datetime

class Certificate(BaseModel):
    subject: str
    issuer: str
    serial_number: str
    fingerprint: str
    valid_from: str
    valid_to: str

class APKMetadata(BaseModel):
    package_name: str
    version_name: str
    version_code: int
    min_sdk: int
    target_sdk: int
    permissions: List[str]
    activities: List[str]
    services: List[str]
    receivers: List[str]

class ExtractedArtifacts(BaseModel):
    urls: List[str]
    ip_addresses: List[str]
    domains: List[str]
    emails: List[str]
    phone_numbers: List[str]

class APKAnalysisResult(BaseModel):
    id: str
    filename: str
    file_hash: str
    size: int
    metadata: APKMetadata
    certificate: Certificate
    artifacts: ExtractedArtifacts
    analyzed_at: datetime

class FraudIndicator(BaseModel):
    type: str
    severity: str
    description: str
    evidence: Any

class FraudDetectionResult(BaseModel):
    apk_id: str
    score: float
    is_fraudulent: bool
    indicators: List[FraudIndicator]
    cluster_id: Optional[int]

class ClusterResult(BaseModel):
    cluster_id: int
    size: int
    apk_ids: List[str]
    common_features: Dict[str, Any]
    fraud_score: float
