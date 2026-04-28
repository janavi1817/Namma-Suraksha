from fastapi import FastAPI, UploadFile, File, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from typing import List, Dict, Any
import os
import uuid
from pathlib import Path

from apk_analyzer import APKAnalyzer
from graph_manager import GraphManager
from fraud_detector import FraudDetector
from models import APKAnalysisResult, FraudDetectionResult, ClusterResult

app = FastAPI(title="APK Fraud Intelligence Platform")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

UPLOAD_DIR = Path("uploads")
UPLOAD_DIR.mkdir(exist_ok=True)

analyzer = APKAnalyzer()
graph_manager = GraphManager()
fraud_detector = FraudDetector()

@app.post("/api/apk/upload")
async def upload_apk(file: UploadFile = File(...)) -> Dict[str, Any]:
    """Upload and analyze APK file"""
    if not file.filename.endswith('.apk'):
        raise HTTPException(400, "Only APK files allowed")
    
    apk_id = str(uuid.uuid4())
    file_path = UPLOAD_DIR / f"{apk_id}.apk"
    
    with open(file_path, "wb") as f:
        content = await file.read()
        f.write(content)
    
    # Analyze APK
    analysis = analyzer.analyze(str(file_path))
    analysis['id'] = apk_id
    analysis['filename'] = file.filename
    
    # Store in graph database
    graph_manager.store_apk(analysis)
    
    # Run fraud detection
    fraud_result = fraud_detector.detect(analysis)
    
    return {
        "id": apk_id,
        "analysis": analysis,
        "fraud_score": fraud_result['score'],
        "is_fraudulent": fraud_result['is_fraudulent'],
        "indicators": fraud_result['indicators']
    }

@app.get("/api/apk/{apk_id}/analysis")
async def get_analysis(apk_id: str) -> APKAnalysisResult:
    """Get detailed analysis for an APK"""
    result = graph_manager.get_apk_analysis(apk_id)
    if not result:
        raise HTTPException(404, "APK not found")
    return result

@app.get("/api/graph/relationships/{apk_id}")
async def get_relationships(apk_id: str, depth: int = 2) -> Dict[str, Any]:
    """Get relationship graph for an APK"""
    graph = graph_manager.get_relationships(apk_id, depth)
    return graph

@app.get("/api/fraud/detect")
async def detect_fraud(threshold: float = 0.7) -> List[FraudDetectionResult]:
    """Run fraud detection on all APKs"""
    results = fraud_detector.batch_detect(threshold)
    return results

@app.get("/api/clusters")
async def get_clusters() -> List[ClusterResult]:
    """Get fraud clusters and related APKs"""
    clusters = fraud_detector.get_clusters()
    return clusters

@app.get("/api/stats")
async def get_stats() -> Dict[str, Any]:
    """Get platform statistics"""
    return graph_manager.get_statistics()

@app.get("/api/root-sources")
async def get_root_sources() -> List[Dict[str, Any]]:
    """Identify root sources of fraud campaigns"""
    return graph_manager.find_root_sources()

@app.get("/api/repeat-offenders")
async def get_repeat_offenders() -> List[Dict[str, Any]]:
    """Identify repeat offenders by certificate/developer"""
    return graph_manager.find_repeat_offenders()

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
