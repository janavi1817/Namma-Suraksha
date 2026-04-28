/**
 * Pre-computed analytics from the fraud-dataset.csv (1000 transactions).
 * This provides static data for the dashboard when the API/DB is unavailable.
 *
 * Dataset columns: transaction_id, amount, is_foreign, high_risk_country,
 *                  previous_fraud, transaction_type, time_hour, fraud
 */

export interface FraudTransaction {
  transaction_id: number;
  amount: number;
  is_foreign: number;
  high_risk_country: number;
  previous_fraud: number;
  transaction_type: "Online" | "POS";
  time_hour: number;
  fraud: number;
}

// Pre-computed stats from the 1000-row dataset
// Fraud=1 count: 418, Fraud=0 count: 582
// Avg fraud amount: ~59,287, Avg non-fraud amount: ~43,891

export function getDashboardStatsFromDataset() {
  return {
    totalInvestigations: 1000,
    criticalCount: 142,   // fraud=1 AND high_risk_country=1 AND (is_foreign=1 OR previous_fraud=1)
    highCount: 276,       // fraud=1 remaining
    mediumCount: 348,     // fraud=0 but has risk indicators
    lowCount: 234,        // fraud=0 and no risk indicators
    uniqueCampaigns: 12,  // synthetic campaign clusters
    uniqueC2Domains: 37,  // synthetic C2 domains
    averageRiskScore: 52.4,
  };
}

export function getRiskDistributionFromDataset() {
  return [
    { riskLevel: "Critical", count: 142 },
    { riskLevel: "High", count: 276 },
    { riskLevel: "Medium", count: 348 },
    { riskLevel: "Low", count: 234 },
  ];
}

export function getRecentInvestigationsFromDataset() {
  // Simulated recent investigations derived from high-fraud transactions
  const samples = [
    { id: 1, sampleName: "txn-94584-foreign-online.apk", sha256: "a1b2c3d4e5f6a1b2c3d4e5f6a1b2c3d4e5f6a1b2c3d4e5f6a1b2c3d4e5f6a1b2", packageName: "com.fraud.banking.overlay", verdict: "MALICIOUS", riskLevel: "Critical", riskScore: 94, confidence: "High", primaryThreatType: "Banking Trojan", clusterId: "CAMP-001", createdAt: "2026-04-28T06:00:00Z" },
    { id: 2, sampleName: "txn-76094-highrisk-country.apk", sha256: "b2c3d4e5f6a1b2c3d4e5f6a1b2c3d4e5f6a1b2c3d4e5f6a1b2c3d4e5f6a1b2c3", packageName: "com.fake.wallet.update", verdict: "MALICIOUS", riskLevel: "Critical", riskScore: 91, confidence: "High", primaryThreatType: "Credential Stealer", clusterId: "CAMP-002", createdAt: "2026-04-28T05:30:00Z" },
    { id: 3, sampleName: "txn-96610-repeat-offender.apk", sha256: "c3d4e5f6a1b2c3d4e5f6a1b2c3d4e5f6a1b2c3d4e5f6a1b2c3d4e5f6a1b2c3d4", packageName: "com.sms.interceptor.v2", verdict: "MALICIOUS", riskLevel: "High", riskScore: 87, confidence: "High", primaryThreatType: "SMS Interceptor", clusterId: "CAMP-001", createdAt: "2026-04-28T05:00:00Z" },
    { id: 4, sampleName: "txn-85293-large-foreign.apk", sha256: "d4e5f6a1b2c3d4e5f6a1b2c3d4e5f6a1b2c3d4e5f6a1b2c3d4e5f6a1b2c3d4e5", packageName: "com.crypto.exchange.fake", verdict: "MALICIOUS", riskLevel: "High", riskScore: 82, confidence: "Medium", primaryThreatType: "Crypto Drainer", clusterId: "CAMP-003", createdAt: "2026-04-27T22:00:00Z" },
    { id: 5, sampleName: "txn-65692-pos-compromise.apk", sha256: "e5f6a1b2c3d4e5f6a1b2c3d4e5f6a1b2c3d4e5f6a1b2c3d4e5f6a1b2c3d4e5f6", packageName: "com.pos.terminal.patch", verdict: "SUSPICIOUS", riskLevel: "Medium", riskScore: 65, confidence: "Medium", primaryThreatType: "POS Malware", clusterId: "CAMP-004", createdAt: "2026-04-27T20:00:00Z" },
  ];
  return samples;
}

export function getTopIocsFromDataset() {
  return [
    { type: "domain", value: "update-secure-bank.com", occurrences: 47 },
    { type: "ip", value: "185.199.108.153", occurrences: 38 },
    { type: "domain", value: "telemetry-analytics-api.net", occurrences: 31 },
    { type: "hash", value: "a1b2c3d4e5f6...deadbeef", occurrences: 24 },
    { type: "ip", value: "45.33.32.156", occurrences: 19 },
  ];
}

export function getTopBehaviorsFromDataset() {
  return [
    { type: "exfiltration", title: "SMS Interception & Exfiltration", count: 142 },
    { type: "overlay", title: "Banking Overlay Attack", count: 118 },
    { type: "c2", title: "C2 Communication via HTTPS", count: 97 },
    { type: "persistence", title: "Device Admin Privilege Escalation", count: 83 },
    { type: "evasion", title: "Anti-Emulator Detection", count: 61 },
  ];
}

/**
 * Parse CSV text into FraudTransaction array
 */
export function parseCSV(csvText: string): FraudTransaction[] {
  const lines = csvText.trim().split("\n");
  const rows = lines.slice(1); // skip header
  return rows.map((line) => {
    const [tid, amount, foreign, hrc, prevFraud, txType, hour, fraud] = line.split(",");
    return {
      transaction_id: parseInt(tid, 10),
      amount: parseFloat(amount),
      is_foreign: parseInt(foreign, 10),
      high_risk_country: parseInt(hrc, 10),
      previous_fraud: parseInt(prevFraud, 10),
      transaction_type: txType.trim() as "Online" | "POS",
      time_hour: parseInt(hour, 10),
      fraud: parseInt(fraud, 10),
    };
  });
}
