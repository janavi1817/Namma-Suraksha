import { Router, type IRouter } from "express";
import { eq, desc, ilike, and, or } from "drizzle-orm";
import { db, investigationsTable, type Investigation } from "@workspace/db";
import {
  CreateInvestigationBody,
  GetInvestigationParams,
  DeleteInvestigationParams,
  GetInvestigationIocsParams,
  ListInvestigationsQueryParams,
} from "@workspace/api-zod";
import { runInvestigation } from "../lib/investigator";

const router: IRouter = Router();

function rowToInvestigation(row: Investigation) {
  return {
    id: row.id,
    sampleName: row.sampleName,
    sha256: row.sha256,
    fuzzyHash: row.fuzzyHash,
    packageName: row.packageName,
    versionName: row.versionName,
    targetSdk: row.targetSdk,
    compileSdk: row.compileSdk,
    permissions: row.permissions ?? [],
    codeSnippets: row.codeSnippets,
    urls: row.urls ?? [],
    domains: row.domains ?? [],
    ipAddresses: row.ipAddresses ?? [],
    apiKeys: row.apiKeys ?? [],
    phoneNumbers: row.phoneNumbers ?? [],
    certificateFingerprint: row.certificateFingerprint,
    certificateSubject: row.certificateSubject,
    certificateIssuer: row.certificateIssuer,
    certificateNotBefore: row.certificateNotBefore,
    certificateNotAfter: row.certificateNotAfter,
    virusTotalScore: row.virusTotalScore,
    virusTotalTotal: row.virusTotalTotal,
    abuseIpdbScore: row.abuseIpdbScore,
    urlScanScore: row.urlScanScore,
    clusterId: row.clusterId,
    anomalyScore: row.anomalyScore,
    gnnMaliciousProb: row.gnnMaliciousProb,
    pageRankScore: row.pageRankScore,
    verdict: row.verdict,
    riskLevel: row.riskLevel,
    riskScore: row.riskScore,
    confidence: row.confidence,
    primaryThreatType: row.primaryThreatType,
    analysis: row.analysis,
    createdAt: row.createdAt.toISOString(),
  };
}

function rowToSummary(row: Investigation) {
  return {
    id: row.id,
    sampleName: row.sampleName,
    sha256: row.sha256,
    packageName: row.packageName,
    verdict: row.verdict,
    riskLevel: row.riskLevel,
    riskScore: row.riskScore,
    confidence: row.confidence,
    primaryThreatType: row.primaryThreatType,
    clusterId: row.clusterId,
    createdAt: row.createdAt.toISOString(),
  };
}

router.get("/investigations", async (req, res): Promise<void> => {
  const parsed = ListInvestigationsQueryParams.safeParse(req.query);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }
  const { search, riskLevel } = parsed.data;
  const conditions = [];
  if (search) {
    const pattern = `%${search}%`;
    conditions.push(
      or(
        ilike(investigationsTable.sampleName, pattern),
        ilike(investigationsTable.sha256, pattern),
        ilike(investigationsTable.packageName, pattern),
      ),
    );
  }
  if (riskLevel) {
    conditions.push(eq(investigationsTable.riskLevel, riskLevel));
  }
  const where = conditions.length
    ? and(...conditions.filter(Boolean))
    : undefined;

  const rows = where
    ? await db
        .select()
        .from(investigationsTable)
        .where(where)
        .orderBy(desc(investigationsTable.createdAt))
    : await db
        .select()
        .from(investigationsTable)
        .orderBy(desc(investigationsTable.createdAt));

  res.json(rows.map(rowToSummary));
});

router.post("/investigations", async (req, res): Promise<void> => {
  const parsed = CreateInvestigationBody.safeParse(req.body);
  if (!parsed.success) {
    req.log.warn({ errors: parsed.error.message }, "Invalid investigation body");
    res.status(400).json({ error: parsed.error.message });
    return;
  }

  const input = parsed.data;
  req.log.info({ sha256: input.sha256 }, "Running autonomous investigation");

  let result;
  try {
    result = await runInvestigation({
      sampleName: input.sampleName,
      sha256: input.sha256,
      fuzzyHash: input.fuzzyHash ?? null,
      packageName: input.packageName ?? null,
      versionName: input.versionName ?? null,
      targetSdk: input.targetSdk ?? null,
      compileSdk: input.compileSdk ?? null,
      permissions: input.permissions,
      codeSnippets: input.codeSnippets ?? null,
      urls: input.urls,
      domains: input.domains,
      ipAddresses: input.ipAddresses,
      apiKeys: input.apiKeys,
      phoneNumbers: input.phoneNumbers,
      certificateFingerprint: input.certificateFingerprint ?? null,
      certificateSubject: input.certificateSubject ?? null,
      certificateIssuer: input.certificateIssuer ?? null,
      certificateNotBefore: input.certificateNotBefore ?? null,
      certificateNotAfter: input.certificateNotAfter ?? null,
      virusTotalScore: input.virusTotalScore ?? null,
      virusTotalTotal: input.virusTotalTotal ?? null,
      abuseIpdbScore: input.abuseIpdbScore ?? null,
      urlScanScore: input.urlScanScore ?? null,
      clusterId: input.clusterId ?? null,
      anomalyScore: input.anomalyScore ?? null,
      gnnMaliciousProb: input.gnnMaliciousProb ?? null,
      pageRankScore: input.pageRankScore ?? null,
    });
  } catch (err) {
    req.log.error({ err }, "Investigation failed");
    res.status(502).json({ error: "Autonomous analyzer failed" });
    return;
  }

  const finalClusterId =
    input.clusterId ?? result.analysis.campaign.clusterId;

  const [row] = await db
    .insert(investigationsTable)
    .values({
      sampleName: input.sampleName,
      sha256: input.sha256,
      fuzzyHash: input.fuzzyHash ?? null,
      packageName: input.packageName ?? null,
      versionName: input.versionName ?? null,
      targetSdk: input.targetSdk ?? null,
      compileSdk: input.compileSdk ?? null,
      permissions: input.permissions,
      codeSnippets: input.codeSnippets ?? null,
      urls: input.urls,
      domains: input.domains,
      ipAddresses: input.ipAddresses,
      apiKeys: input.apiKeys,
      phoneNumbers: input.phoneNumbers,
      certificateFingerprint: input.certificateFingerprint ?? null,
      certificateSubject: input.certificateSubject ?? null,
      certificateIssuer: input.certificateIssuer ?? null,
      certificateNotBefore: input.certificateNotBefore ?? null,
      certificateNotAfter: input.certificateNotAfter ?? null,
      virusTotalScore: input.virusTotalScore ?? null,
      virusTotalTotal: input.virusTotalTotal ?? null,
      abuseIpdbScore: input.abuseIpdbScore ?? null,
      urlScanScore: input.urlScanScore ?? null,
      clusterId: finalClusterId,
      anomalyScore: input.anomalyScore ?? null,
      gnnMaliciousProb: input.gnnMaliciousProb ?? null,
      pageRankScore: input.pageRankScore ?? null,
      verdict: result.verdict,
      riskLevel: result.riskLevel,
      riskScore: result.riskScore,
      confidence: result.confidence,
      primaryThreatType: result.primaryThreatType,
      analysis: result.analysis,
    })
    .returning();

  if (!row) {
    res.status(500).json({ error: "Failed to persist investigation" });
    return;
  }

  res.status(201).json(rowToInvestigation(row));
});

router.get("/investigations/:id", async (req, res): Promise<void> => {
  const params = GetInvestigationParams.safeParse(req.params);
  if (!params.success) {
    res.status(400).json({ error: params.error.message });
    return;
  }
  const [row] = await db
    .select()
    .from(investigationsTable)
    .where(eq(investigationsTable.id, params.data.id));
  if (!row) {
    res.status(404).json({ error: "Investigation not found" });
    return;
  }
  res.json(rowToInvestigation(row));
});

router.delete("/investigations/:id", async (req, res): Promise<void> => {
  const params = DeleteInvestigationParams.safeParse(req.params);
  if (!params.success) {
    res.status(400).json({ error: params.error.message });
    return;
  }
  const [row] = await db
    .delete(investigationsTable)
    .where(eq(investigationsTable.id, params.data.id))
    .returning();
  if (!row) {
    res.status(404).json({ error: "Investigation not found" });
    return;
  }
  res.sendStatus(204);
});

router.get("/investigations/:id/iocs", async (req, res): Promise<void> => {
  const params = GetInvestigationIocsParams.safeParse(req.params);
  if (!params.success) {
    res.status(400).json({ error: params.error.message });
    return;
  }
  const [row] = await db
    .select()
    .from(investigationsTable)
    .where(eq(investigationsTable.id, params.data.id));
  if (!row) {
    res.status(404).json({ error: "Investigation not found" });
    return;
  }
  const analysis = row.analysis as { iocs?: Array<{ type: string; value: string; context: string }> };
  res.json(analysis.iocs ?? []);
});

export default router;
