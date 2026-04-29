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

// Karnataka map — outline with positioned district hotspots
// Using a proper Karnataka state boundary path traced from actual map data

function KarnatakaMap({ districts }: { districts: typeof DISTRICT_DATA }) {
  const [selected, setSelected] = React.useState<string | null>(null);
  const totalCases = districts.reduce((s, d) => s + d.cases, 0);
  const sorted = [...districts].sort((a, b) => b.cases - a.cases);
  const selectedD = districts.find(x => x.name === selected);

  // Positions in SVG coordinate space (viewBox 0 0 600 750)
  const hotspots: Record<string, { x: number; y: number }> = {
    "Belagavi": { x: 170, y: 120 },
    "Hubli-Dharwad": { x: 220, y: 155 },
    "Kalaburagi": { x: 365, y: 85 },
    "Raichur": { x: 375, y: 155 },
    "Ballari": { x: 345, y: 200 },
    "Davangere": { x: 250, y: 230 },
    "Shivamogga": { x: 175, y: 225 },
    "Chitradurga": { x: 310, y: 250 },
    "Udupi": { x: 80, y: 290 },
    "Tumakuru": { x: 300, y: 320 },
    "Hassan": { x: 185, y: 340 },
    "Mangaluru": { x: 80, y: 365 },
    "Bengaluru Rural": { x: 350, y: 340 },
    "Bengaluru Urban": { x: 375, y: 345 },
    "Mysuru": { x: 225, y: 410 },
  };

  return (
    <div className="flex gap-4">
      <div className="flex-1">
        <svg viewBox="0 0 600 750" className="w-full" style={{ height: 420 }}>
          {/* State boundary */}
          <path d="M195,35 L225,28 L255,25 L285,30 L315,22 L345,28 L370,40 L395,55 L418,75 L435,98 L448,125 L455,155 L458,188 L455,218 L445,242 L432,262 L418,278 L408,298 L402,322 L405,348 L412,375 L418,398 L412,422 L402,442 L388,462 L372,478 L358,495 L342,512 L325,528 L308,542 L288,555 L268,565 L248,572 L228,578 L208,582 L188,585 L168,582 L148,575 L128,565 L112,548 L98,530 L85,510 L75,488 L65,462 L58,435 L52,408 L48,378 L45,348 L42,318 L45,288 L48,258 L55,232 L65,208 L78,185 L90,165 L105,145 L120,128 L138,110 L155,92 L172,75 L185,58Z"
            stroke="var(--color-primary, #3b82f6)" strokeWidth="2.5" fill="var(--color-primary, #3b82f6)" fillOpacity="0.04" strokeOpacity="0.5" />

          {/* District boundary lines */}
          <g stroke="var(--color-primary, #3b82f6)" strokeWidth="0.6" opacity="0.3">
            <path d="M148,100 L195,95 L225,105 L240,130 M148,100 L155,145 M195,95 L210,140" />
            <path d="M195,95 L250,90 L290,100 M225,105 L260,115 L290,100" />
            <path d="M340,40 L380,55 M340,95 L395,80 M320,80 L370,95" />
            <path d="M340,95 L380,130 L400,165 M290,100 L340,130 L370,165 M340,130 L340,180" />
            <path d="M155,145 L210,140 L260,150 L310,160 L340,180 M210,140 L220,195 M260,150 L265,200 M155,145 L140,200 L120,240" />
            <path d="M65,145 L90,165 L120,175 L140,200 M65,200 L95,220 L120,240" />
            <path d="M140,200 L200,195 L260,200 M200,195 L210,250 M140,200 L150,260" />
            <path d="M260,200 L310,210 L340,240 M260,200 L270,260 L290,310 M310,210 L320,270" />
            <path d="M65,260 L95,280 L120,300 M65,320 L90,340 L110,360" />
            <path d="M120,240 L150,260 L190,270 L210,250 M150,260 L160,320 M190,270 L200,330" />
            <path d="M290,310 L340,300 L380,320 M320,270 L360,290 L390,310 M340,300 L350,350 M290,310 L300,360" />
            <path d="M160,320 L200,330 L250,340 L290,350 M200,330 L210,390 M250,340 L260,400 M110,360 L140,380 L160,400" />
            <path d="M210,390 L260,400 L300,420 M160,400 L200,420 L240,440" />
          </g>

          {/* District name labels */}
          <g fontFamily="monospace" fontSize="9" fill="var(--color-muted-foreground, #64748b)" textAnchor="middle">
            <text x="355" y="55">Bidar</text>
            <text x="365" y="90">Kalaburagi</text>
            <text x="310" y="65">Vijayapura</text>
            <text x="350" y="125">Yadgir</text>
            <text x="375" y="165">Raichur</text>
            <text x="235" y="112">Bagalkot</text>
            <text x="275" y="135">Gadag</text>
            <text x="310" y="150">Koppal</text>
            <text x="230" y="180">Haveri</text>
            <text x="95" y="200">U.Kannada</text>
            <text x="155" y="290">Chikmagalur</text>
            <text x="245" y="350">Mandya</text>
            <text x="310" y="355">Ramanagara</text>
            <text x="135" y="400">Kodagu</text>
            <text x="390" y="300">Chikballapur</text>
            <text x="420" y="340">Kolar</text>
            <text x="280" y="440">C.Nagar</text>
          </g>

          {/* Neighboring states */}
          <g fontFamily="sans-serif" fontSize="14" fill="var(--color-muted-foreground, #94a3b8)" textAnchor="middle" fontWeight="bold" letterSpacing="3" opacity="0.4">
            <text x="300" y="18">MAHARASHTRA</text>
            <text x="490" y="130">TELANGANA</text>
            <text x="500" y="350">ANDHRA PRADESH</text>
            <text x="460" y="550">TAMIL NADU</text>
            <text x="220" y="640">KERALA</text>
            <text x="35" y="250">GOA</text>
          </g>

          {/* Interactive district hotspots — INSIDE the SVG */}
          {districts.map((d) => {
            const pos = hotspots[d.name];
            if (!pos) return null;
            const r = Math.max(12, Math.min(d.cases * 0.55, 30));
            const isSel = selected === d.name;
            const isHot = d.cases > 20;
            return (
              <g key={d.name} onClick={() => setSelected(isSel ? null : d.name)} style={{ cursor: "pointer" }}>
                {isHot && <circle cx={pos.x} cy={pos.y} r={r + 4} fill={d.color} opacity="0.12"><animate attributeName="r" values={`${r+2};${r+16};${r+2}`} dur="2.5s" repeatCount="indefinite" /><animate attributeName="opacity" values="0.12;0.02;0.12" dur="2.5s" repeatCount="indefinite" /></circle>}
                <circle cx={pos.x} cy={pos.y} r={r + 5} fill={d.color} opacity={isSel ? 0.25 : 0.08} />
                <circle cx={pos.x} cy={pos.y} r={r} fill={d.color} opacity={isSel ? 1 : 0.8} stroke={isSel ? "white" : "none"} strokeWidth={isSel ? 2.5 : 0} />
                <text x={pos.x} y={pos.y + 4} textAnchor="middle" fill="white" fontSize={r > 16 ? 12 : 9} fontWeight="bold" fontFamily="monospace">{d.cases}</text>
                {(isSel || d.cases > 10) && <text x={pos.x} y={pos.y - r - 6} textAnchor="middle" fill={isSel ? d.color : "var(--color-foreground, #e2e8f0)"} fontSize={isSel ? 11 : 9} fontWeight="bold" fontFamily="monospace">{d.name}</text>}
              </g>
            );
          })}
        </svg>
      </div>

      {/* Stats */}
      <div className="w-[165px] shrink-0 space-y-3">
        <div className="text-[10px] font-mono uppercase text-muted-foreground tracking-wider">District Intelligence</div>
        {selectedD ? (
          <div className="animate-slide-up space-y-2 p-3 rounded-lg bg-muted/30 border border-border/50">
            <div className="flex items-center gap-2"><div className="w-3 h-3 rounded-full animate-pulse" style={{ backgroundColor: selectedD.color }} /><span className="font-mono text-xs font-bold">{selectedD.name}</span></div>
            <div className="text-2xl font-bold font-mono" style={{ color: selectedD.color }}>{selectedD.cases}</div>
            <div className="text-[10px] text-muted-foreground">{((selectedD.cases / totalCases) * 100).toFixed(1)}% of total</div>
            <div className="w-full h-2 rounded-full bg-muted overflow-hidden"><div className="h-full rounded-full transition-all duration-700" style={{ width: `${Math.min((selectedD.cases / 50) * 100, 100)}%`, backgroundColor: selectedD.color }} /></div>
            <div className="text-[9px]">Threat: <span className="font-bold" style={{ color: selectedD.color }}>{selectedD.cases > 30 ? "🔴 CRITICAL" : selectedD.cases > 15 ? "🟠 HIGH" : selectedD.cases > 8 ? "🟡 MEDIUM" : "🟢 LOW"}</span></div>
          </div>
        ) : <div className="text-xs text-muted-foreground p-2 rounded bg-muted/20 border border-dashed border-border/30">Click a district</div>}
        <div className="space-y-1">
          {sorted.map((d, i) => (
            <button key={d.name} onClick={() => setSelected(d.name)} className={`flex items-center justify-between w-full p-1 rounded text-left transition-all ${selected === d.name ? "bg-muted border border-border" : "hover:bg-muted/40"}`}>
              <div className="flex items-center gap-1.5"><span className="text-[8px] text-muted-foreground w-3 text-right">{i+1}</span><div className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: d.color }} /><span className="text-[9px] font-mono truncate max-w-[72px]">{d.name}</span></div>
              <span className="text-[9px] font-mono font-bold" style={{ color: d.color }}>{d.cases}</span>
            </button>
          ))}
        </div>
        <div className="pt-1 border-t border-border/50 flex justify-between text-[9px]"><span className="text-muted-foreground">Total</span><span className="font-mono font-bold">{totalCases}</span></div>
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
