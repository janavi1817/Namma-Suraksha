"""
RAKSHAK ML API Server
Trains on fraud-dataset.csv at startup, serves predictions via REST API.
"""
import os
import sys
from pathlib import Path
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import List, Dict, Any, Optional

from ml_engine import FraudMLEngine

app = FastAPI(title="RAKSHAK ML Engine", version="1.0.0")
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"], allow_credentials=True,
    allow_methods=["*"], allow_headers=["*"],
)

engine = FraudMLEngine()
training_metrics: Dict[str, Any] = {}

# ── Train on startup ─────────────────────────────────────────────────────────

CSV_PATH = os.getenv("DATASET_PATH", str(Path(__file__).parent.parent / "fraud-dataset.csv"))

@app.on_event("startup")
def startup_train():
    global training_metrics
    if not Path(CSV_PATH).exists():
        print(f"WARNING: Dataset not found at {CSV_PATH}")
        return
    print(f"Training ML models on {CSV_PATH}...")
    training_metrics = engine.train(CSV_PATH)
    print(f"Training complete!")
    print(f"  Accuracy:  {training_metrics['accuracy']}")
    print(f"  Precision: {training_metrics['precision']}")
    print(f"  Recall:    {training_metrics['recall']}")
    print(f"  F1 Score:  {training_metrics['f1_score']}")
    print(f"  CV F1:     {training_metrics['cv_f1_mean']} ± {training_metrics['cv_f1_std']}")
    print(f"  Clusters:  {training_metrics.get('fraud_clusters', 0)}")

# ── Request/Response models ──────────────────────────────────────────────────

class PredictRequest(BaseModel):
    amount: float = 0
    is_foreign: int = 0
    high_risk_country: int = 0
    previous_fraud: int = 0
    transaction_type: str = "Online"
    time_hour: int = 12
    permissions: Optional[str] = ""
    urls: Optional[str] = ""
    domains: Optional[str] = ""
    ipAddresses: Optional[str] = ""
    apiKeys: Optional[str] = ""
    sampleName: Optional[str] = ""
    sha256: Optional[str] = ""
    packageName: Optional[str] = ""

# ── Endpoints ────────────────────────────────────────────────────────────────

@app.get("/ml/health")
def health():
    return {"status": "ok", "model_trained": engine.is_trained}

@app.get("/ml/metrics")
def get_metrics():
    """Return training metrics, accuracy, confusion matrix."""
    if not engine.is_trained:
        raise HTTPException(503, "Model not trained yet")
    return {
        **training_metrics,
        "feature_importance": engine.feature_importance,
    }

@app.post("/ml/predict")
def predict(req: PredictRequest):
    """Predict fraud for a single transaction/APK."""
    if not engine.is_trained:
        raise HTTPException(503, "Model not trained yet")
    input_data = req.model_dump()
    result = engine.predict(input_data)
    return result

@app.get("/ml/predictions")
def all_predictions():
    """Get predictions for all training data (for dashboard)."""
    if not engine.is_trained:
        raise HTTPException(503, "Model not trained yet")
    preds = engine.get_all_predictions()
    # Summarize
    total = len(preds)
    correct = sum(1 for p in preds if p["is_fraud"] == bool(p["actual_fraud"]))
    return {
        "total": total,
        "correct": correct,
        "accuracy": round(correct / total, 4) if total else 0,
        "predictions": preds[:50],  # Return first 50 for performance
    }

@app.get("/ml/feature-importance")
def feature_importance():
    """Return ranked feature importance."""
    if not engine.is_trained:
        raise HTTPException(503, "Model not trained yet")
    return engine.feature_importance

@app.get("/ml/clusters")
def get_clusters():
    """Return fraud cluster analysis."""
    if not engine.is_trained:
        raise HTTPException(503, "Model not trained yet")
    return {
        "total_clusters": training_metrics.get("fraud_clusters", 0),
        "noise_samples": training_metrics.get("noise_samples", 0),
        "total_fraud": training_metrics.get("fraud_count", 0),
    }

@app.get("/ml/explainability")
def explainability_summary():
    """Return model explainability summary."""
    if not engine.is_trained:
        raise HTTPException(503, "Model not trained yet")
    return {
        "model_type": "Ensemble (RandomForest + GradientBoosting)",
        "n_estimators_rf": 200,
        "n_estimators_gb": 150,
        "feature_count": len(engine.FEATURE_NAMES),
        "features": engine.FEATURE_NAMES,
        "feature_importance": engine.feature_importance,
        "metrics": training_metrics,
        "explanation_method": "Tree-based feature contribution analysis",
        "clustering_method": "DBSCAN (eps=0.8, min_samples=3)",
    }

if __name__ == "__main__":
    import uvicorn
    port = int(os.getenv("ML_PORT", "8090"))
    uvicorn.run(app, host="0.0.0.0", port=port)
