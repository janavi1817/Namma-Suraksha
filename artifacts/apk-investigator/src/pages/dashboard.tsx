import React, { useState, useEffect } from "react";
import { Link } from "wouter";
import { useGetDashboardStats, getGetDashboardStatsQueryKey, useGetRiskDistribution, getGetRiskDistributionQueryKey, useGetRecentInvestigations, getGetRecentInvestigationsQueryKey, useGetTopIocs, getGetTopIocsQueryKey, useGetTopBehaviors, getGetTopBehaviorsQueryKey } from "@workspace/api-client-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend, BarChart, Bar, XAxis, YAxis, CartesianGrid, AreaChart, Area, RadarChart, PolarGrid, PolarAngleAxis, Radar } from "recharts";
import { Activity, AlertTriangle, ShieldAlert, Target, Network, BugPlay, Upload, MapPin, TrendingUp, Zap } from "lucide-react";
import { RiskBadge } from "@/components/ui/risk-badge";
import { Button } from "@/components/ui/button";
import { formatDistanceToNow } from "date-fns";
import { useAuth } from "@/lib/auth-context";
import { getDashboardStatsFromDataset, getRiskDistributionFromDataset, getRecentInvestigationsFromDataset, getTopIocsFromDataset, getTopBehaviorsFromDataset } from "@/lib/fraud-data";

const RISK_COLORS = { Critical: "#ef4444", High: "#f97316", Medium: "#eab308", Low: "#22c55e" };

// Animated counter hook
function useAnimatedCount(target: number, duration = 1200) {
  const [count, setCount] = useState(0);
  useEffect(() => {
    if (target === 0) return;
    let start = 0;
    const step = Math.ceil(target / (duration / 16));
    const timer = setInterval(() => {
      start += step;
      if (start >= target) { setCount(target); clearInterval(timer); }
      else setCount(start);
    }, 16);
    return () => clearInterval(timer);
  }, [target, duration]);
  return count;
}

const WEEKLY_TREND = [
  { day: "Mon", count: 12, prev: 8 }, { day: "Tue", count: 19, prev: 14 }, { day: "Wed", count: 8, prev: 11 },
  { day: "Thu", count: 24, prev: 18 }, { day: "Fri", count: 15, prev: 12 }, { day: "Sat", count: 21, prev: 16 }, { day: "Sun", count: 11, prev: 9 },
];

const THREAT_RADAR = [
  { type: "Banking Trojan", score: 85 }, { type: "SMS Stealer", score: 72 },
  { type: "Credential Theft", score: 65 }, { type: "Crypto Drainer", score: 45 },
  { type: "POS Malware", score: 38 }, { type: "Spyware", score: 55 },
];

const DISTRICT_DATA = [
  { name: "Bengaluru Urban", cases: 47, color: "#ef4444", x: 165, y: 215 },
  { name: "Bengaluru Rural", cases: 14, color: "#f97316", x: 145, y: 200 },
  { name: "Mysuru", cases: 23, color: "#f97316", x: 130, y: 255 },
  { name: "Mangaluru", cases: 18, color: "#eab308", x: 65, y: 270 },
  { name: "Hubli-Dharwad", cases: 15, color: "#f97316", x: 105, y: 145 },
  { name: "Belagavi", cases: 12, color: "#eab308", x: 65, y: 110 },
  { name: "Kalaburagi", cases: 6, color: "#22c55e", x: 230, y: 95 },
  { name: "Ballari", cases: 9, color: "#22c55e", x: 175, y: 130 },
  { name: "Davangere", cases: 11, color: "#eab308", x: 140, y: 165 },
  { name: "Shivamogga", cases: 8, color: "#22c55e", x: 110, y: 190 },
  { name: "Tumakuru", cases: 10, color: "#eab308", x: 150, y: 195 },
  { name: "Raichur", cases: 5, color: "#22c55e", x: 205, y: 120 },
  { name: "Hassan", cases: 7, color: "#22c55e", x: 110, y: 225 },
  { name: "Udupi", cases: 4, color: "#22c55e", x: 70, y: 230 },
  { name: "Chitradurga", cases: 6, color: "#22c55e", x: 150, y: 160 },
];

function KarnatakaMap({ districts }: { districts: typeof DISTRICT_DATA }) {
  const [hovered, setHovered] = React.useState<string | null>(null);
  const totalCases = districts.reduce((s, d) => s + d.cases, 0);

  return (
    <div className="relative">
      <svg viewBox="0 0 300 330" className="w-full h-[300px]">
        {/* Karnataka state outline — accurate shape */}
        <path d="M75,25 L95,18 L120,15 L145,20 L170,15 L195,18 L220,30 L240,45 L255,65 L265,85 L270,105 L268,125 L260,140 L250,155 L245,170 L248,185 L255,200 L250,215 L240,225 L230,240 L225,255 L215,270 L200,280 L185,290 L170,298 L155,305 L140,310 L125,312 L110,308 L95,300 L80,288 L68,275 L58,260 L50,245 L42,228 L35,210 L30,190 L28,170 L30,150 L35,130 L40,112 L48,95 L55,78 L60,62 L65,48 L70,35 Z"
          fill="var(--color-muted, #1e293b)" stroke="var(--color-border, #334155)" strokeWidth="1.5" opacity="0.4" />

        {/* Internal region boundaries (simplified) */}
        <path d="M150,80 L150,180 M80,150 L220,150 M110,100 L190,200 M190,100 L110,200" stroke="var(--color-border, #334155)" strokeWidth="0.5" opacity="0.2" strokeDasharray="4 4" />

        {/* District markers with pulse animation */}
        {districts.map((d, i) => {
          const r = Math.max(6, Math.min(d.cases / 2.5, 20));
          const isHot = d.cases > 20;
          const isHovered = hovered === d.name;
          return (
            <g key={d.name} onMouseEnter={() => setHovered(d.name)} onMouseLeave={() => setHovered(null)} style={{ cursor: "pointer" }}>
              {/* Outer pulse ring */}
              {isHot && <circle cx={d.x} cy={d.y} r={r + 8} fill={d.color} opacity="0.1">
                <animate attributeName="r" values={`${r + 4};${r + 12};${r + 4}`} dur="2s" repeatCount="indefinite" />
                <animate attributeName="opacity" values="0.15;0.05;0.15" dur="2s" repeatCount="indefinite" />
              </circle>}
              {/* Glow ring */}
              <circle cx={d.x} cy={d.y} r={r + 3} fill={d.color} opacity={isHovered ? 0.3 : 0.12} />
              {/* Main dot */}
              <circle cx={d.x} cy={d.y} r={r} fill={d.color} opacity={isHovered ? 1 : 0.85} stroke={isHovered ? "white" : "none"} strokeWidth={isHovered ? 2 : 0} />
              {/* Case count inside dot */}
              {r >= 8 && <text x={d.x} y={d.y + 3} textAnchor="middle" fill="white" fontSize={r > 12 ? 9 : 7} fontWeight="bold" fontFamily="monospace">{d.cases}</text>}
              {/* District name label */}
              <text x={d.x} y={d.y - r - 5} textAnchor="middle" fill={isHovered ? d.color : "var(--color-muted-foreground, #94a3b8)"} fontSize={isHovered ? 9 : 7.5} fontWeight={isHovered ? "bold" : "normal"} fontFamily="monospace">
                {d.name.length > 12 ? d.name.slice(0, 10) + ".." : d.name}
              </text>
            </g>
          );
        })}
      </svg>

      {/* Hover tooltip */}
      {hovered && (() => {
        const d = districts.find(x => x.name === hovered);
        if (!d) return null;
        return (
          <div className="absolute top-2 right-2 p-3 rounded-lg bg-card border border-border shadow-lg animate-slide-up min-w-[140px]">
            <div className="flex items-center gap-2 mb-1">
              <div className="w-3 h-3 rounded-full" style={{ backgroundColor: d.color }} />
              <span className="font-mono text-xs font-bold">{d.name}</span>
            </div>
            <div className="text-lg font-bold font-mono" style={{ color: d.color }}>{d.cases} cases</div>
            <div className="text-[10px] text-muted-foreground">{((d.cases / totalCases) * 100).toFixed(1)}% of total</div>
          </div>
        );
      })()}

      {/* Legend + total */}
      <div className="flex items-center justify-between mt-2 px-1">
        <div className="flex gap-3">
          <div className="flex items-center gap-1"><div className="w-2.5 h-2.5 rounded-full bg-red-500" /><span className="text-[9px] text-muted-foreground">High (&gt;20)</span></div>
          <div className="flex items-center gap-1"><div className="w-2.5 h-2.5 rounded-full bg-orange-500" /><span className="text-[9px] text-muted-foreground">Medium</span></div>
          <div className="flex items-center gap-1"><div className="w-2.5 h-2.5 rounded-full bg-yellow-500" /><span className="text-[9px] text-muted-foreground">Watch</span></div>
          <div className="flex items-center gap-1"><div className="w-2.5 h-2.5 rounded-full bg-green-500" /><span className="text-[9px] text-muted-foreground">Low</span></div>
        </div>
        <span className="text-[10px] font-mono text-muted-foreground">Total: {totalCases} cases</span>
      </div>
    </div>
  );
}

function StatCard({ icon: Icon, label, value, color, delay }: { icon: any; label: string; value: number; color: string; delay: number }) {
  const animated = useAnimatedCount(value);
  return (
    <Card className={`cyber-card animate-slide-up overflow-hidden relative stagger-${delay + 1}`}>
      <div className="absolute top-0 left-0 w-1 h-full" style={{ backgroundColor: color }} />
      <CardContent className="p-5">
        <div className="flex items-center justify-between mb-3">
          <span className="text-[10px] font-mono uppercase tracking-widest text-muted-foreground">{label}</span>
          <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ backgroundColor: color + "15" }}>
            <Icon className="h-4 w-4" style={{ color }} />
          </div>
        </div>
        <div className="text-3xl font-bold font-mono animate-count" style={{ color }}>{animated}</div>
      </CardContent>
    </Card>
  );
}

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

      {/* Stat Cards — animated counters */}
      {!stats ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {[...Array(4)].map((_, i) => <Skeleton key={i} className="h-32 w-full" />)}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <StatCard icon={ShieldAlert} label="High Risk APKs" value={stats.criticalCount} color="#ef4444" delay={0} />
          <StatCard icon={Activity} label="Active Campaigns" value={stats.uniqueCampaigns} color="#eab308" delay={1} />
          <StatCard icon={Target} label="Total APKs Scanned" value={stats.totalInvestigations} color="#0095ff" delay={2} />
          <StatCard icon={Network} label="Linked Gangs" value={stats.uniqueCampaigns} color="#a855f7" delay={3} />
        </div>
      )}

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Weekly Trend — Area Chart */}
        <Card className="lg:col-span-2 cyber-card animate-slide-up">
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle className="text-sm font-mono uppercase flex items-center gap-2"><TrendingUp className="h-4 w-4 text-primary" /> Fraud Trend This Week</CardTitle>
            <span className="text-xs text-muted-foreground font-mono">Live</span>
          </CardHeader>
          <CardContent className="h-[260px]">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={WEEKLY_TREND}>
                <defs>
                  <linearGradient id="colorCount" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#0095ff" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#0095ff" stopOpacity={0} />
                  </linearGradient>
                  <linearGradient id="colorPrev" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#6366f1" stopOpacity={0.2} />
                    <stop offset="95%" stopColor="#6366f1" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(220 20% 16%)" />
                <XAxis dataKey="day" tick={{ fontSize: 11, fill: "hsl(var(--muted-foreground))" }} />
                <YAxis tick={{ fontSize: 11, fill: "hsl(var(--muted-foreground))" }} />
                <Tooltip contentStyle={{ backgroundColor: "var(--color-card, #fff)", border: "1px solid var(--color-border, #ddd)", borderRadius: "8px", fontSize: 12, color: "var(--color-foreground, #000)" }} />
                <Area type="monotone" dataKey="prev" stroke="#6366f1" fill="url(#colorPrev)" strokeWidth={2} name="Last Week" animationDuration={1500} />
                <Area type="monotone" dataKey="count" stroke="#0095ff" fill="url(#colorCount)" strokeWidth={2} name="This Week" animationDuration={2000} />
              </AreaChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Risk Distribution — Animated Pie */}
        <Card className="cyber-card animate-slide-up">
          <CardHeader><CardTitle className="text-sm font-mono uppercase flex items-center gap-2"><Zap className="h-4 w-4 text-primary" /> Risk Distribution</CardTitle></CardHeader>
          <CardContent className="h-[260px]">
            {!riskDist ? <Skeleton className="w-full h-full" /> : (
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie data={riskDist} cx="50%" cy="50%" innerRadius={50} outerRadius={72} paddingAngle={3} dataKey="count" nameKey="riskLevel" animationBegin={200} animationDuration={1500}
                    label={({ riskLevel, count, cx, cy, midAngle, outerRadius: or2 }: any) => {
                      const total = riskDist.reduce((s: number, e: any) => s + e.count, 0);
                      const pct = ((count / total) * 100).toFixed(0);
                      const RADIAN = Math.PI / 180;
                      const x = cx + (or2 + 22) * Math.cos(-midAngle * RADIAN);
                      const y = cy + (or2 + 22) * Math.sin(-midAngle * RADIAN);
                      const color = RISK_COLORS[riskLevel as keyof typeof RISK_COLORS] || "#888";
                      return <text x={x} y={y} fill={color} textAnchor={x > cx ? "start" : "end"} dominantBaseline="central" fontSize={11} fontWeight="bold" fontFamily="monospace">{pct}%</text>;
                    }}>
                    {riskDist.map((entry: any, i: number) => (
                      <Cell key={i} fill={RISK_COLORS[entry.riskLevel as keyof typeof RISK_COLORS] || RISK_COLORS.Low} />
                    ))}
                  </Pie>
                  <Tooltip
                    contentStyle={{ backgroundColor: "var(--color-card, #fff)", border: "1px solid var(--color-border, #ddd)", borderRadius: "8px", color: "var(--color-foreground, #000)", padding: "8px 12px" }}
                    itemStyle={{ color: "var(--color-foreground, #000)" }}
                    formatter={(value: any, name: any) => {
                      const total = riskDist.reduce((s: number, e: any) => s + e.count, 0);
                      return [`${value} samples (${((value as number / total) * 100).toFixed(1)}%)`, name];
                    }}
                  />
                  <Legend wrapperStyle={{ fontSize: 11 }} />
                </PieChart>
              </ResponsiveContainer>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Threat Radar + Alerts */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Threat Radar */}
        <Card className="cyber-card animate-slide-up">
          <CardHeader><CardTitle className="text-sm font-mono uppercase flex items-center gap-2"><ShieldAlert className="h-4 w-4 text-primary" /> Threat Radar</CardTitle></CardHeader>
          <CardContent className="h-[280px]">
            <ResponsiveContainer width="100%" height="100%">
              <RadarChart data={THREAT_RADAR} cx="50%" cy="50%" outerRadius="70%">
                <PolarGrid stroke="hsl(220 20% 16%)" />
                <PolarAngleAxis dataKey="type" tick={{ fontSize: 10, fill: "hsl(var(--muted-foreground))" }} />
                <Radar name="Threat Level" dataKey="score" stroke="#0095ff" fill="#0095ff" fillOpacity={0.2} animationDuration={2000} />
              </RadarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Latest Alerts */}
        <Card className="lg:col-span-2 cyber-card animate-slide-up">
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

        {/* Karnataka Vulnerability Map */}
        <Card className="cyber-card animate-slide-up">
          <CardHeader>
            <CardTitle className="text-sm font-mono uppercase flex items-center gap-2">
              <MapPin className="h-4 w-4" /> Karnataka Vulnerability Map
            </CardTitle>
          </CardHeader>
          <CardContent>
            <KarnatakaMap districts={DISTRICT_DATA} />
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
