import React, { useState, useMemo } from "react";
import { Link } from "wouter";
import { useListInvestigations, getListInvestigationsQueryKey } from "@workspace/api-client-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import { Network, FileCode2, Users, ExternalLink, Eye, ChevronDown, ChevronRight, ShieldAlert, AlertTriangle, Search } from "lucide-react";
import { Input } from "@/components/ui/input";

const RISK_COLOR: Record<string, string> = {
  Critical: "#ef4444", High: "#f97316", Medium: "#eab308", Low: "#22c55e",
};
const RISK_BG: Record<string, string> = {
  Critical: "bg-red-500/15 border-red-500/40 text-red-400",
  High: "bg-orange-500/15 border-orange-500/40 text-orange-400",
  Medium: "bg-yellow-500/15 border-yellow-500/40 text-yellow-400",
  Low: "bg-green-500/15 border-green-500/40 text-green-400",
};

interface CampaignGroup {
  id: string;
  topRisk: string;
  threats: string[];
  members: Array<{ id: number; name: string; risk: string; score: number; verdict: string; threat: string; sha: string }>;
}

export default function NetworkGraph() {
  const { data: investigations, isLoading } = useListInvestigations({}, { query: { queryKey: getListInvestigationsQueryKey({}) } });
  const [expandedCamps, setExpandedCamps] = useState<Set<string>>(new Set());
  const [selectedApk, setSelectedApk] = useState<any>(null);
  const [search, setSearch] = useState("");

  const { campaigns, unlinked, stats } = useMemo(() => {
    const inv = Array.isArray(investigations) ? investigations : [];
    const campMap = new Map<string, CampaignGroup>();

    for (const i of inv) {
      if (i.clusterId) {
        let c = campMap.get(i.clusterId);
        if (!c) { c = { id: i.clusterId, topRisk: "Low", threats: [], members: [] }; campMap.set(i.clusterId, c); }
        c.members.push({ id: i.id, name: i.sampleName, risk: i.riskLevel, score: i.riskScore, verdict: i.verdict, threat: i.primaryThreatType, sha: i.sha256?.slice(0, 12) + "..." });
        if (!c.threats.includes(i.primaryThreatType)) c.threats.push(i.primaryThreatType);
        const rank = { Critical: 4, High: 3, Medium: 2, Low: 1 };
        if ((rank[i.riskLevel as keyof typeof rank] || 0) > (rank[c.topRisk as keyof typeof rank] || 0)) c.topRisk = i.riskLevel;
      }
    }

    const unlinkedList = inv.filter(i => !i.clusterId).slice(0, 30).map(i => ({
      id: i.id, name: i.sampleName, risk: i.riskLevel, score: i.riskScore, verdict: i.verdict, threat: i.primaryThreatType, sha: i.sha256?.slice(0, 12) + "...",
    }));

    const sorted = [...campMap.values()].sort((a, b) => b.members.length - a.members.length);
    return {
      campaigns: sorted,
      unlinked: unlinkedList,
      stats: { total: inv.length, malicious: inv.filter(i => i.verdict === "MALICIOUS").length, campaigns: campMap.size, linked: inv.filter(i => i.clusterId).length },
    };
  }, [investigations]);

  const toggleCamp = (id: string) => {
    setExpandedCamps(prev => { const n = new Set(prev); n.has(id) ? n.delete(id) : n.add(id); return n; });
  };

  const expandAll = () => setExpandedCamps(new Set(campaigns.map(c => c.id)));
  const collapseAll = () => setExpandedCamps(new Set());

  const filteredCampaigns = search
    ? campaigns.filter(c => c.id.toLowerCase().includes(search.toLowerCase()) || c.members.some(m => m.name.toLowerCase().includes(search.toLowerCase())))
    : campaigns;

  if (isLoading) return <div className="p-8 space-y-4"><Skeleton className="h-10 w-64" /><Skeleton className="h-[500px]" /></div>;

  return (
    <div className="p-6 md:p-8 max-w-7xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-bold font-mono uppercase tracking-tight flex items-center gap-2">
          <Network className="h-6 w-6 text-primary" /> Fraud Network Tree
        </h1>
        <p className="text-muted-foreground text-sm mt-1">Visual tree of fraud campaign clusters and their connected APK samples.</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {[
          { label: "Total Samples", val: stats.total, color: "text-blue-400", icon: FileCode2 },
          { label: "Malicious", val: stats.malicious, color: "text-red-400", icon: AlertTriangle },
          { label: "Campaign Clusters", val: stats.campaigns, color: "text-yellow-400", icon: Users },
          { label: "Linked to Campaigns", val: stats.linked, color: "text-green-400", icon: Network },
        ].map(s => (
          <Card key={s.label} className="bg-card/50">
            <CardContent className="p-4 flex items-center gap-3">
              <s.icon className={`h-5 w-5 ${s.color} shrink-0`} />
              <div>
                <div className={`text-xl font-bold font-mono ${s.color}`}>{s.val}</div>
                <div className="text-[10px] uppercase tracking-wider text-muted-foreground">{s.label}</div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Controls */}
      <div className="flex items-center gap-3">
        <div className="relative flex-1 max-w-xs">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input placeholder="Search campaigns or APKs..." value={search} onChange={e => setSearch(e.target.value)} className="pl-9 bg-muted/30" />
        </div>
        <Button variant="outline" size="sm" onClick={expandAll} className="text-xs">Expand All</Button>
        <Button variant="outline" size="sm" onClick={collapseAll} className="text-xs">Collapse All</Button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Tree */}
        <div className="lg:col-span-2 space-y-1">
          {/* Root node */}
          <div className="flex items-center gap-3 p-3 rounded-lg bg-primary/10 border border-primary/30 mb-4">
            <div className="w-10 h-10 rounded-full bg-primary/20 border-2 border-primary flex items-center justify-center">
              <ShieldAlert className="h-5 w-5 text-primary" />
            </div>
            <div>
              <span className="font-mono font-bold text-primary">RAKSHAK THREAT INTELLIGENCE</span>
              <p className="text-xs text-muted-foreground">{stats.campaigns} campaign clusters • {stats.total} samples analyzed</p>
            </div>
          </div>

          {/* Campaign branches */}
          {filteredCampaigns.map((camp, ci) => {
            const isExpanded = expandedCamps.has(camp.id);
            const isLast = ci === filteredCampaigns.length - 1 && unlinked.length === 0;
            return (
              <div key={camp.id} className="relative">
                {/* Tree connector line */}
                <div className="absolute left-5 top-0 w-px bg-border/40" style={{ height: isExpanded ? "100%" : "50%" }} />
                {!isLast && <div className="absolute left-5 top-0 bottom-0 w-px bg-border/30" />}

                {/* Campaign node */}
                <button onClick={() => toggleCamp(camp.id)} className="relative flex items-center gap-3 w-full p-3 rounded-lg hover:bg-muted/20 transition-all group ml-3">
                  {/* Horizontal connector */}
                  <div className="absolute left-0 top-1/2 w-3 h-px bg-border/40" />

                  <div className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 border-2 ${
                    camp.topRisk === "Critical" ? "bg-red-500/20 border-red-500" :
                    camp.topRisk === "High" ? "bg-orange-500/20 border-orange-500" :
                    "bg-yellow-500/20 border-yellow-500"
                  }`}>
                    <Users className="h-4 w-4" />
                  </div>

                  {isExpanded ? <ChevronDown className="h-4 w-4 text-muted-foreground shrink-0" /> : <ChevronRight className="h-4 w-4 text-muted-foreground shrink-0" />}

                  <div className="flex-1 text-left min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="font-mono font-bold text-sm">{camp.id}</span>
                      <Badge className={`text-[9px] h-4 border ${RISK_BG[camp.topRisk]}`}>{camp.topRisk}</Badge>
                      <span className="text-[10px] text-muted-foreground">{camp.members.length} APKs</span>
                    </div>
                    <p className="text-[11px] text-muted-foreground truncate">{camp.threats.join(" • ")}</p>
                  </div>
                </button>

                {/* APK leaf nodes */}
                {isExpanded && (
                  <div className="ml-12 space-y-0.5 pb-2">
                    {camp.members.map((apk, ai) => {
                      const isLastApk = ai === camp.members.length - 1;
                      return (
                        <div key={apk.id} className="relative">
                          {/* Tree connectors */}
                          {!isLastApk && <div className="absolute left-2 top-0 bottom-0 w-px bg-border/20" />}
                          <div className="absolute left-2 top-1/2 w-4 h-px bg-border/20" />

                          <button
                            onClick={() => setSelectedApk(apk)}
                            className={`relative flex items-center gap-2 w-full p-2 pl-8 rounded-md transition-all text-left ${
                              selectedApk?.id === apk.id ? "bg-primary/10 border border-primary/30" : "hover:bg-muted/15"
                            }`}
                          >
                            <div className="w-5 h-5 rounded flex items-center justify-center shrink-0" style={{ backgroundColor: RISK_COLOR[apk.risk] + "20", border: `1px solid ${RISK_COLOR[apk.risk]}50` }}>
                              <FileCode2 className="h-3 w-3" style={{ color: RISK_COLOR[apk.risk] }} />
                            </div>
                            <span className="font-mono text-xs truncate flex-1">{apk.name}</span>
                            <span className="text-[10px] font-mono text-muted-foreground w-8 text-right">{apk.score}</span>
                            <Badge variant="outline" className={`text-[8px] h-4 ${
                              apk.verdict === "MALICIOUS" ? "border-red-500/40 text-red-400" :
                              apk.verdict === "SUSPICIOUS" ? "border-yellow-500/40 text-yellow-400" :
                              "border-green-500/40 text-green-400"
                            }`}>{apk.verdict}</Badge>
                          </button>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            );
          })}

          {/* Unlinked samples */}
          {unlinked.length > 0 && (
            <div className="pt-4 mt-4 border-t border-border/20">
              <p className="text-xs font-mono text-muted-foreground uppercase mb-2 ml-3">Unlinked Samples ({unlinked.length})</p>
              <div className="ml-12 space-y-0.5">
                {unlinked.slice(0, 15).map(apk => (
                  <button
                    key={apk.id}
                    onClick={() => setSelectedApk(apk)}
                    className={`flex items-center gap-2 w-full p-1.5 pl-4 rounded text-left transition-all ${
                      selectedApk?.id === apk.id ? "bg-muted/30" : "hover:bg-muted/10"
                    }`}
                  >
                    <div className="w-1.5 h-1.5 rounded-full shrink-0" style={{ backgroundColor: RISK_COLOR[apk.risk] }} />
                    <span className="font-mono text-[11px] truncate flex-1">{apk.name}</span>
                    <span className="text-[10px] text-muted-foreground">{apk.score}</span>
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Inspector panel */}
        <div>
          <Card className="sticky top-6">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-mono uppercase flex items-center gap-2">
                <Eye className="h-4 w-4" /> {selectedApk ? "APK Details" : "Select an APK"}
              </CardTitle>
            </CardHeader>
            <CardContent>
              {selectedApk ? (
                <div className="space-y-4">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-lg flex items-center justify-center" style={{ backgroundColor: RISK_COLOR[selectedApk.risk] + "20", border: `2px solid ${RISK_COLOR[selectedApk.risk]}` }}>
                      <FileCode2 className="h-5 w-5" style={{ color: RISK_COLOR[selectedApk.risk] }} />
                    </div>
                    <div className="min-w-0">
                      <p className="font-mono font-bold text-sm truncate">{selectedApk.name}</p>
                      <div className="flex items-center gap-2 mt-0.5">
                        <Badge className={`text-[9px] border ${RISK_BG[selectedApk.risk]}`}>{selectedApk.risk}</Badge>
                        <Badge variant="outline" className={`text-[9px] ${
                          selectedApk.verdict === "MALICIOUS" ? "border-red-500/40 text-red-400" :
                          selectedApk.verdict === "SUSPICIOUS" ? "border-yellow-500/40 text-yellow-400" :
                          "border-green-500/40 text-green-400"
                        }`}>{selectedApk.verdict}</Badge>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-2.5 pt-3 border-t border-border/30">
                    <div className="flex justify-between"><span className="text-xs text-muted-foreground">Risk Score</span><span className="font-mono text-sm font-bold" style={{ color: RISK_COLOR[selectedApk.risk] }}>{selectedApk.score}/100</span></div>
                    <div className="flex justify-between"><span className="text-xs text-muted-foreground">Threat Type</span><span className="font-mono text-xs">{selectedApk.threat}</span></div>
                    <div className="flex justify-between"><span className="text-xs text-muted-foreground">SHA256</span><span className="font-mono text-xs">{selectedApk.sha}</span></div>
                  </div>

                  {/* Risk bar */}
                  <div className="pt-2">
                    <div className="flex justify-between text-[10px] text-muted-foreground mb-1"><span>Risk</span><span>{selectedApk.score}%</span></div>
                    <div className="w-full h-2 rounded-full bg-muted overflow-hidden">
                      <div className="h-full rounded-full transition-all duration-500" style={{ width: `${selectedApk.score}%`, backgroundColor: RISK_COLOR[selectedApk.risk] }} />
                    </div>
                  </div>

                  <Button variant="outline" size="sm" className="w-full" asChild>
                    <Link href={`/investigations/${selectedApk.id}`}>
                      <ExternalLink className="h-3 w-3 mr-2" /> View Full Report
                    </Link>
                  </Button>
                </div>
              ) : (
                <div className="text-center py-12 text-muted-foreground">
                  <Network className="h-10 w-10 mx-auto mb-3 opacity-20" />
                  <p className="text-sm">Click any APK in the tree to see its details here.</p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
