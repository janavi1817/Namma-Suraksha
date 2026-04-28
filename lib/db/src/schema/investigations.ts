import {
  pgTable,
  serial,
  text,
  integer,
  doublePrecision,
  timestamp,
  jsonb,
} from "drizzle-orm/pg-core";

export const investigationsTable = pgTable("investigations", {
  id: serial("id").primaryKey(),

  // Sample identity
  sampleName: text("sample_name").notNull(),
  sha256: text("sha256").notNull(),
  fuzzyHash: text("fuzzy_hash"),
  packageName: text("package_name"),
  versionName: text("version_name"),
  targetSdk: integer("target_sdk"),
  compileSdk: integer("compile_sdk"),

  // Permissions and code
  permissions: text("permissions").array().notNull().default([]),
  codeSnippets: text("code_snippets"),

  // Network indicators
  urls: text("urls").array().notNull().default([]),
  domains: text("domains").array().notNull().default([]),
  ipAddresses: text("ip_addresses").array().notNull().default([]),
  apiKeys: text("api_keys").array().notNull().default([]),
  phoneNumbers: text("phone_numbers").array().notNull().default([]),

  // Certificate intelligence
  certificateFingerprint: text("certificate_fingerprint"),
  certificateSubject: text("certificate_subject"),
  certificateIssuer: text("certificate_issuer"),
  certificateNotBefore: text("certificate_not_before"),
  certificateNotAfter: text("certificate_not_after"),

  // Threat intelligence scores
  virusTotalScore: integer("virus_total_score"),
  virusTotalTotal: integer("virus_total_total"),
  abuseIpdbScore: integer("abuse_ipdb_score"),
  urlScanScore: integer("url_scan_score"),

  // ML / graph signals
  clusterId: text("cluster_id"),
  anomalyScore: doublePrecision("anomaly_score"),
  gnnMaliciousProb: doublePrecision("gnn_malicious_prob"),
  pageRankScore: doublePrecision("page_rank_score"),

  // Computed verdict + scoring
  verdict: text("verdict").notNull(),
  riskLevel: text("risk_level").notNull(),
  riskScore: integer("risk_score").notNull(),
  confidence: text("confidence").notNull(),
  primaryThreatType: text("primary_threat_type").notNull(),

  // Full LLM analysis report (matches AnalysisReport schema)
  analysis: jsonb("analysis").notNull(),

  createdAt: timestamp("created_at", { withTimezone: true })
    .notNull()
    .defaultNow(),
});

export type Investigation = typeof investigationsTable.$inferSelect;
export type InsertInvestigation = typeof investigationsTable.$inferInsert;
