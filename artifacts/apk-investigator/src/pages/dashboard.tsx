import React from "react";
import { Link } from "wouter";
import { useGetDashboardStats, getGetDashboardStatsQueryKey, useGetRiskDistribution, getGetRiskDistributionQueryKey, useGetRecentInvestigations, getGetRecentInvestigationsQueryKey, useGetTopIocs, getGetTopIocsQueryKey, useGetTopBehaviors, getGetTopBehaviorsQueryKey } from "@workspace/api-client-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from "recharts";
import { Activity, AlertTriangle, ShieldAlert, Target, Network, BugPlay } from "lucide-react";
import { RiskBadge } from "@/components/ui/risk-badge";
import { formatDistanceToNow } from "date-fns";
import {
  getDashboardStatsFromDataset, getRiskDistributionFromDataset,
  getRecentInvestigationsFromDataset, getTopIocsFromDataset, getTopBehaviorsFromDataset,
} from "@/lib/fraud-data";

const RISK_COLORS = { Critical: "#ff3333", High: "#ff8800", Medium: "#ffcc00", Low: "#00cc66" };

export default function Dashboard() {
  const { data: apiStats, isLoading: sl } = useGetDashboardStats({ query: { queryKey: getGetDashboardStatsQueryKey(), retry: 1 } });
  const { data: apiRisk, isLoading: rl } = useGetRiskDistribution({ query: { queryKey: getGetRiskDistributionQueryKey(), retry: 1 } });
  const { data: apiRecent, isLoading: rcl } = useGetRecentInvestigations({ query: { queryKey: getGetRecentInvestigationsQueryKey(), retry: 1 } });
  const { data: apiIocs, isLoading: il } = useGetTopIocs({ query: { queryKey: getGetTopIocsQueryKey(), retry: 1 } });
  const { data: apiBeh, isLoading: bl } = useGetTopBehaviors({ query: { queryKey: getGetTopBehaviorsQueryKey(), retry: 1 } });

  // API data if valid, else local fallback
  const stats = (apiStats && typeof apiStats === "object" && "totalInvestigations" in apiStats) ? apiStats : (sl ? null : getDashboardStatsFromDataset());
  const riskDist = Array.isArray(apiRisk) ? apiRisk : (rl ? null : getRiskDistributionFromDataset());
  const recent = Array.isArray(apiRecent) ? apiRecent : (rcl ? null : getRecentInvestigationsFromDataset());
  const topIocs = Array.isArray(apiIocs) ? apiIocs : (il ? null : getTopIocsFromDataset());
  const topBehaviors = Array.isArray(apiBeh) ? apiBeh : (bl ? null : getTopBehaviorsFromDataset());

  return (
    <div className="p-6 md:p-8 max-w-7xl mx-auto space-y-8">
      <div>
        <h1 className="text-2xl font-bold font-mono uppercase tracking-tight text-foreground flex items-center gap-2">
          <Activity className="h-6 w-6 text-primary" /> Fleet Dashboard
        </h1>
        <p className="text-muted-foreground text-sm mt-1">Real-time overview of analyzed threats and campaigns.</p>
      </div>

      {!stats ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {[...Array(4)].map((_, i) => <Skeleton key={i} className="h-32 w-full" />)}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <Card><CardHeader className="pb-2 flex flex-row items-center justify-between space-y-0"><CardTitle className="text-sm font-medium text-muted-foreground uppercase tracking-wider">Total Analyzed</CardTitle><Target className="h-4 w-4 text-muted-foreground" /></CardHeader><CardContent><div className="text-3xl font-bold">{stats.totalInvestigations}</div><p className="text-xs text-muted-foreground mt-1">APK samples processed</p></CardContent></Card>
          <Card><CardHeader className="pb-2 flex flex-row items-center justify-between space-y-0"><CardTitle className="text-sm font-medium text-muted-foreground uppercase tracking-wider">Critical Threats</CardTitle><ShieldAlert className="h-4 w-4 text-destructive" /></CardHeader><CardContent><div className="text-3xl font-bold text-destructive">{stats.criticalCount}</div><p className="text-xs text-muted-foreground mt-1">Requires immediate action</p></CardContent></Card>
          <Card><CardHeader className="pb-2 flex flex-row items-center justify-between space-y-0"><CardTitle className="text-sm font-medium text-muted-foreground uppercase tracking-wider">Campaign Clusters</CardTitle><Network className="h-4 w-4 text-muted-foreground" /></CardHeader><CardContent><div className="text-3xl font-bold">{stats.uniqueCampaigns}</div><p className="text-xs text-muted-foreground mt-1">Identified threat actor groups</p></CardContent></Card>
          <Card><CardHeader className="pb-2 flex flex-row items-center justify-between space-y-0"><CardTitle className="text-sm font-medium text-muted-foreground uppercase tracking-wider">Avg Risk Score</CardTitle><AlertTriangle className="h-4 w-4 text-muted-foreground" /></CardHeader><CardContent><div className="text-3xl font-bold">{(stats.averageRiskScore ?? 0).toFixed(1)}</div><p className="text-xs text-muted-foreground mt-1">Out of 100 maximum</p></CardContent></Card>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card className="col-span-1">
          <CardHeader><CardTitle className="text-sm font-mono uppercase">Risk Distribution</CardTitle></CardHeader>
          <CardContent className="h-[300px]">
            {!riskDist ? <Skeleton className="w-full h-full" /> : riskDist.length === 0 ? (
              <div className="flex h-full items-center justify-center text-muted-foreground text-sm">No data available</div>
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie data={riskDist} cx="50%" cy="50%" innerRadius={60} outerRadius={80} paddingAngle={2} dataKey="count" nameKey="riskLevel">
                    {riskDist.map((entry: any, index: number) => (
                      <Cell key={`cell-${index}`} fill={RISK_COLORS[entry.riskLevel as keyof typeof RISK_COLORS] || RISK_COLORS.Low} />
                    ))}
                  </Pie>
                  <Tooltip contentStyle={{ backgroundColor: 'hsl(var(--card))', borderColor: 'hsl(var(--border))', borderRadius: '0.3rem' }} itemStyle={{ color: 'hsl(var(--foreground))' }} />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            )}
          </CardContent>
        </Card>

        <Card className="col-span-1 lg:col-span-2">
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle className="text-sm font-mono uppercase">Recent Investigations</CardTitle>
            <Link href="/investigations" className="text-xs text-primary hover:underline font-mono uppercase">View All</Link>
          </CardHeader>
          <CardContent>
            {!recent ? (
              <div className="space-y-4">{[...Array(5)].map((_, i) => <Skeleton key={i} className="h-12 w-full" />)}</div>
            ) : recent.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground text-sm">No recent investigations found.</div>
            ) : (
              <div className="space-y-4">
                {recent.map((inv: any) => (
                  <Link key={inv.id} href={`/investigations/${inv.id}`} className="block">
                    <div className="flex items-center justify-between p-3 rounded-md border border-border bg-card hover:bg-accent transition-colors">
                      <div className="flex items-center gap-4">
                        <RiskBadge level={inv.riskLevel} />
                        <div>
                          <div className="font-mono text-sm font-bold truncate max-w-[200px] sm:max-w-xs">{inv.sampleName}</div>
                          <div className="text-xs text-muted-foreground">{inv.primaryThreatType}</div>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="text-sm font-bold">{inv.riskScore}/100</div>
                        <div className="text-xs text-muted-foreground">{formatDistanceToNow(new Date(inv.createdAt), { addSuffix: true })}</div>
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader><CardTitle className="text-sm font-mono uppercase">Top Indicators of Compromise</CardTitle></CardHeader>
          <CardContent>
            {!topIocs ? (
              <div className="space-y-3">{[...Array(5)].map((_, i) => <Skeleton key={i} className="h-10 w-full" />)}</div>
            ) : topIocs.length === 0 ? (
              <div className="text-center py-6 text-muted-foreground text-sm">No IOCs recorded yet.</div>
            ) : (
              <div className="space-y-2">
                {topIocs.slice(0, 5).map((ioc: any, i: number) => (
                  <div key={i} className="flex items-center justify-between p-2 rounded bg-muted/50 border border-border/50 text-sm">
                    <div className="flex items-center gap-2 overflow-hidden">
                      <span className="uppercase text-[10px] font-bold text-muted-foreground bg-background px-1.5 py-0.5 rounded border border-border">{ioc.type}</span>
                      <span className="font-mono truncate">{ioc.value}</span>
                    </div>
                    <span className="text-xs text-muted-foreground flex-shrink-0 bg-background px-2 py-1 rounded-full border border-border">{ioc.occurrences} hits</span>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader><CardTitle className="text-sm font-mono uppercase flex items-center gap-2">Top Malware Behaviors</CardTitle></CardHeader>
          <CardContent>
            {!topBehaviors ? (
              <div className="space-y-3">{[...Array(5)].map((_, i) => <Skeleton key={i} className="h-10 w-full" />)}</div>
            ) : topBehaviors.length === 0 ? (
              <div className="text-center py-6 text-muted-foreground text-sm">No behaviors recorded yet.</div>
            ) : (
              <div className="space-y-2">
                {topBehaviors.slice(0, 5).map((beh: any, i: number) => (
                  <div key={i} className="flex items-center justify-between p-2 rounded bg-muted/50 border border-border/50 text-sm">
                    <div className="flex items-center gap-2 overflow-hidden">
                      <BugPlay className="h-4 w-4 text-primary flex-shrink-0" />
                      <span className="truncate">{beh.title}</span>
                    </div>
                    <span className="text-xs text-muted-foreground flex-shrink-0 bg-background px-2 py-1 rounded-full border border-border">{beh.count} instances</span>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
