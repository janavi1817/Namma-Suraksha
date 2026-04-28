import React from "react";
import { Link } from "wouter";
import { useGetDashboardStats, getGetDashboardStatsQueryKey, useGetRiskDistribution, getGetRiskDistributionQueryKey, useGetRecentInvestigations, getGetRecentInvestigationsQueryKey, useGetTopIocs, getGetTopIocsQueryKey, useGetTopBehaviors, getGetTopBehaviorsQueryKey } from "@workspace/api-client-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend, BarChart, Bar, XAxis, YAxis, CartesianGrid } from "recharts";
import { Activity, AlertTriangle, ShieldAlert, Target, Network, BugPlay, Upload, MapPin } from "lucide-react";
import { RiskBadge } from "@/components/ui/risk-badge";
import { Button } from "@/components/ui/button";
import { formatDistanceToNow } from "date-fns";
import { useAuth } from "@/lib/auth-context";
import { getDashboardStatsFromDataset, getRiskDistributionFromDataset, getRecentInvestigationsFromDataset, getTopIocsFromDataset, getTopBehaviorsFromDataset } from "@/lib/fraud-data";

const RISK_COLORS = { Critical: "#ff3333", High: "#ff8800", Medium: "#ffcc00", Low: "#00cc66" };

const WEEKLY_TREND = [
  { day: "Mon", count: 12 }, { day: "Tue", count: 19 }, { day: "Wed", count: 8 },
  { day: "Thu", count: 24 }, { day: "Fri", count: 15 }, { day: "Sat", count: 21 }, { day: "Sun", count: 11 },
];

const DISTRICT_DATA = [
  { name: "Bengaluru", cases: 47, color: "#ff3333" }, { name: "Mysuru", cases: 23, color: "#ff8800" },
  { name: "Mangaluru", cases: 18, color: "#ffcc00" }, { name: "Hubli", cases: 8, color: "#00cc66" },
  { name: "Belagavi", cases: 12, color: "#ff8800" }, { name: "Kalaburagi", cases: 6, color: "#00cc66" },
];

export default function Dashboard() {
  const { officer } = useAuth();
  const { data: apiStats, isLoading: isStatsLoading } = useGetDashboardStats({ query: { queryKey: getGetDashboardStatsQueryKey(), retry: false } });
  const { data: apiRiskDist, isLoading: isRiskLoading } = useGetRiskDistribution({ query: { queryKey: getGetRiskDistributionQueryKey(), retry: false } });
  const { data: apiRecent, isLoading: isRecentLoading } = useGetRecentInvestigations({ query: { queryKey: getGetRecentInvestigationsQueryKey(), retry: false } });
  const { data: apiTopIocs } = useGetTopIocs({ query: { queryKey: getGetTopIocsQueryKey(), retry: false } });
  const { data: apiTopBehaviors } = useGetTopBehaviors({ query: { queryKey: getGetTopBehaviorsQueryKey(), retry: false } });

  const stats = (apiStats && typeof apiStats === "object" && "totalInvestigations" in apiStats) ? apiStats : (isStatsLoading ? null : getDashboardStatsFromDataset());
  const riskDist = Array.isArray(apiRiskDist) ? apiRiskDist : (isRiskLoading ? null : getRiskDistributionFromDataset());
  const recent = Array.isArray(apiRecent) ? apiRecent : (isRecentLoading ? null : getRecentInvestigationsFromDataset());
  const topIocs = Array.isArray(apiTopIocs) ? apiTopIocs : getTopIocsFromDataset();
  const topBehaviors = Array.isArray(apiTopBehaviors) ? apiTopBehaviors : getTopBehaviorsFromDataset();

  return (
    <div className="p-6 md:p-8 max-w-7xl mx-auto space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold font-mono uppercase tracking-tight text-foreground flex items-center gap-2">
            <ShieldAlert className="h-6 w-6 text-primary" /> RAKSHAK Dashboard
          </h1>
          <p className="text-muted-foreground text-sm mt-1">
            Karnataka CB/CID Intelligence Platform {officer ? `• ${officer.district}` : ""}
          </p>
        </div>
        <Button asChild>
          <Link href="/scan"><Upload className="mr-2 h-4 w-4" /> Scan New APK</Link>
        </Button>
      </div>

      {/* Stat Cards */}
      {!stats ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {[...Array(4)].map((_, i) => <Skeleton key={i} className="h-32 w-full" />)}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <Card className="border-l-4 border-l-red-500">
            <CardHeader className="pb-2 flex flex-row items-center justify-between space-y-0">
              <CardTitle className="text-sm font-medium text-muted-foreground uppercase tracking-wider">High Risk APKs</CardTitle>
              <ShieldAlert className="h-4 w-4 text-destructive" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-destructive">{stats.criticalCount}</div>
              <p className="text-xs text-muted-foreground mt-1">Requires immediate action</p>
            </CardContent>
          </Card>
          <Card className="border-l-4 border-l-yellow-500">
            <CardHeader className="pb-2 flex flex-row items-center justify-between space-y-0">
              <CardTitle className="text-sm font-medium text-muted-foreground uppercase tracking-wider">Active Campaigns</CardTitle>
              <Activity className="h-4 w-4 text-yellow-500" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-yellow-500">{stats.uniqueCampaigns}</div>
              <p className="text-xs text-muted-foreground mt-1">Ongoing fraud operations</p>
            </CardContent>
          </Card>
          <Card className="border-l-4 border-l-blue-500">
            <CardHeader className="pb-2 flex flex-row items-center justify-between space-y-0">
              <CardTitle className="text-sm font-medium text-muted-foreground uppercase tracking-wider">Total APKs Scanned</CardTitle>
              <Target className="h-4 w-4 text-blue-500" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-blue-500">{stats.totalInvestigations}</div>
              <p className="text-xs text-muted-foreground mt-1">Samples processed</p>
            </CardContent>
          </Card>
          <Card className="border-l-4 border-l-purple-500">
            <CardHeader className="pb-2 flex flex-row items-center justify-between space-y-0">
              <CardTitle className="text-sm font-medium text-muted-foreground uppercase tracking-wider">Linked Gangs</CardTitle>
              <Network className="h-4 w-4 text-purple-500" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-purple-500">{stats.uniqueCampaigns}</div>
              <p className="text-xs text-muted-foreground mt-1">Criminal networks identified</p>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Weekly Trend */}
        <Card className="lg:col-span-2">
          <CardHeader><CardTitle className="text-sm font-mono uppercase">Fraud Trend This Week</CardTitle></CardHeader>
          <CardContent className="h-[250px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={WEEKLY_TREND}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                <XAxis dataKey="day" tick={{ fontSize: 12, fill: "hsl(var(--muted-foreground))" }} />
                <YAxis tick={{ fontSize: 12, fill: "hsl(var(--muted-foreground))" }} />
                <Tooltip contentStyle={{ backgroundColor: "hsl(var(--card))", borderColor: "hsl(var(--border))", borderRadius: "0.3rem" }} />
                <Bar dataKey="count" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Risk Distribution */}
        <Card>
          <CardHeader><CardTitle className="text-sm font-mono uppercase">Risk Distribution</CardTitle></CardHeader>
          <CardContent className="h-[250px]">
            {!riskDist ? <Skeleton className="w-full h-full" /> : (
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie data={riskDist} cx="50%" cy="50%" innerRadius={50} outerRadius={70} paddingAngle={2} dataKey="count" nameKey="riskLevel">
                    {riskDist.map((entry: any, i: number) => (
                      <Cell key={i} fill={RISK_COLORS[entry.riskLevel as keyof typeof RISK_COLORS] || RISK_COLORS.Low} />
                    ))}
                  </Pie>
                  <Tooltip contentStyle={{ backgroundColor: "hsl(var(--card))", borderColor: "hsl(var(--border))" }} />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Bottom Row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Latest Alerts */}
        <Card className="lg:col-span-2">
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle className="text-sm font-mono uppercase">Latest Alerts</CardTitle>
            <Link href="/investigations" className="text-xs text-primary hover:underline font-mono uppercase">View All</Link>
          </CardHeader>
          <CardContent>
            {!recent ? (
              <div className="space-y-3">{[...Array(5)].map((_, i) => <Skeleton key={i} className="h-12 w-full" />)}</div>
            ) : (
              <div className="space-y-3">
                {recent.slice(0, 6).map((inv: any) => (
                  <Link key={inv.id} href={`/investigations/${inv.id}`} className="block">
                    <div className="flex items-center justify-between p-3 rounded-md border border-border bg-card hover:bg-accent transition-colors">
                      <div className="flex items-center gap-3">
                        <RiskBadge level={inv.riskLevel} />
                        <div>
                          <div className="font-mono text-sm font-bold truncate max-w-[250px]">{inv.sampleName}</div>
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

        {/* District Heatmap */}
        <Card>
          <CardHeader>
            <CardTitle className="text-sm font-mono uppercase flex items-center gap-2">
              <MapPin className="h-4 w-4" /> District Heatmap
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {DISTRICT_DATA.map((d) => (
                <div key={d.name} className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full" style={{ backgroundColor: d.color }} />
                    <span className="text-sm">{d.name}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-24 h-2 rounded-full bg-muted overflow-hidden">
                      <div className="h-full rounded-full" style={{ width: `${(d.cases / 50) * 100}%`, backgroundColor: d.color }} />
                    </div>
                    <span className="text-xs font-mono font-bold w-8 text-right">{d.cases}</span>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* IOCs and Behaviors */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader><CardTitle className="text-sm font-mono uppercase">Top Indicators of Compromise</CardTitle></CardHeader>
          <CardContent>
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
          </CardContent>
        </Card>
        <Card>
          <CardHeader><CardTitle className="text-sm font-mono uppercase flex items-center gap-2"><BugPlay className="h-4 w-4" /> Top Malware Behaviors</CardTitle></CardHeader>
          <CardContent>
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
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
