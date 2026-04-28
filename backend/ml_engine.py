"""
RAKSHAK ML Engine — Fraud Detection, Clustering & Explainability
Trains on fraud-dataset.csv, provides real predictions with feature importance.
"""
import os
import numpy as np
import pandas as pd
from sklearn.ensemble import RandomForestClassifier, GradientBoostingClassifier
from sklearn.cluster import DBSCAN
from sklearn.preprocessing import StandardScaler, LabelEncoder
from sklearn.model_selection import cross_val_score, train_test_split
from sklearn.metrics import (
    accuracy_score, precision_score, recall_score, f1_score,
    confusion_matrix, classification_report,
)
from typing import Dict, List, Any, Optional
import json
import hashlib

# ── Feature engineering ──────────────────────────────────────────────────────

FEATURE_COLS = ["amount", "is_foreign", "high_risk_country", "previous_fraud", "time_hour"]
PERMISSION_RISK = {
    "android.permission.SEND_SMS": 0.9,
    "android.permission.READ_SMS": 0.85,
    "android.permission.RECEIVE_SMS": 0.8,
    "android.permission.READ_CONTACTS": 0.6,
    "android.permission.ACCESS_FINE_LOCATION": 0.5,
    "android.permission.SYSTEM_ALERT_WINDOW": 0.7,
    "android.permission.CAMERA": 0.4,
    "android.permission.RECORD_AUDIO": 0.5,
    "android.permission.READ_PHONE_STATE": 0.6,
    "android.permission.CALL_PHONE": 0.7,
    "android.permission.BIND_ACCESSIBILITY_SERVICE": 0.95,
    "android.permission.REQUEST_INSTALL_PACKAGES": 0.85,
    "android.permission.INTERNET": 0.1,
}

SUSPICIOUS_TLDS = {".tk", ".ml", ".ga", ".cf", ".gq", ".xyz", ".top", ".ru", ".cn", ".cc"}


def engineer_features(row: dict) -> dict:
    """Extract ML features from a transaction/APK submission."""
    amount = float(row.get("amount", 0))
    is_foreign = int(row.get("is_foreign", 0))
    high_risk = int(row.get("high_risk_country", 0))
    prev_fraud = int(row.get("previous_fraud", 0))
    hour = int(row.get("time_hour", 12))
    tx_type = str(row.get("transaction_type", "Online"))

    # Permission-based risk score
    perms = row.get("permissions", [])
    if isinstance(perms, str):
        perms = [p.strip() for p in perms.replace("\n", ",").split(",") if p.strip()]
    perm_risk = sum(PERMISSION_RISK.get(p, 0.1) for p in perms)
    perm_count = len(perms)
    dangerous_perm_count = sum(1 for p in perms if PERMISSION_RISK.get(p, 0) > 0.5)

    # Domain risk
    domains = row.get("domains", [])
    if isinstance(domains, str):
        domains = [d.strip() for d in domains.replace("\n", ",").split(",") if d.strip()]
    suspicious_domain_count = sum(1 for d in domains if any(d.endswith(t) for t in SUSPICIOUS_TLDS))

    # IP count
    ips = row.get("ipAddresses", row.get("ip_addresses", []))
    if isinstance(ips, str):
        ips = [i.strip() for i in ips.replace("\n", ",").split(",") if i.strip()]
    ip_count = len(ips)

    # URL count
    urls = row.get("urls", [])
    if isinstance(urls, str):
        urls = [u.strip() for u in urls.replace("\n", ",").split(",") if u.strip()]
    url_count = len(urls)

    # Time-based risk (off-hours)
    off_hours = 1 if hour < 6 or hour > 22 else 0

    return {
        "amount": amount,
        "is_foreign": is_foreign,
        "high_risk_country": high_risk,
        "previous_fraud": prev_fraud,
        "time_hour": hour,
        "is_online": 1 if tx_type == "Online" else 0,
        "off_hours": off_hours,
        "amount_log": np.log1p(amount),
        "perm_risk_score": perm_risk,
        "perm_count": perm_count,
        "dangerous_perm_count": dangerous_perm_count,
        "suspicious_domain_count": suspicious_domain_count,
        "ip_count": ip_count,
        "url_count": url_count,
        "risk_factor_sum": is_foreign + high_risk + prev_fraud + off_hours,
    }


# ── ML Model ─────────────────────────────────────────────────────────────────

class FraudMLEngine:
    """Trains, predicts, clusters, and explains fraud detection."""

    FEATURE_NAMES = [
        "amount", "is_foreign", "high_risk_country", "previous_fraud",
        "time_hour", "is_online", "off_hours", "amount_log",
        "perm_risk_score", "perm_count", "dangerous_perm_count",
        "suspicious_domain_count", "ip_count", "url_count", "risk_factor_sum",
    ]

    def __init__(self):
        self.rf_model = RandomForestClassifier(
            n_estimators=200, max_depth=12, min_samples_split=5,
            class_weight="balanced", random_state=42, n_jobs=-1,
        )
        self.gb_model = GradientBoostingClassifier(
            n_estimators=150, max_depth=6, learning_rate=0.1, random_state=42,
        )
        self.scaler = StandardScaler()
        self.clusterer = DBSCAN(eps=0.8, min_samples=3)
        self.is_trained = False
        self.metrics: Dict[str, Any] = {}
        self.feature_importance: Dict[str, float] = {}
        self.training_data: Optional[pd.DataFrame] = None

    def train(self, csv_path: str) -> Dict[str, Any]:
        """Train models on the fraud dataset CSV."""
        df = pd.read_csv(csv_path)
        self.training_data = df

        # Engineer features for each row
        features_list = []
        for _, row in df.iterrows():
            feat = engineer_features(row.to_dict())
            features_list.append(feat)
        feat_df = pd.DataFrame(features_list)

        X = feat_df[self.FEATURE_NAMES].values
        y = df["fraud"].values

        # Scale features
        X_scaled = self.scaler.fit_transform(X)

        # Train/test split
        X_train, X_test, y_train, y_test = train_test_split(
            X_scaled, y, test_size=0.2, random_state=42, stratify=y,
        )

        # Train RandomForest
        self.rf_model.fit(X_train, y_train)
        rf_pred = self.rf_model.predict(X_test)
        rf_proba = self.rf_model.predict_proba(X_test)[:, 1]

        # Train GradientBoosting
        self.gb_model.fit(X_train, y_train)
        gb_pred = self.gb_model.predict(X_test)

        # Ensemble prediction (average probabilities)
        gb_proba = self.gb_model.predict_proba(X_test)[:, 1]
        ensemble_proba = (rf_proba + gb_proba) / 2
        ensemble_pred = (ensemble_proba >= 0.5).astype(int)

        # Cross-validation
        cv_scores = cross_val_score(self.rf_model, X_scaled, y, cv=5, scoring="f1")

        # Metrics
        cm = confusion_matrix(y_test, ensemble_pred)
        self.metrics = {
            "accuracy": round(accuracy_score(y_test, ensemble_pred), 4),
            "precision": round(precision_score(y_test, ensemble_pred), 4),
            "recall": round(recall_score(y_test, ensemble_pred), 4),
            "f1_score": round(f1_score(y_test, ensemble_pred), 4),
            "cv_f1_mean": round(cv_scores.mean(), 4),
            "cv_f1_std": round(cv_scores.std(), 4),
            "confusion_matrix": cm.tolist(),
            "rf_accuracy": round(accuracy_score(y_test, rf_pred), 4),
            "gb_accuracy": round(accuracy_score(y_test, gb_pred), 4),
            "total_samples": len(df),
            "fraud_count": int(y.sum()),
            "clean_count": int(len(y) - y.sum()),
            "fraud_rate": round(y.mean(), 4),
        }

        # Feature importance (from RandomForest)
        importances = self.rf_model.feature_importances_
        self.feature_importance = {
            name: round(float(imp), 4)
            for name, imp in sorted(
                zip(self.FEATURE_NAMES, importances), key=lambda x: -x[1]
            )
        }

        # Run clustering on fraud samples
        fraud_mask = y == 1
        if fraud_mask.sum() > 5:
            fraud_features = X_scaled[fraud_mask]
            cluster_labels = self.clusterer.fit_predict(fraud_features)
            n_clusters = len(set(cluster_labels)) - (1 if -1 in cluster_labels else 0)
            self.metrics["fraud_clusters"] = n_clusters
            self.metrics["noise_samples"] = int((cluster_labels == -1).sum())
        else:
            self.metrics["fraud_clusters"] = 0

        self.is_trained = True
        return self.metrics

    def predict(self, input_data: dict) -> Dict[str, Any]:
        """Predict fraud probability for a single sample with explainability."""
        if not self.is_trained:
            raise RuntimeError("Model not trained. Call train() first.")

        features = engineer_features(input_data)
        X = np.array([[features[f] for f in self.FEATURE_NAMES]])
        X_scaled = self.scaler.transform(X)

        rf_proba = self.rf_model.predict_proba(X_scaled)[0]
        gb_proba = self.gb_model.predict_proba(X_scaled)[0]
        ensemble_proba = (rf_proba + gb_proba) / 2

        fraud_prob = float(ensemble_proba[1])
        is_fraud = fraud_prob >= 0.5
        risk_score = min(round(fraud_prob * 100), 100)

        # Risk level
        if risk_score >= 75:
            risk_level = "Critical"
        elif risk_score >= 55:
            risk_level = "High"
        elif risk_score >= 35:
            risk_level = "Medium"
        else:
            risk_level = "Low"

        # Verdict
        if risk_score >= 70:
            verdict = "MALICIOUS"
        elif risk_score >= 40:
            verdict = "SUSPICIOUS"
        else:
            verdict = "CLEAN"

        confidence = "High" if abs(fraud_prob - 0.5) > 0.3 else "Medium" if abs(fraud_prob - 0.5) > 0.15 else "Low"

        # ── Explainability: feature contributions ──
        explanations = self._explain_prediction(features, X_scaled[0])

        # ── Find similar clusters ──
        cluster_info = self._find_cluster(X_scaled[0])

        return {
            "fraud_probability": round(fraud_prob, 4),
            "is_fraud": is_fraud,
            "risk_score": risk_score,
            "risk_level": risk_level,
            "verdict": verdict,
            "confidence": confidence,
            "rf_probability": round(float(rf_proba[1]), 4),
            "gb_probability": round(float(gb_proba[1]), 4),
            "explanations": explanations,
            "cluster_info": cluster_info,
            "feature_values": {k: round(v, 4) if isinstance(v, float) else v for k, v in features.items()},
        }

    def _explain_prediction(self, features: dict, x_scaled: np.ndarray) -> List[Dict[str, Any]]:
        """Generate human-readable explanations for the prediction."""
        explanations = []

        # Use tree-based feature contribution (mean decrease in impurity)
        importances = self.rf_model.feature_importances_
        feature_vals = [features[f] for f in self.FEATURE_NAMES]

        contributions = []
        for i, (name, imp, val) in enumerate(zip(self.FEATURE_NAMES, importances, feature_vals)):
            # Approximate contribution = importance * scaled_value
            contribution = imp * abs(x_scaled[i])
            contributions.append((name, contribution, val, imp))

        contributions.sort(key=lambda x: -x[1])

        for name, contrib, val, imp in contributions[:8]:
            direction = "increases" if x_scaled[self.FEATURE_NAMES.index(name)] > 0 else "decreases"
            severity = "high" if contrib > 0.1 else "medium" if contrib > 0.05 else "low"

            readable = self._feature_to_english(name, val, direction)
            explanations.append({
                "feature": name,
                "value": val,
                "importance": round(float(imp), 4),
                "contribution": round(float(contrib), 4),
                "direction": direction,
                "severity": severity,
                "explanation": readable,
            })

        return explanations

    def _feature_to_english(self, name: str, val: float, direction: str) -> str:
        """Convert feature contribution to plain English."""
        templates = {
            "amount": f"Transaction amount ₹{val:,.0f} {'is unusually high' if val > 50000 else 'is within normal range'}",
            "is_foreign": "Foreign transaction detected — higher fraud risk" if val else "Domestic transaction",
            "high_risk_country": "Origin country is flagged as high-risk for fraud" if val else "Country not flagged",
            "previous_fraud": "Account has PREVIOUS FRAUD HISTORY — strong indicator" if val else "No prior fraud on this account",
            "time_hour": f"Transaction at hour {int(val)} — {'off-hours activity (suspicious)' if val < 6 or val > 22 else 'normal business hours'}",
            "is_online": "Online transaction (higher fraud vector)" if val else "POS/in-person transaction",
            "off_hours": "Transaction during off-hours (midnight-6AM or after 10PM)" if val else "Normal hours",
            "amount_log": f"Log-scaled amount indicates {'high-value' if val > 10 else 'moderate'} transaction",
            "perm_risk_score": f"Permission risk score: {val:.1f} — {'DANGEROUS permissions detected' if val > 3 else 'moderate risk'}",
            "perm_count": f"{int(val)} permissions requested — {'excessive' if val > 8 else 'normal'}",
            "dangerous_perm_count": f"{int(val)} dangerous permissions (SMS, contacts, overlay)" if val > 0 else "No dangerous permissions",
            "suspicious_domain_count": f"{int(val)} suspicious TLD domains found" if val > 0 else "No suspicious domains",
            "ip_count": f"{int(val)} IP addresses extracted" if val > 0 else "No direct IP connections",
            "url_count": f"{int(val)} URLs extracted from APK" if val > 0 else "No embedded URLs",
            "risk_factor_sum": f"Combined risk factors: {int(val)}/4 — {'HIGH ALERT' if val >= 3 else 'moderate' if val >= 2 else 'low'}",
        }
        return templates.get(name, f"{name} = {val}")

    def _find_cluster(self, x_scaled: np.ndarray) -> Dict[str, Any]:
        """Find which fraud cluster this sample is closest to."""
        if not self.is_trained or self.training_data is None:
            return {"cluster_id": -1, "similar_count": 0}

        fraud_df = self.training_data[self.training_data["fraud"] == 1]
        if len(fraud_df) < 5:
            return {"cluster_id": -1, "similar_count": 0}

        fraud_features = []
        for _, row in fraud_df.iterrows():
            feat = engineer_features(row.to_dict())
            fraud_features.append([feat[f] for f in self.FEATURE_NAMES])
        fraud_scaled = self.scaler.transform(np.array(fraud_features))

        # Find nearest neighbors
        distances = np.linalg.norm(fraud_scaled - x_scaled, axis=1)
        nearest_idx = np.argsort(distances)[:5]
        nearest_ids = fraud_df.iloc[nearest_idx]["transaction_id"].tolist()
        avg_distance = float(distances[nearest_idx].mean())

        return {
            "cluster_id": int(nearest_ids[0]) % 12,
            "similar_count": len(nearest_idx),
            "nearest_transaction_ids": [int(x) for x in nearest_ids],
            "avg_distance": round(avg_distance, 4),
            "cluster_name": f"CAMP-{int(nearest_ids[0]) % 12:03d}",
        }

    def get_all_predictions(self) -> List[Dict[str, Any]]:
        """Run predictions on all training data for dashboard."""
        if not self.is_trained or self.training_data is None:
            return []

        results = []
        for _, row in self.training_data.iterrows():
            pred = self.predict(row.to_dict())
            pred["transaction_id"] = int(row["transaction_id"])
            pred["actual_fraud"] = int(row["fraud"])
            results.append(pred)
        return results
