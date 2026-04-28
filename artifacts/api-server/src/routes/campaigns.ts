import { Router, type IRouter } from "express";
import { eq, desc, sql, isNotNull } from "drizzle-orm";
import { db, investigationsTable } from "@workspace/db";
import { GetCampaignParams } from "@workspace/api-zod";

const router: IRouter = Router();

const RISK_RANK: Record<string, number> = {
  Critical: 4,
  High: 3,
  Medium: 2,
  Low: 1,
};

function highestRisk(levels: string[]): string {
  let best = "Low";
  let bestRank = 0;
  for (const lvl of levels) {
    const r = RISK_RANK[lvl] ?? 0;
    if (r > bestRank) {
      bestRank = r;
      best = lvl;
    }
  }
  return best;
}

router.get("/campaigns", async (_req, res): Promise<void> => {
  const rows = await db
    .select()
    .from(investigationsTable)
    .where(isNotNull(investigationsTable.clusterId));

  const groups = new Map<
    string,
    {
      clusterId: string;
      riskLevels: string[];
      riskScores: number[];
      firstSeen: Date;
      lastSeen: Date;
      sampleCount: number;
      threatTypes: Set<string>;
    }
  >();

  for (const r of rows) {
    if (!r.clusterId) continue;
    const existing = groups.get(r.clusterId);
    if (existing) {
      existing.sampleCount += 1;
      existing.riskLevels.push(r.riskLevel);
      existing.riskScores.push(r.riskScore);
      if (r.createdAt < existing.firstSeen) existing.firstSeen = r.createdAt;
      if (r.createdAt > existing.lastSeen) existing.lastSeen = r.createdAt;
      existing.threatTypes.add(r.primaryThreatType);
    } else {
      groups.set(r.clusterId, {
        clusterId: r.clusterId,
        riskLevels: [r.riskLevel],
        riskScores: [r.riskScore],
        firstSeen: r.createdAt,
        lastSeen: r.createdAt,
        sampleCount: 1,
        threatTypes: new Set([r.primaryThreatType]),
      });
    }
  }

  const result = [...groups.values()]
    .map((g) => ({
      clusterId: g.clusterId,
      clusterName: [...g.threatTypes][0] ?? g.clusterId,
      sampleCount: g.sampleCount,
      topRiskLevel: highestRisk(g.riskLevels),
      averageRiskScore: Math.round(
        g.riskScores.reduce((a, b) => a + b, 0) / g.riskScores.length,
      ),
      firstSeen: g.firstSeen.toISOString(),
      lastSeen: g.lastSeen.toISOString(),
    }))
    .sort((a, b) => b.sampleCount - a.sampleCount);

  res.json(result);
});

router.get("/campaigns/:clusterId", async (req, res): Promise<void> => {
  const params = GetCampaignParams.safeParse(req.params);
  if (!params.success) {
    res.status(400).json({ error: params.error.message });
    return;
  }
  const rows = await db
    .select()
    .from(investigationsTable)
    .where(eq(investigationsTable.clusterId, params.data.clusterId))
    .orderBy(desc(investigationsTable.createdAt));

  if (rows.length === 0) {
    res.status(404).json({ error: "Campaign not found" });
    return;
  }

  const threatTypes = new Set(rows.map((r) => r.primaryThreatType));
  const riskScores = rows.map((r) => r.riskScore);

  res.json({
    clusterId: params.data.clusterId,
    clusterName: [...threatTypes][0] ?? params.data.clusterId,
    sampleCount: rows.length,
    topRiskLevel: highestRisk(rows.map((r) => r.riskLevel)),
    averageRiskScore: Math.round(
      riskScores.reduce((a, b) => a + b, 0) / riskScores.length,
    ),
    firstSeen: rows[rows.length - 1]!.createdAt.toISOString(),
    lastSeen: rows[0]!.createdAt.toISOString(),
    members: rows.map((r) => ({
      id: r.id,
      sampleName: r.sampleName,
      sha256: r.sha256,
      packageName: r.packageName,
      verdict: r.verdict,
      riskLevel: r.riskLevel,
      riskScore: r.riskScore,
      confidence: r.confidence,
      primaryThreatType: r.primaryThreatType,
      clusterId: r.clusterId,
      createdAt: r.createdAt.toISOString(),
    })),
  });

  // suppress unused import warning for sql
  void sql;
});

export default router;
