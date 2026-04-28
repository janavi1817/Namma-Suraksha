import { Router, type IRouter } from "express";
import { desc } from "drizzle-orm";
import { db, investigationsTable, type Investigation } from "@workspace/db";

const router: IRouter = Router();

function summary(row: Investigation) {
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

router.get("/dashboard/stats", async (_req, res): Promise<void> => {
  const rows = await db.select().from(investigationsTable);
  const total = rows.length;
  const counts = { Critical: 0, High: 0, Medium: 0, Low: 0 };
  for (const r of rows) {
    if (r.riskLevel in counts) {
      counts[r.riskLevel as keyof typeof counts] += 1;
    }
  }
  const uniqueCampaigns = new Set(
    rows.filter((r) => r.clusterId).map((r) => r.clusterId as string),
  ).size;
  const c2DomainSet = new Set<string>();
  for (const r of rows) {
    const analysis = r.analysis as { networkInfrastructure?: { c2Domains?: string[] } };
    for (const d of analysis?.networkInfrastructure?.c2Domains ?? []) {
      c2DomainSet.add(d);
    }
  }
  const avg = total
    ? Math.round(rows.reduce((a, b) => a + b.riskScore, 0) / total)
    : 0;

  res.json({
    totalInvestigations: total,
    criticalCount: counts.Critical,
    highCount: counts.High,
    mediumCount: counts.Medium,
    lowCount: counts.Low,
    uniqueCampaigns,
    uniqueC2Domains: c2DomainSet.size,
    averageRiskScore: avg,
  });
});

router.get("/dashboard/recent", async (_req, res): Promise<void> => {
  const rows = await db
    .select()
    .from(investigationsTable)
    .orderBy(desc(investigationsTable.createdAt))
    .limit(8);
  res.json(rows.map(summary));
});

router.get("/dashboard/risk-distribution", async (_req, res): Promise<void> => {
  const rows = await db.select().from(investigationsTable);
  const counts: Record<string, number> = {
    Critical: 0,
    High: 0,
    Medium: 0,
    Low: 0,
  };
  for (const r of rows) {
    counts[r.riskLevel] = (counts[r.riskLevel] ?? 0) + 1;
  }
  res.json(
    (["Critical", "High", "Medium", "Low"] as const).map((k) => ({
      riskLevel: k,
      count: counts[k] ?? 0,
    })),
  );
});

router.get("/dashboard/top-iocs", async (_req, res): Promise<void> => {
  const rows = await db.select().from(investigationsTable);
  const counter = new Map<string, { type: string; value: string; count: number }>();
  for (const r of rows) {
    const a = r.analysis as { iocs?: Array<{ type: string; value: string }> };
    for (const ioc of a?.iocs ?? []) {
      const key = `${ioc.type}::${ioc.value}`;
      const existing = counter.get(key);
      if (existing) existing.count += 1;
      else counter.set(key, { type: ioc.type, value: ioc.value, count: 1 });
    }
  }
  const top = [...counter.values()]
    .sort((a, b) => b.count - a.count)
    .slice(0, 10)
    .map((entry) => ({
      type: entry.type,
      value: entry.value,
      occurrences: entry.count,
    }));
  res.json(top);
});

router.get("/dashboard/behaviors", async (_req, res): Promise<void> => {
  const rows = await db.select().from(investigationsTable);
  const counter = new Map<string, { type: string; title: string; count: number }>();
  for (const r of rows) {
    const a = r.analysis as { behaviors?: Array<{ type: string; title: string }> };
    for (const b of a?.behaviors ?? []) {
      const key = b.type;
      const existing = counter.get(key);
      if (existing) existing.count += 1;
      else counter.set(key, { type: b.type, title: b.title, count: 1 });
    }
  }
  const top = [...counter.values()]
    .sort((a, b) => b.count - a.count)
    .slice(0, 8);
  res.json(top);
});

export default router;
