/**
 * Standalone fraud-dataset API server for RAKSHAK.
 * Generates realistic APK malware investigation data in-memory.
 * No PostgreSQL or OpenAI required.
 *
 * Run: node fraud-api.mjs
 */
import express from "express";
import cors from "cors";

const app = express();
app.use(cors());
app.use(express.json({ limit: "5mb" }));

// ─── Seed helpers ───────────────────────────────────────────────────────────

const THREAT_TYPES = [
  "Banking Trojan", "SMS Interceptor", "Credential Stealer",
  "Crypto Drainer", "POS Skimmer", "Spyware", "Ransomware", "Adware",
];
const CAMPAIGNS = [
  "CAMP-HYDRA", "CAMP-CERBERUS", "CAMP-ANUBIS", "CAMP-SHARKBOT",
  "CAMP-FLUBOT", "CAMP-TEABOT", "CAMP-VULTUR", "CAMP-GODFATHER",
  "CAMP-XENOMORPH", "CAMP-ERMAC", "CAMP-HOOK", "CAMP-NEXUS",
];
const PACKAGES = [
  "com.bank.secure.update", "com.crypto.wallet.pro", "com.sms.manager.plus",
  "com.system.security.patch", "com.flash.player.update", "com.vpn.free.turbo",
  "com.pdf.reader.premium", "com.battery.optimizer.pro", "com.cleaner.boost.max",
  "com.weather.live.radar", "com.qr.scanner.fast", "com.file.manager.explorer",
];
const VERDICTS = ["MALICIOUS", "SUSPICIOUS", "CLEAN"];
const RISK_LEVELS = ["Critical", "High", "Medium", "Low"];
const CONFIDENCE = ["High", "Medium", "Low"];
const PERMISSIONS = [
  "android.permission.INTERNET", "android.permission.READ_SMS",
  "android.permission.RECEIVE_SMS", "android.permission.READ_CONTACTS",
  "android.permission.SYSTEM_ALERT_WINDOW", "android.permission.CAMERA",
  "android.permission.RECORD_AUDIO", "android.permission.ACCESS_FINE_LOCATION",
  "android.permission.SEND_SMS", "android.permission.READ_PHONE_STATE",
  "android.permission.WRITE_EXTERNAL_STORAGE", "android.permission.BIND_ACCESSIBILITY_SERVICE",
];
const C2_DOMAINS = [
  "update-secure-bank.com", "telemetry-analytics-api.net", "cdn-payload-delivery.xyz",
  "api-gateway-service.top", "mobile-config-sync.ru", "app-telemetry-data.cn",
  "secure-banking-api.tk", "cloud-sync-service.cc",
];
const C2_IPS = [
  "185.199.108.153", "45.33.32.156", "91.215.85.17", "194.26.135.89",
  "103.224.182.250", "5.188.86.114", "77.91.68.52", "162.55.47.12",
];

function seededRandom(seed) {
  let s = seed;
  return () => { s = (s * 1103515245 + 12345) & 0x7fffffff; return s / 0x7fffffff; };
}

function sha256From(id) {
  const hex = "0123456789abcdef";
  let h = ""; let s = id * 2654435761;
  for (let i = 0; i < 64; i++) { s = (s * 48271 + 12345) & 0x7fffffff; h += hex[s % 16]; }
  return h;
}

function pick(arr, rng) { return arr[Math.floor(rng() * arr.length)]; }
function pickN(arr, n, rng) {
  const shuffled = [...arr].sort(() => rng() - 0.5);
  return shuffled.slice(0, Math.min(n, arr.length));
}

// ─── Generate 200 realistic investigations ──────────────────────────────────

const investigations = [];

for (let id = 1; id <= 200; id++) {
  const rng = seededRandom(id * 7919);
  const isMalicious = rng() < 0.42; // ~42% fraud rate
  const isSuspicious = !isMalicious && rng() < 0.2;

  const riskScore = isMalicious
    ? Math.round(60 + rng() * 40)   // 60-100
    : isSuspicious
      ? Math.round(30 + rng() * 35) // 30-65
      : Math.round(rng() * 30);     // 0-30

  const riskLevel = riskScore >= 75 ? "Critical" : riskScore >= 55 ? "High" : riskScore >= 30 ? "Medium" : "Low";
  const verdict = isMalicious ? "MALICIOUS" : isSuspicious ? "SUSPICIOUS" : "CLEAN";
  const confidence = riskScore >= 70 ? "High" : riskScore >= 40 ? "Medium" : "Low";
  const threatType = isMalicious ? pick(THREAT_TYPES.slice(0, 5), rng) : pick(THREAT_TYPES, rng);
  const campId = isMalicious ? pick(CAMPAIGNS, rng) : null;
  const pkg = pick(PACKAGES, rng);
  const perms = pickN(PERMISSIONS, Math.floor(3 + rng() * 8), rng);
  const domains = isMalicious ? pickN(C2_DOMAINS, Math.floor(1 + rng() * 3), rng) : [];
  const ips = isMalicious ? pickN(C2_IPS, Math.floor(1 + rng() * 2), rng) : [];

  const daysAgo = Math.floor(rng() * 90);
  const createdAt = new Date(Date.now() - daysAgo * 86400000).toISOString();

  const iocs = [];
  for (const d of domains) iocs.push({ type: "domain", value: d, context: "C2 communication endpoint" });
  for (const ip of ips) iocs.push({ type: "ip", value: ip, context: "C2 server address" });
  if (isMalicious) iocs.push({ type: "hash", value: sha256From(id + 5000), context: "Embedded payload hash" });

  const behaviors = [];
  if (isMalicious) {
    if (perms.includes("android.permission.READ_SMS"))
      behaviors.push({ type: "exfiltration", title: "SMS Interception & Exfiltration", description: "App intercepts incoming SMS and forwards OTP codes to C2 server", evidence: ["BroadcastReceiver for SMS_RECEIVED", "HTTP POST with SMS body"], confidence: Math.min(riskScore + 5, 100) });
    if (perms.includes("android.permission.SYSTEM_ALERT_WINDOW"))
      behaviors.push({ type: "overlay", title: "Banking Overlay Attack", description: "Draws fake login screens over legitimate banking apps", evidence: ["SYSTEM_ALERT_WINDOW usage", "Accessibility service abuse"], confidence: riskScore });
    if (domains.length > 0)
      behaviors.push({ type: "c2", title: "C2 Communication via HTTPS", description: "Establishes encrypted channel to command and control infrastructure", evidence: domains.map(d => `Connection to ${d}`), confidence: Math.min(riskScore + 10, 100) });
    if (perms.includes("android.permission.BIND_ACCESSIBILITY_SERVICE"))
      behaviors.push({ type: "persistence", title: "Accessibility Service Abuse", description: "Uses accessibility service for keylogging and auto-granting permissions", evidence: ["AccessibilityService declaration", "performGlobalAction calls"], confidence: riskScore });
    behaviors.push({ type: "evasion", title: "Anti-Analysis Techniques", description: "Detects emulators and debugging environments", evidence: ["Build.FINGERPRINT checks", "TracerPid monitoring"], confidence: Math.max(riskScore - 10, 20) });
  }

  const mitreTactics = isMalicious ? [
    { id: "T1444", name: "Masquerade as Legitimate App", description: "Disguises as a legitimate application to trick users" },
    { id: "T1417", name: "Input Capture", description: "Captures user input through overlay or keylogging" },
    ...(domains.length ? [{ id: "T1071", name: "Application Layer Protocol", description: "Uses HTTPS for C2 communication" }] : []),
  ] : [];

  investigations.push({
    id,
    sampleName: `${pkg.split(".").pop()}-v${Math.floor(1 + rng() * 5)}.${Math.floor(rng() * 10)}.apk`,
    sha256: sha256From(id),
    packageName: `${pkg}.v${id}`,
    verdict, riskLevel, riskScore, confidence, primaryThreatType: threatType,
    clusterId: campId, createdAt,
    fuzzyHash: null, versionName: `${Math.floor(1 + rng() * 5)}.${Math.floor(rng() * 10)}.0`,
    targetSdk: 33, compileSdk: 33,
    permissions: perms, codeSnippets: null,
    urls: domains.map(d => `https://${d}/api/v1/payload`),
    domains, ipAddresses: ips, apiKeys: [], phoneNumbers: [],
    certificateFingerprint: null, certificateSubject: null, certificateIssuer: null,
    certificateNotBefore: null, certificateNotAfter: null,
    virusTotalScore: isMalicious ? Math.floor(20 + rng() * 50) : Math.floor(rng() * 5),
    virusTotalTotal: 72, abuseIpdbScore: null, urlScanScore: null,
    anomalyScore: null, gnnMaliciousProb: null, pageRankScore: null,
    analysis: {
      executiveSummary: `${verdict} APK sample "${pkg}" — Risk ${riskScore}/100 (${riskLevel}). ${isMalicious ? `Identified as ${threatType} with ${domains.length} C2 endpoints.` : "No significant malicious indicators detected."}`,
      plainEnglishBrief: isMalicious
        ? `This APK masquerades as "${pkg.split(".").pop()}" but contains ${threatType.toLowerCase()} functionality. It ${behaviors.map(b => b.title.toLowerCase()).join(", ")}. ${domains.length} command-and-control domains were identified. Immediate containment recommended.`
        : `This APK appears to be ${isSuspicious ? "potentially unwanted software with some risky behaviors" : "a legitimate application with no malicious indicators"}.`,
      reasoningChain: [
        { step: "Static Analysis", observation: `Manifest declares ${perms.length} permissions, ${perms.length > 6 ? "several are high-risk" : "within normal range"}.` },
        { step: "Permission Audit", observation: `${perms.filter(p => p.includes("SMS") || p.includes("ACCESSIBILITY")).length} dangerous permissions detected.` },
        { step: "Network Analysis", observation: `${domains.length} suspicious domains and ${ips.length} C2 IPs extracted from strings.` },
        { step: "Behavioral Classification", observation: `${behaviors.length} malicious behaviors identified. Final verdict: ${verdict}.` },
      ],
      behaviors,
      mitreTactics,
      permissionAbuse: perms.filter(p => p.includes("SMS") || p.includes("ALERT") || p.includes("ACCESSIBILITY") || p.includes("CAMERA")).map(p => ({
        permission: p,
        riskLevel: p.includes("SMS") || p.includes("ACCESSIBILITY") ? "Critical" : "High",
        explanation: `${p.split(".").pop()} is commonly abused by ${threatType.toLowerCase()} malware.`,
      })),
      codeFindings: isMalicious ? [
        { title: "Obfuscated String Decryption", snippet: `String s = new String(Base64.decode(enc, 0));\nURL url = new URL(s);`, meaning: "Dynamically decrypts C2 URLs at runtime to evade static analysis", severity: "Critical" },
        { title: "Reflection-based API Call", snippet: `Method m = cls.getDeclaredMethod("send", String.class);\nm.setAccessible(true);\nm.invoke(obj, data);`, meaning: "Uses reflection to hide sensitive API calls from static analyzers", severity: "High" },
      ] : [],
      networkInfrastructure: {
        summary: isMalicious ? `${domains.length} C2 domains and ${ips.length} IPs identified. Infrastructure shows signs of fast-flux DNS and bulletproof hosting.` : "No suspicious network infrastructure detected.",
        c2Domains: domains, c2Ips: ips,
        infrastructurePatterns: isMalicious ? ["Fast-flux DNS rotation", "Bulletproof hosting provider", "DGA-like domain generation"] : [],
      },
      campaign: {
        clusterId: campId, clusterName: campId || "N/A", isNewCampaign: rng() < 0.15,
        rationale: campId ? `Matched by shared C2 infrastructure and code similarity with ${Math.floor(2 + rng() * 8)} other samples.` : "N/A",
        relatedSampleCount: campId ? Math.floor(3 + rng() * 20) : 0,
        attackVector: isMalicious ? "Phishing / Third-party app store" : "N/A",
        sharedIndicators: campId ? [...domains.slice(0, 2), ...ips.slice(0, 1)] : [],
      },
      rootOffender: {
        actorName: campId ? campId.replace("CAMP-", "APT-") : "Unknown",
        actorType: isMalicious ? "Organized Cybercrime Group" : "Unknown",
        confidence,
        evidence: isMalicious ? ["Code reuse patterns", "Shared C2 infrastructure", "Certificate overlap"] : [],
        historicalAssociations: campId ? [campId] : [],
      },
      riskMatrix: {
        severity: riskLevel, impact: Math.min(Math.round(riskScore / 10), 10),
        likelihood: riskScore > 50 ? 8 : 4, composite: riskScore,
        cvssVector: isMalicious ? "CVSS:3.1/AV:N/AC:L/PR:N/UI:R/S:U/C:H/I:H/A:N" : null,
        methodology: "Weighted multi-factor scoring: permissions, network indicators, code analysis, threat intelligence correlation",
      },
      prediction: {
        predictedEvolution: isMalicious ? "High probability of variant release within 30 days based on campaign velocity" : "Low risk of evolution",
        variantLikelihood: isMalicious ? "High" : "Low",
        infrastructureReuse: isMalicious ? "Likely" : "Unlikely",
        targetRegions: isMalicious ? ["South Asia", "Southeast Asia", "Europe"] : ["Global"],
        targetIndustries: ["Financial Services", "Cryptocurrency"],
        proactiveDefenses: ["Block identified C2 domains at DNS level", "Deploy YARA rules to endpoint agents", "Enable SMS-based 2FA alternatives", "Monitor for accessibility service abuse"],
      },
      iocs,
      detectionRules: {
        yara: `rule ${pkg.split(".").pop()}_${id} {\n  meta:\n    description = "${threatType} detection"\n    severity = "${riskLevel}"\n  strings:\n    $s1 = "${domains[0] || "suspicious.domain"}"\n  condition:\n    $s1\n}`,
        suricata: `alert tls any any -> any any (msg:"${threatType} C2 - ${pkg}"; tls.sni; content:"${domains[0] || "suspicious.domain"}"; sid:${1000000 + id}; rev:1;)`,
      },
    },
  });
}

let nextId = 201;
console.log(`Generated ${investigations.length} investigations (${investigations.filter(i => i.verdict === "MALICIOUS").length} malicious, ${investigations.filter(i => i.verdict === "SUSPICIOUS").length} suspicious, ${investigations.filter(i => i.verdict === "CLEAN").length} clean)`);

// ─── Routes ─────────────────────────────────────────────────────────────────

app.get("/api/healthz", (_req, res) => res.json({ status: "ok" }));

app.get("/api/dashboard/stats", (_req, res) => {
  const counts = { Critical: 0, High: 0, Medium: 0, Low: 0 };
  for (const i of investigations) counts[i.riskLevel] = (counts[i.riskLevel] || 0) + 1;
  const campaigns = new Set(investigations.filter(i => i.clusterId).map(i => i.clusterId));
  const c2 = new Set(); investigations.forEach(i => i.analysis.networkInfrastructure.c2Domains.forEach(d => c2.add(d)));
  const avg = investigations.reduce((a, b) => a + b.riskScore, 0) / investigations.length;
  res.json({ totalInvestigations: investigations.length, criticalCount: counts.Critical, highCount: counts.High, mediumCount: counts.Medium, lowCount: counts.Low, uniqueCampaigns: campaigns.size, uniqueC2Domains: c2.size, averageRiskScore: Math.round(avg * 10) / 10 });
});

app.get("/api/dashboard/recent", (_req, res) => {
  const sorted = [...investigations].sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
  res.json(sorted.slice(0, 8).map(s => ({ id: s.id, sampleName: s.sampleName, sha256: s.sha256, packageName: s.packageName, verdict: s.verdict, riskLevel: s.riskLevel, riskScore: s.riskScore, confidence: s.confidence, primaryThreatType: s.primaryThreatType, clusterId: s.clusterId, createdAt: s.createdAt })));
});

app.get("/api/dashboard/risk-distribution", (_req, res) => {
  const c = { Critical: 0, High: 0, Medium: 0, Low: 0 };
  investigations.forEach(i => c[i.riskLevel] = (c[i.riskLevel] || 0) + 1);
  res.json(["Critical", "High", "Medium", "Low"].map(k => ({ riskLevel: k, count: c[k] || 0 })));
});

app.get("/api/dashboard/top-iocs", (_req, res) => {
  const m = new Map();
  investigations.forEach(i => i.analysis.iocs.forEach(ioc => {
    const k = `${ioc.type}::${ioc.value}`; const e = m.get(k);
    if (e) e.count++; else m.set(k, { type: ioc.type, value: ioc.value, count: 1 });
  }));
  res.json([...m.values()].sort((a, b) => b.count - a.count).slice(0, 10).map(e => ({ type: e.type, value: e.value, occurrences: e.count })));
});

app.get("/api/dashboard/behaviors", (_req, res) => {
  const m = new Map();
  investigations.forEach(i => i.analysis.behaviors.forEach(b => {
    const e = m.get(b.type); if (e) e.count++; else m.set(b.type, { type: b.type, title: b.title, count: 1 });
  }));
  res.json([...m.values()].sort((a, b) => b.count - a.count).slice(0, 8));
});

app.get("/api/investigations", (req, res) => {
  let r = [...investigations];
  const { search, riskLevel } = req.query;
  if (search) { const s = search.toLowerCase(); r = r.filter(i => i.sampleName.toLowerCase().includes(s) || i.sha256.includes(s) || (i.packageName || "").toLowerCase().includes(s)); }
  if (riskLevel && riskLevel !== "all") r = r.filter(i => i.riskLevel === riskLevel);
  r.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
  res.json(r.map(s => ({ id: s.id, sampleName: s.sampleName, sha256: s.sha256, packageName: s.packageName, verdict: s.verdict, riskLevel: s.riskLevel, riskScore: s.riskScore, confidence: s.confidence, primaryThreatType: s.primaryThreatType, clusterId: s.clusterId, createdAt: s.createdAt })));
});

app.get("/api/investigations/:id", (req, res) => {
  const inv = investigations.find(i => i.id === parseInt(req.params.id, 10));
  if (!inv) return res.status(404).json({ error: "Investigation not found" });
  res.json(inv);
});

app.delete("/api/investigations/:id", (req, res) => {
  const idx = investigations.findIndex(i => i.id === parseInt(req.params.id, 10));
  if (idx === -1) return res.status(404).json({ error: "Investigation not found" });
  investigations.splice(idx, 1); res.sendStatus(204);
});

app.get("/api/investigations/:id/iocs", (req, res) => {
  const inv = investigations.find(i => i.id === parseInt(req.params.id, 10));
  if (!inv) return res.status(404).json({ error: "Investigation not found" });
  res.json(inv.analysis.iocs);
});

app.post("/api/investigations", (req, res) => {
  const b = req.body;
  if (!b.sampleName || !b.sha256) return res.status(400).json({ error: "sampleName and sha256 required" });
  const rng = seededRandom(nextId * 31337);
  const riskScore = Math.round(50 + rng() * 50);
  const riskLevel = riskScore >= 75 ? "Critical" : riskScore >= 55 ? "High" : "Medium";
  const threatType = pick(THREAT_TYPES.slice(0, 5), rng);
  const campId = pick(CAMPAIGNS, rng);
  const domains = pickN(C2_DOMAINS, 2, rng);
  const inv = {
    id: nextId++, sampleName: b.sampleName, sha256: b.sha256,
    packageName: b.packageName || `com.analyzed.sample.${nextId}`,
    verdict: "MALICIOUS", riskLevel, riskScore, confidence: "High",
    primaryThreatType: threatType, clusterId: campId,
    createdAt: new Date().toISOString(),
    fuzzyHash: b.fuzzyHash || null, versionName: b.versionName || "1.0.0",
    targetSdk: b.targetSdk || 33, compileSdk: b.compileSdk || 33,
    permissions: b.permissions || [], codeSnippets: b.codeSnippets || null,
    urls: b.urls || [], domains: b.domains || domains,
    ipAddresses: b.ipAddresses || [], apiKeys: b.apiKeys || [],
    phoneNumbers: b.phoneNumbers || [],
    certificateFingerprint: null, certificateSubject: null, certificateIssuer: null,
    certificateNotBefore: null, certificateNotAfter: null,
    virusTotalScore: b.virusTotalScore || null, virusTotalTotal: b.virusTotalTotal || null,
    abuseIpdbScore: null, urlScanScore: null, anomalyScore: null,
    gnnMaliciousProb: null, pageRankScore: null,
    analysis: {
      executiveSummary: `MALICIOUS APK "${b.sampleName}" — Risk ${riskScore}/100 (${riskLevel}). Identified as ${threatType}.`,
      plainEnglishBrief: `This APK has been classified as malicious ${threatType.toLowerCase()} malware. Immediate containment recommended.`,
      reasoningChain: [
        { step: "Static Analysis", observation: "Suspicious permissions and obfuscated code detected." },
        { step: "Network Analysis", observation: `${domains.length} C2 domains identified.` },
        { step: "Behavioral Analysis", observation: `Classified as ${threatType}.` },
        { step: "Verdict", observation: `MALICIOUS with ${riskLevel} risk (${riskScore}/100).` },
      ],
      behaviors: [
        { type: "c2", title: "C2 Communication", description: "Connects to remote C2 infrastructure", evidence: domains.map(d => `Connection to ${d}`), confidence: riskScore },
        { type: "exfiltration", title: "Data Exfiltration", description: "Exfiltrates sensitive data", evidence: ["Outbound data transfer detected"], confidence: riskScore },
      ],
      mitreTactics: [{ id: "T1071", name: "Application Layer Protocol", description: "Uses HTTPS for C2" }],
      permissionAbuse: [], codeFindings: [],
      networkInfrastructure: { summary: "Suspicious C2 infrastructure detected", c2Domains: domains, c2Ips: pickN(C2_IPS, 1, rng), infrastructurePatterns: ["Fast-flux DNS"] },
      campaign: { clusterId: campId, clusterName: campId, isNewCampaign: false, rationale: "Matched by C2 infrastructure", relatedSampleCount: 5, attackVector: "Phishing", sharedIndicators: domains },
      rootOffender: { actorName: campId.replace("CAMP-", "APT-"), actorType: "Organized Cybercrime", confidence: "High", evidence: ["C2 overlap"], historicalAssociations: [campId] },
      riskMatrix: { severity: riskLevel, impact: 8, likelihood: 8, composite: riskScore, cvssVector: null, methodology: "Multi-factor scoring" },
      prediction: { predictedEvolution: "High variant likelihood", variantLikelihood: "High", infrastructureReuse: "Likely", targetRegions: ["South Asia"], targetIndustries: ["Financial Services"], proactiveDefenses: ["Block C2 domains", "Deploy YARA rules"] },
      iocs: domains.map(d => ({ type: "domain", value: d, context: "C2 endpoint" })),
      detectionRules: { yara: `rule sample_${nextId} { condition: true }`, suricata: `alert tls any any -> any any (sid:${1000000 + nextId};)` },
    },
  };
  investigations.unshift(inv);
  res.status(201).json(inv);
});

app.get("/api/campaigns", (_req, res) => {
  const g = new Map();
  for (const i of investigations) {
    if (!i.clusterId) continue;
    const e = g.get(i.clusterId);
    const d = new Date(i.createdAt);
    if (e) { e.n++; e.rl.push(i.riskLevel); e.rs.push(i.riskScore); if (d < e.f) e.f = d; if (d > e.l) e.l = d; e.tt.add(i.primaryThreatType); }
    else g.set(i.clusterId, { n: 1, rl: [i.riskLevel], rs: [i.riskScore], f: d, l: d, tt: new Set([i.primaryThreatType]) });
  }
  const RK = { Critical: 4, High: 3, Medium: 2, Low: 1 };
  const hi = ls => ls.reduce((b, l) => (RK[l] || 0) > (RK[b] || 0) ? l : b, "Low");
  res.json([...g.entries()].map(([cid, v]) => ({
    clusterId: cid, clusterName: [...v.tt][0] || cid, sampleCount: v.n,
    topRiskLevel: hi(v.rl), averageRiskScore: Math.round(v.rs.reduce((a, b) => a + b, 0) / v.rs.length),
    firstSeen: v.f.toISOString(), lastSeen: v.l.toISOString(),
  })).sort((a, b) => b.sampleCount - a.sampleCount));
});

app.get("/api/campaigns/:clusterId", (req, res) => {
  const members = investigations.filter(i => i.clusterId === req.params.clusterId);
  if (!members.length) return res.status(404).json({ error: "Campaign not found" });
  const RK = { Critical: 4, High: 3, Medium: 2, Low: 1 };
  const hi = ls => ls.reduce((b, l) => (RK[l] || 0) > (RK[b] || 0) ? l : b, "Low");
  const rs = members.map(m => m.riskScore); const ds = members.map(m => new Date(m.createdAt));
  res.json({
    clusterId: req.params.clusterId, clusterName: members[0].primaryThreatType,
    sampleCount: members.length, topRiskLevel: hi(members.map(m => m.riskLevel)),
    averageRiskScore: Math.round(rs.reduce((a, b) => a + b, 0) / rs.length),
    firstSeen: new Date(Math.min(...ds)).toISOString(), lastSeen: new Date(Math.max(...ds)).toISOString(),
    members: members.map(m => ({ id: m.id, sampleName: m.sampleName, sha256: m.sha256, packageName: m.packageName, verdict: m.verdict, riskLevel: m.riskLevel, riskScore: m.riskScore, confidence: m.confidence, primaryThreatType: m.primaryThreatType, clusterId: m.clusterId, createdAt: m.createdAt })),
  });
});

// ── ML Engine Proxy (forwards to Python ML server on port 8090) ──

const ML_URL = process.env.ML_URL || "http://localhost:8090";

async function mlFetch(path) {
  try {
    const resp = await fetch(`${ML_URL}${path}`);
    if (!resp.ok) return null;
    return await resp.json();
  } catch { return null; }
}

async function mlPost(path, body) {
  try {
    const resp = await fetch(`${ML_URL}${path}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });
    if (!resp.ok) return null;
    return await resp.json();
  } catch { return null; }
}

app.get("/api/ml/health", async (_req, res) => {
  const data = await mlFetch("/ml/health");
  res.json(data || { status: "ml_server_offline", model_trained: false });
});

app.get("/api/ml/metrics", async (_req, res) => {
  const data = await mlFetch("/ml/metrics");
  if (!data) return res.status(503).json({ error: "ML server offline" });
  res.json(data);
});

app.get("/api/ml/feature-importance", async (_req, res) => {
  const data = await mlFetch("/ml/feature-importance");
  if (!data) return res.status(503).json({ error: "ML server offline" });
  res.json(data);
});

app.get("/api/ml/clusters", async (_req, res) => {
  const data = await mlFetch("/ml/clusters");
  if (!data) return res.status(503).json({ error: "ML server offline" });
  res.json(data);
});

app.get("/api/ml/explainability", async (_req, res) => {
  const data = await mlFetch("/ml/explainability");
  if (!data) return res.status(503).json({ error: "ML server offline" });
  res.json(data);
});

app.post("/api/ml/predict", async (req, res) => {
  const data = await mlPost("/ml/predict", req.body);
  if (!data) return res.status(503).json({ error: "ML server offline" });
  res.json(data);
});

const PORT = process.env.PORT || 8080;
app.listen(PORT, () => console.log(`\n  RAKSHAK Fraud API running → http://localhost:${PORT}/api/healthz\n  ML proxy → ${ML_URL}/ml/health\n`));
