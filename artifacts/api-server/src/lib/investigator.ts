import { openai } from "./openaiClient";
import { logger } from "./logger";

export interface InvestigatorInput {
  sampleName: string;
  sha256: string;
  fuzzyHash?: string | null;
  packageName?: string | null;
  versionName?: string | null;
  targetSdk?: number | null;
  compileSdk?: number | null;
  permissions: string[];
  codeSnippets?: string | null;
  urls: string[];
  domains: string[];
  ipAddresses: string[];
  apiKeys: string[];
  phoneNumbers: string[];
  certificateFingerprint?: string | null;
  certificateSubject?: string | null;
  certificateIssuer?: string | null;
  certificateNotBefore?: string | null;
  certificateNotAfter?: string | null;
  virusTotalScore?: number | null;
  virusTotalTotal?: number | null;
  abuseIpdbScore?: number | null;
  urlScanScore?: number | null;
  clusterId?: string | null;
  anomalyScore?: number | null;
  gnnMaliciousProb?: number | null;
  pageRankScore?: number | null;
}

export interface InvestigatorOutput {
  verdict: string;
  riskLevel: "Low" | "Medium" | "High" | "Critical";
  riskScore: number;
  confidence: "Low" | "Medium" | "High";
  primaryThreatType: string;
  analysis: AnalysisReport;
}

export interface AnalysisReport {
  executiveSummary: string;
  plainEnglishBrief: string;
  behaviors: Array<{
    type: string;
    title: string;
    description: string;
    evidence: string[];
    confidence: number;
  }>;
  codeFindings: Array<{
    title: string;
    snippet: string;
    meaning: string;
    severity: string;
  }>;
  permissionAbuse: Array<{
    permission: string;
    riskLevel: string;
    explanation: string;
  }>;
  networkInfrastructure: {
    summary: string;
    c2Domains: string[];
    c2Ips: string[];
    endpoints: string[];
    infrastructurePatterns: string[];
  };
  campaign: {
    clusterId: string;
    clusterName: string;
    rationale: string;
    relatedSampleCount: number;
    sharedIndicators: string[];
    attackVector: string;
    isNewCampaign: boolean;
  };
  rootOffender: {
    actorName: string;
    actorType: string;
    isRootOffender: boolean;
    confidence: string;
    evidence: string[];
    historicalAssociations: string[];
  };
  riskMatrix: {
    severity: string;
    impact: number;
    likelihood: number;
    composite: number;
    methodology: string;
    cvssVector: string | null;
  };
  prediction: {
    variantLikelihood: string;
    infrastructureReuse: string;
    targetRegions: string[];
    targetIndustries: string[];
    predictedEvolution: string;
    proactiveDefenses: string[];
  };
  mitreTactics: Array<{ id: string; name: string; description: string }>;
  iocs: Array<{ type: string; value: string; context: string }>;
  detectionRules: {
    yara: string;
    suricata: string;
    siemQuery: string;
    edrRule: string;
    blocklistDomains: string[];
    blocklistIps: string[];
    remediationSteps: string[];
  };
  reasoningChain: Array<{ step: string; observation: string }>;
}

const SYSTEM_PROMPT = `You are an Autonomous Mobile Malware Intelligence Analyst AI working inside an APK fraud investigation platform. Your job is to analyze forensic data extracted from Android APK files and produce a complete threat investigation.

You think like a senior cyber threat investigator, not just a classifier. Your analysis goes beyond surface-level indicators to uncover hidden relationships, understand attacker TTPs (Tactics, Techniques and Procedures mapped to MITRE ATT&CK for Mobile), and provide actionable intelligence.

METHODOLOGICAL REQUIREMENTS:
1. Evidence-based reasoning. Every conclusion must be supported by specific artifacts from the input. Never speculate without evidence.
2. Multi-source correlation across code, network, certificate, and threat intel signals.
3. Calibrated confidence (Low/Medium/High) for each major conclusion.
4. Consider and rule out benign explanations.
5. Place findings in the broader threat landscape (commodity vs. targeted, sophistication level).
6. Use graph signals (cluster id, PageRank, GNN probability, anomaly score) to inform attribution.

CONSTRAINTS:
- Do not fabricate data not provided. If something is missing, infer cautiously and label it as such.
- Do not inflate severity for drama.
- The plainEnglishBrief MUST be genuinely accessible to non-technical readers.
- Cite specific artifact values when referencing data (e.g. "certificate fingerprint <value>", "domain <value>").
- The behaviors array must reflect real malicious behaviour types (credential harvesting, SMS fraud, banking trojan, spyware, botnet, phishing/overlay attack, data exfiltration, ransomware, root escalation, accessibility abuse, device admin abuse, crypto mining, premium dialer, etc.)
- riskScore is 0-100; pick a riskLevel band: Low (0-39), Medium (40-69), High (70-89), Critical (90-100).
- Composite riskScore should weight: VirusTotal detection ratio, GNN probability, anomaly score, behaviour confidences, campaign size, threat-intel reputation.
- For YARA, Suricata, SIEM, EDR rules, produce real, syntactically valid, single-rule strings (multi-line OK).
- Generate at least 3 behaviors, 2-4 codeFindings, 3-6 permissionAbuse entries, 4-8 IOCs, 3-6 mitreTactics, and 4-6 reasoningChain steps. If input is sparse, derive what you can from available signals.

Always respond with a single JSON object that conforms exactly to the JSON schema provided in the response_format. Never include prose outside the JSON.`;

const RESPONSE_SCHEMA = {
  name: "ApkInvestigationReport",
  strict: true,
  schema: {
    type: "object",
    additionalProperties: false,
    properties: {
      verdict: {
        type: "string",
        enum: ["malicious", "suspicious", "benign"],
      },
      riskLevel: {
        type: "string",
        enum: ["Low", "Medium", "High", "Critical"],
      },
      riskScore: { type: "integer", minimum: 0, maximum: 100 },
      confidence: { type: "string", enum: ["Low", "Medium", "High"] },
      primaryThreatType: { type: "string" },
      analysis: {
        type: "object",
        additionalProperties: false,
        properties: {
          executiveSummary: { type: "string" },
          plainEnglishBrief: { type: "string" },
          behaviors: {
            type: "array",
            items: {
              type: "object",
              additionalProperties: false,
              properties: {
                type: { type: "string" },
                title: { type: "string" },
                description: { type: "string" },
                evidence: { type: "array", items: { type: "string" } },
                confidence: { type: "integer", minimum: 0, maximum: 100 },
              },
              required: [
                "type",
                "title",
                "description",
                "evidence",
                "confidence",
              ],
            },
          },
          codeFindings: {
            type: "array",
            items: {
              type: "object",
              additionalProperties: false,
              properties: {
                title: { type: "string" },
                snippet: { type: "string" },
                meaning: { type: "string" },
                severity: {
                  type: "string",
                  enum: ["Info", "Low", "Medium", "High", "Critical"],
                },
              },
              required: ["title", "snippet", "meaning", "severity"],
            },
          },
          permissionAbuse: {
            type: "array",
            items: {
              type: "object",
              additionalProperties: false,
              properties: {
                permission: { type: "string" },
                riskLevel: {
                  type: "string",
                  enum: ["Low", "Medium", "High", "Critical"],
                },
                explanation: { type: "string" },
              },
              required: ["permission", "riskLevel", "explanation"],
            },
          },
          networkInfrastructure: {
            type: "object",
            additionalProperties: false,
            properties: {
              summary: { type: "string" },
              c2Domains: { type: "array", items: { type: "string" } },
              c2Ips: { type: "array", items: { type: "string" } },
              endpoints: { type: "array", items: { type: "string" } },
              infrastructurePatterns: {
                type: "array",
                items: { type: "string" },
              },
            },
            required: [
              "summary",
              "c2Domains",
              "c2Ips",
              "endpoints",
              "infrastructurePatterns",
            ],
          },
          campaign: {
            type: "object",
            additionalProperties: false,
            properties: {
              clusterId: { type: "string" },
              clusterName: { type: "string" },
              rationale: { type: "string" },
              relatedSampleCount: { type: "integer", minimum: 0 },
              sharedIndicators: { type: "array", items: { type: "string" } },
              attackVector: { type: "string" },
              isNewCampaign: { type: "boolean" },
            },
            required: [
              "clusterId",
              "clusterName",
              "rationale",
              "relatedSampleCount",
              "sharedIndicators",
              "attackVector",
              "isNewCampaign",
            ],
          },
          rootOffender: {
            type: "object",
            additionalProperties: false,
            properties: {
              actorName: { type: "string" },
              actorType: { type: "string" },
              isRootOffender: { type: "boolean" },
              confidence: { type: "string", enum: ["Low", "Medium", "High"] },
              evidence: { type: "array", items: { type: "string" } },
              historicalAssociations: {
                type: "array",
                items: { type: "string" },
              },
            },
            required: [
              "actorName",
              "actorType",
              "isRootOffender",
              "confidence",
              "evidence",
              "historicalAssociations",
            ],
          },
          riskMatrix: {
            type: "object",
            additionalProperties: false,
            properties: {
              severity: {
                type: "string",
                enum: ["Low", "Medium", "High", "Critical"],
              },
              impact: { type: "integer", minimum: 0, maximum: 100 },
              likelihood: { type: "integer", minimum: 0, maximum: 100 },
              composite: { type: "integer", minimum: 0, maximum: 100 },
              methodology: { type: "string" },
              cvssVector: { type: ["string", "null"] },
            },
            required: [
              "severity",
              "impact",
              "likelihood",
              "composite",
              "methodology",
              "cvssVector",
            ],
          },
          prediction: {
            type: "object",
            additionalProperties: false,
            properties: {
              variantLikelihood: {
                type: "string",
                enum: ["Low", "Medium", "High"],
              },
              infrastructureReuse: {
                type: "string",
                enum: ["Low", "Medium", "High"],
              },
              targetRegions: { type: "array", items: { type: "string" } },
              targetIndustries: { type: "array", items: { type: "string" } },
              predictedEvolution: { type: "string" },
              proactiveDefenses: { type: "array", items: { type: "string" } },
            },
            required: [
              "variantLikelihood",
              "infrastructureReuse",
              "targetRegions",
              "targetIndustries",
              "predictedEvolution",
              "proactiveDefenses",
            ],
          },
          mitreTactics: {
            type: "array",
            items: {
              type: "object",
              additionalProperties: false,
              properties: {
                id: { type: "string" },
                name: { type: "string" },
                description: { type: "string" },
              },
              required: ["id", "name", "description"],
            },
          },
          iocs: {
            type: "array",
            items: {
              type: "object",
              additionalProperties: false,
              properties: {
                type: { type: "string" },
                value: { type: "string" },
                context: { type: "string" },
              },
              required: ["type", "value", "context"],
            },
          },
          detectionRules: {
            type: "object",
            additionalProperties: false,
            properties: {
              yara: { type: "string" },
              suricata: { type: "string" },
              siemQuery: { type: "string" },
              edrRule: { type: "string" },
              blocklistDomains: {
                type: "array",
                items: { type: "string" },
              },
              blocklistIps: { type: "array", items: { type: "string" } },
              remediationSteps: {
                type: "array",
                items: { type: "string" },
              },
            },
            required: [
              "yara",
              "suricata",
              "siemQuery",
              "edrRule",
              "blocklistDomains",
              "blocklistIps",
              "remediationSteps",
            ],
          },
          reasoningChain: {
            type: "array",
            items: {
              type: "object",
              additionalProperties: false,
              properties: {
                step: { type: "string" },
                observation: { type: "string" },
              },
              required: ["step", "observation"],
            },
          },
        },
        required: [
          "executiveSummary",
          "plainEnglishBrief",
          "behaviors",
          "codeFindings",
          "permissionAbuse",
          "networkInfrastructure",
          "campaign",
          "rootOffender",
          "riskMatrix",
          "prediction",
          "mitreTactics",
          "iocs",
          "detectionRules",
          "reasoningChain",
        ],
      },
    },
    required: [
      "verdict",
      "riskLevel",
      "riskScore",
      "confidence",
      "primaryThreatType",
      "analysis",
    ],
  },
} as const;

function buildUserPrompt(input: InvestigatorInput): string {
  const lines: string[] = [];
  lines.push("# APK Forensic Data");
  lines.push(`Sample name: ${input.sampleName}`);
  lines.push(`SHA256: ${input.sha256}`);
  if (input.fuzzyHash) lines.push(`Fuzzy hash (TLSH/ssdeep): ${input.fuzzyHash}`);
  if (input.packageName) lines.push(`Package name: ${input.packageName}`);
  if (input.versionName) lines.push(`Version: ${input.versionName}`);
  if (input.targetSdk != null) lines.push(`Target SDK: ${input.targetSdk}`);
  if (input.compileSdk != null) lines.push(`Compile SDK: ${input.compileSdk}`);

  lines.push("\n## Permissions");
  lines.push(
    input.permissions.length ? input.permissions.join("\n") : "(none provided)",
  );

  if (input.codeSnippets && input.codeSnippets.trim().length > 0) {
    lines.push("\n## Decompiled Code Snippets");
    lines.push("```");
    lines.push(input.codeSnippets);
    lines.push("```");
  }

  lines.push("\n## Network Indicators");
  lines.push(`URLs: ${input.urls.join(", ") || "(none)"}`);
  lines.push(`Domains: ${input.domains.join(", ") || "(none)"}`);
  lines.push(`IP addresses: ${input.ipAddresses.join(", ") || "(none)"}`);
  lines.push(
    `Hardcoded API keys / endpoints: ${input.apiKeys.join(", ") || "(none)"}`,
  );
  lines.push(
    `Phone numbers in code: ${input.phoneNumbers.join(", ") || "(none)"}`,
  );

  lines.push("\n## Certificate Intelligence");
  if (input.certificateFingerprint)
    lines.push(`Fingerprint: ${input.certificateFingerprint}`);
  if (input.certificateSubject) lines.push(`Subject: ${input.certificateSubject}`);
  if (input.certificateIssuer) lines.push(`Issuer: ${input.certificateIssuer}`);
  if (input.certificateNotBefore)
    lines.push(`Not before: ${input.certificateNotBefore}`);
  if (input.certificateNotAfter)
    lines.push(`Not after: ${input.certificateNotAfter}`);

  lines.push("\n## Threat Intelligence Scores");
  if (input.virusTotalScore != null)
    lines.push(
      `VirusTotal: ${input.virusTotalScore}/${input.virusTotalTotal ?? "?"} engines flagging`,
    );
  if (input.abuseIpdbScore != null)
    lines.push(`AbuseIPDB reputation score: ${input.abuseIpdbScore}/100`);
  if (input.urlScanScore != null)
    lines.push(`URLScan reputation score: ${input.urlScanScore}/100`);

  lines.push("\n## Machine Learning / Graph Signals");
  if (input.clusterId) lines.push(`DBSCAN campaign cluster ID: ${input.clusterId}`);
  if (input.anomalyScore != null)
    lines.push(`Isolation Forest anomaly score: ${input.anomalyScore}`);
  if (input.gnnMaliciousProb != null)
    lines.push(`GNN malicious probability: ${input.gnnMaliciousProb}`);
  if (input.pageRankScore != null)
    lines.push(`PageRank root-offender score: ${input.pageRankScore}`);

  lines.push(
    "\nProduce the complete autonomous investigation report as a single JSON object matching the response schema. Be evidence-based, calibrated, and actionable.",
  );
  return lines.join("\n");
}

export async function runInvestigation(
  input: InvestigatorInput,
): Promise<InvestigatorOutput> {
  const userPrompt = buildUserPrompt(input);

  const completion = await openai.chat.completions.create({
    model: "gpt-5.4",
    max_completion_tokens: 8192,
    messages: [
      { role: "system", content: SYSTEM_PROMPT },
      { role: "user", content: userPrompt },
    ],
    response_format: {
      type: "json_schema",
      json_schema: RESPONSE_SCHEMA,
    },
  });

  const raw = completion.choices[0]?.message?.content;
  if (!raw) {
    logger.error({ completion }, "OpenAI returned empty response");
    throw new Error("Empty response from analyzer");
  }

  let parsed: InvestigatorOutput;
  try {
    parsed = JSON.parse(raw) as InvestigatorOutput;
  } catch (err) {
    logger.error({ raw, err }, "Failed to parse analyzer JSON");
    throw new Error("Analyzer returned invalid JSON");
  }

  return parsed;
}
