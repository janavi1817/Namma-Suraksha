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

// Karnataka district regions with simplified boundary paths
const KA_DISTRICTS = [
  { id: "bidar", name: "Bidar", path: "M218,18 L240,15 L252,28 L248,42 L230,45 L218,35Z", cx: 235, cy: 30 },
  { id: "kalaburagi", name: "Kalaburagi", path: "M218,35 L230,45 L248,42 L260,55 L255,72 L235,75 L215,68 L205,52Z", cx: 233, cy: 58 },
  { id: "raichur", name: "Raichur", path: "M205,52 L215,68 L235,75 L230,92 L210,98 L192,90 L188,72Z", cx: 212, cy: 78 },
  { id: "ballari", name: "Ballari", path: "M170,78 L188,72 L192,90 L210,98 L205,115 L185,120 L168,110 L162,92Z", cx: 186, cy: 98 },
  { id: "belagavi", name: "Belagavi", path: "M55,65 L78,55 L98,62 L105,80 L95,98 L72,102 L55,92 L48,78Z", cx: 78, cy: 80 },
  { id: "dharwad", name: "Hubli-Dharwad", path: "M98,62 L118,58 L132,68 L135,88 L120,98 L105,95 L95,98 L105,80Z", cx: 115, cy: 80 },
  { id: "gadag", name: "Gadag", path: "M132,68 L152,62 L165,72 L162,92 L145,98 L135,88Z", cx: 148, cy: 80 },
  { id: "haveri", name: "Haveri", path: "M105,95 L120,98 L135,88 L145,98 L140,115 L122,120 L108,112Z", cx: 125, cy: 105 },
  { id: "uttarakannada", name: "Uttara Kannada", path: "M48,78 L55,92 L72,102 L95,98 L105,95 L108,112 L98,132 L78,145 L55,148 L38,135 L32,112 L38,92Z", cx: 70, cy: 118 },
  { id: "davangere", name: "Davangere", path: "M140,115 L162,110 L175,120 L172,138 L155,145 L140,138Z", cx: 157, cy: 128 },
  { id: "shivamogga", name: "Shivamogga", path: "M98,132 L108,112 L122,120 L140,115 L140,138 L128,152 L108,155 L92,148Z", cx: 118, cy: 135 },
  { id: "chitradurga", name: "Chitradurga", path: "M155,145 L172,138 L185,145 L188,162 L175,172 L158,168 L150,158Z", cx: 170, cy: 155 },
  { id: "tumakuru", name: "Tumakuru", path: "M150,158 L158,168 L175,172 L180,190 L168,202 L148,198 L138,185 L140,170Z", cx: 160, cy: 182 },
  { id: "bengaluru", name: "Bengaluru Urban", path: "M180,190 L198,185 L210,195 L208,212 L195,218 L182,215 L175,205Z", cx: 195, cy: 202 },
  { id: "bengalururural", name: "Bengaluru Rural", path: "M168,202 L180,190 L175,205 L182,215 L175,228 L160,225 L152,215Z", cx: 170, cy: 212 },
  { id: "hassan", name: "Hassan", path: "M108,155 L128,152 L140,170 L138,185 L125,195 L108,190 L98,175Z", cx: 120, cy: 175 },
  { id: "udupi", name: "Udupi", path: "M55,148 L78,145 L92,148 L88,168 L72,178 L55,175 L45,162Z", cx: 68, cy: 162 },
  { id: "dakshinakannada", name: "Mangaluru", path: "M45,162 L55,175 L72,178 L78,195 L68,212 L50,215 L38,202 L35,182Z", cx: 58, cy: 192 },
  { id: "kodagu", name: "Kodagu", path: "M78,195 L98,190 L108,205 L102,222 L85,225 L72,218 L68,212Z", cx: 90, cy: 210 },
  { id: "mysuru", name: "Mysuru", path: "M102,222 L108,205 L125,195 L138,205 L148,220 L142,238 L125,245 L110,240Z", cx: 125, cy: 225 },
  { id: "mandya", name: "Mandya", path: "M138,205 L148,198 L160,205 L165,220 L155,232 L142,238 L138,225Z", cx: 150, cy: 218 },
  { id: "chamarajanagar", name: "Chamarajanagar", path: "M125,245 L142,238 L155,248 L150,265 L135,270 L120,262Z", cx: 138, cy: 255 },
  { id: "ramanagara", name: "Ramanagara", path: "M160,205 L168,202 L175,215 L175,228 L165,235 L155,232 L155,218Z", cx: 165, cy: 218 },
  { id: "kolar", name: "Kolar", path: "M210,195 L228,192 L238,205 L232,218 L218,222 L208,212Z", cx: 222, cy: 208 },
  { id: "chikkaballapur", name: "Chikkaballapur", path: "M198,175 L215,170 L228,180 L228,192 L210,195 L198,185Z", cx: 213, cy: 183 },
  { id: "koppal", name: "Koppal", path: "M152,62 L170,58 L170,78 L162,92 L145,98Z", cx: 160, cy: 78 },
  { id: "yadgir", name: "Yadgir", path: "M215,68 L235,75 L230,92 L210,98 L205,85Z", cx: 220, cy: 82 },
  { id: "vijayapura", name: "Vijayapura", path: "M105,40 L132,35 L152,42 L152,62 L132,68 L118,58 L98,62 L95,50Z", cx: 125, cy: 52 },
  { id: "bagalkot", name: "Bagalkot", path: "M132,35 L155,30 L170,38 L170,58 L152,62 L152,42Z", cx: 152, cy: 46 },
  { id: "chikkamagaluru", name: "Chikkamagaluru", path: "M88,168 L98,175 L108,190 L98,205 L78,195 L72,178Z", cx: 90, cy: 185 },
];

function KarnatakaMap({ districts }: { districts: typeof DISTRICT_DATA }) {
  const [selected, setSelected] = React.useState<string | null>(null);
  const totalCases = districts.reduce((s, d) => s + d.cases, 0);
  const sorted = [...districts].sort((a, b) => b.cases - a.cases);
  const selectedD = districts.find(x => x.name === selected);

  // Map district data to regions
  const getDistrictData = (regionName: string) => districts.find(d =>
    regionName.toLowerCase().includes(d.name.toLowerCase().split(" ")[0]) ||
    d.name.toLowerCase().includes(regionName.toLowerCase().split(" ")[0])
  );

  return (
    <div className="flex gap-6">
      {/* SVG Map */}
      <div className="flex-1">
        <svg viewBox="0 0 280 285" className="w-full h-[350px]">
          {KA_DISTRICTS.map((region) => {
            const data = getDistrictData(region.name);
            const cases = data?.cases || 0;
            const isSel = selected === data?.name;
            // Color by threat level
            const fillColor = cases > 30 ? "#ef4444" : cases > 15 ? "#f97316" : cases > 8 ? "#eab308" : cases > 0 ? "#22c55e" : "var(--color-muted, #334155)";
            const fillOpacity = isSel ? 0.9 : cases > 0 ? 0.6 : 0.2;

            return (
              <g key={region.id} onClick={() => data && setSelected(isSel ? null : data.name)} style={{ cursor: data ? "pointer" : "default" }}>
                <path d={region.path} fill={fillColor} fillOpacity={fillOpacity} stroke={isSel ? "white" : "var(--color-border, #475569)"} strokeWidth={isSel ? 2 : 0.8} className="transition-all duration-300 hover:opacity-80" />
                {/* Pulse for high-risk */}
                {cases > 20 && (
                  <circle cx={region.cx} cy={region.cy} r="3" fill={fillColor} opacity="0.6">
                    <animate attributeName="r" values="3;8;3" dur="2s" repeatCount="indefinite" />
                    <animate attributeName="opacity" values="0.6;0.1;0.6" dur="2s" repeatCount="indefinite" />
                  </circle>
                )}
                {/* District label */}
                {(isSel || cases > 10) && (
                  <text x={region.cx} y={region.cy + 1} textAnchor="middle" dominantBaseline="middle" fill="white" fontSize={isSel ? 7 : 5.5} fontWeight="bold" fontFamily="monospace" style={{ textShadow: "0 1px 2px rgba(0,0,0,0.8)" }}>
                    {region.name.length > 10 ? region.name.slice(0, 8) + ".." : region.name}
                  </text>
                )}
                {cases > 0 && isSel && (
                  <text x={region.cx} y={region.cy + 10} textAnchor="middle" fill="white" fontSize="7" fontFamily="monospace" fontWeight="bold" style={{ textShadow: "0 1px 2px rgba(0,0,0,0.8)" }}>
                    {cases}
                  </text>
                )}
              </g>
            );
          })}
        </svg>
        {/* Legend */}
        <div className="flex justify-center gap-4 mt-1">
          <div className="flex items-center gap-1"><div className="w-3 h-2 rounded-sm bg-red-500" /><span className="text-[9px] text-muted-foreground">Critical (&gt;30)</span></div>
          <div className="flex items-center gap-1"><div className="w-3 h-2 rounded-sm bg-orange-500" /><span className="text-[9px] text-muted-foreground">High (15-30)</span></div>
          <div className="flex items-center gap-1"><div className="w-3 h-2 rounded-sm bg-yellow-500" /><span className="text-[9px] text-muted-foreground">Medium (8-15)</span></div>
          <div className="flex items-center gap-1"><div className="w-3 h-2 rounded-sm bg-green-500" /><span className="text-[9px] text-muted-foreground">Low (&lt;8)</span></div>
        </div>
      </div>

      {/* Stats panel */}
      <div className="w-[160px] shrink-0 space-y-3">
        <div className="text-[10px] font-mono uppercase text-muted-foreground tracking-wider">District Stats</div>
        {selectedD ? (
          <div className="animate-slide-up space-y-3">
            <div>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full" style={{ backgroundColor: selectedD.color }} />
                <span className="font-mono text-sm font-bold">{selectedD.name}</span>
              </div>
              <div className="text-3xl font-bold font-mono mt-1" style={{ color: selectedD.color }}>{selectedD.cases}</div>
              <div className="text-xs text-muted-foreground">{((selectedD.cases / totalCases) * 100).toFixed(1)}% of state total</div>
            </div>
            <div className="w-full h-2 rounded-full bg-muted overflow-hidden">
              <div className="h-full rounded-full transition-all duration-700" style={{ width: `${(selectedD.cases / 50) * 100}%`, backgroundColor: selectedD.color }} />
            </div>
            <div className="text-[10px] text-muted-foreground">
              Threat Level: <span className="font-bold" style={{ color: selectedD.color }}>{selectedD.cases > 30 ? "CRITICAL" : selectedD.cases > 15 ? "HIGH" : selectedD.cases > 8 ? "MEDIUM" : "LOW"}</span>
            </div>
          </div>
        ) : (
          <div className="text-xs text-muted-foreground">Click any district on the map</div>
        )}
        <div className="border-t border-border/50 pt-2 space-y-1.5">
          <div className="text-[9px] font-mono uppercase text-muted-foreground">Top Districts</div>
          {sorted.slice(0, 8).map((d) => (
            <button key={d.name} onClick={() => setSelected(d.name)} className={`flex items-center justify-between w-full text-left p-1.5 rounded transition-all ${selected === d.name ? "bg-muted border border-border" : "hover:bg-muted/50"}`}>
              <div className="flex items-center gap-1.5">
                <div className="w-2 h-2 rounded-full" style={{ backgroundColor: d.color }} />
                <span className="text-[10px] font-mono truncate max-w-[85px]">{d.name}</span>
              </div>
              <span className="text-[10px] font-mono font-bold" style={{ color: d.color }}>{d.cases}</span>
            </button>
          ))}
        </div>
        <div className="text-[10px] text-muted-foreground font-mono pt-2 border-t border-border/50">
          State Total: <span className="font-bold text-foreground">{totalCases}</span>
        </div>
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

        {/* Karnataka Vulnerability Map — moved to own row for full width */}
      </div>

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

      {/* IOCs and Behaviors — with bar charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="cyber-card">
          <CardHeader><CardTitle className="text-sm font-mono uppercase flex items-center gap-2"><AlertTriangle className="h-4 w-4 text-primary" /> Indicators of Compromise</CardTitle></CardHeader>
          <CardContent>
            <div className="h-[220px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={topIocs.slice(0, 6).map((ioc: any) => ({ name: ioc.value.length > 20 ? ioc.value.slice(0, 18) + ".." : ioc.value, hits: ioc.occurrences, type: ioc.type }))} layout="vertical" margin={{ left: 10, right: 20 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border, #334155)" horizontal={false} />
                  <XAxis type="number" tick={{ fontSize: 10, fill: "var(--color-muted-foreground, #94a3b8)" }} />
                  <YAxis type="category" dataKey="name" tick={{ fontSize: 9, fill: "var(--color-muted-foreground, #94a3b8)" }} width={120} />
                  <Tooltip contentStyle={{ backgroundColor: "var(--color-card, #fff)", border: "1px solid var(--color-border, #ddd)", borderRadius: "8px", color: "var(--color-foreground, #000)" }} formatter={(v: any) => [`${v} hits`]} />
                  <Bar dataKey="hits" fill="#f97316" radius={[0, 4, 4, 0]} animationDuration={1500} />
                </BarChart>
              </ResponsiveContainer>
            </div>
            <div className="flex gap-2 mt-2 flex-wrap">
              {topIocs.slice(0, 5).map((ioc: any, i: number) => (
                <span key={i} className="text-[9px] font-mono px-2 py-0.5 rounded bg-muted border border-border/50">{ioc.type}: {ioc.occurrences}</span>
              ))}
            </div>
          </CardContent>
        </Card>
        <Card className="cyber-card">
          <CardHeader><CardTitle className="text-sm font-mono uppercase flex items-center gap-2"><BugPlay className="h-4 w-4 text-primary" /> Top Malware Behaviors</CardTitle></CardHeader>
          <CardContent>
            <div className="h-[220px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={topBehaviors.slice(0, 5).map((b: any) => ({ name: b.title.length > 22 ? b.title.slice(0, 20) + ".." : b.title, count: b.count, type: b.type }))} layout="vertical" margin={{ left: 10, right: 20 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border, #334155)" horizontal={false} />
                  <XAxis type="number" tick={{ fontSize: 10, fill: "var(--color-muted-foreground, #94a3b8)" }} />
                  <YAxis type="category" dataKey="name" tick={{ fontSize: 9, fill: "var(--color-muted-foreground, #94a3b8)" }} width={140} />
                  <Tooltip contentStyle={{ backgroundColor: "var(--color-card, #fff)", border: "1px solid var(--color-border, #ddd)", borderRadius: "8px", color: "var(--color-foreground, #000)" }} formatter={(v: any) => [`${v} instances`]} />
                  <Bar dataKey="count" fill="#ef4444" radius={[0, 4, 4, 0]} animationDuration={1500} />
                </BarChart>
              </ResponsiveContainer>
            </div>
            <div className="flex gap-2 mt-2 flex-wrap">
              {topBehaviors.slice(0, 5).map((beh: any, i: number) => (
                <span key={i} className="text-[9px] font-mono px-2 py-0.5 rounded bg-muted border border-border/50">{beh.type}: {beh.count}</span>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
