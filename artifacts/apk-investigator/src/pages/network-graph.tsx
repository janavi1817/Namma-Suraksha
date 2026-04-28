import React, { useState, useMemo } from "react";
import { Link } from "wouter";
import { useListInvestigations, getListInvestigationsQueryKey } from "@workspace/api-client-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Network, ShieldAlert, Globe, Server, FileCode2, Users, ExternalLink, AlertTriangle, Eye } from "lucide-react";

interface GraphNode {
  id: string;
  label: string;
  type: "apk" | "campaign" | "domain" | "ip";
  risk: string;
  data: Record<string, any>;
}

interface GraphEdge {
  from: string;
  to: string;
  label: string;
}

const TYPE_STYLES: Record<string, { bg: string; border: string; icon: any; label: string }> = {
  campaign: { bg: "bg-red-500/20", border: "border-red-500", icon: Users, label: "Campaign" },
  apk: { bg: "bg-yellow-500/15", border: "border-yellow-500/60", icon: FileCode2, label: "APK" },
  domain: { bg: "bg-blue-500/15", border: "border-blue-500/60", icon: Globe, label: "Domain" },
  ip: { bg: "bg-cyan-500/15", border: "border-cyan-500/60", icon: Server, label: "IP" },
};

const RISK_DOT: Record<string, string> = {
  Critical: "bg-red-500", High: "bg-orange-500", Medium: "bg-yellow-500", Low: "bg-green-500",
};

export default function NetworkGraph() {
  const { data: investigations, isLoading } = useListInvestigations({}, { query: { queryKey: getListInvestigationsQueryKey({}) } });
  const [selectedNode, setSelectedNode] = useState<GraphNode | null>(null);
  const [filterRisk, setFilterRisk] = useState("all");
  const [filterType, setFilterType] = useState("all");

  const { nodes, edges, stats } = useMemo(() => {
    const inv = Array.isArray(investigations) ? investigations : [];
    const nodeMap = new Map<string, GraphNode>();
    const edgeList: GraphEdge[] = [];

    // Campaign nodes
    const campData = new Map<string, { count: number; risks: string[]; threats: Set<string>; apkIds: number[] }>();
    for (const i of inv) {
      if (!i.clusterId) continue;
      const c = campData.get(i.clusterId);
      if (c) { c.count++; c.risks.push(i.riskLevel); c.threats.add(i.primaryThreatType); c.apkIds.push(i.id); }
      else campData.set(i.clusterId, { count: 1, risks: [i.riskLevel], threats: new Set([i.primaryThreatType]), apkIds: [i.id] });
    }
    for (const [cid, d] of campData) {
      const topRisk = d.risks.includes("Critical") ? "Critical" : d.risks.includes("High") ? "High" : "Medium";
      nodeMap.set(cid, { id: cid, label: cid, type: "campaign", risk: topRisk, data: { samples: d.count, threats: [...d.threats].join(", "), topRisk, apkIds: d.apkIds } });
    }

    // APK nodes + edges to campaigns
    for (const i of inv.slice(0, 80)) {
      const aid = `apk-${i.id}`;
      nodeMap.set(aid, { id: aid, label: i.sampleName, type: "apk", risk: i.riskLevel || "Low", data: { id: i.id, package: i.packageName, sha256: i.sha256?.slice(0, 16) + "...", verdict: i.verdict, riskScore: i.riskScore, threat: i.primaryThreatType } });
      if (i.clusterId && nodeMap.has(i.clusterId)) {
        edgeList.push({ from: aid, to: i.clusterId, label: "member_of" });
      }
    }

    const totalEdges = edgeList.length;
    const fraudCount = inv.filter(i => i.verdict === "MALICIOUS").length;
    return { nodes: [...nodeMap.values()], edges: edgeList, stats: { total: inv.length, fraud: fraudCount, campaigns: campData.size, edges: totalEdges } };
  }, [investigations]);

  const filteredNodes = useMemo(() => {
    return nodes.filter(n => {
      if (filterRisk !== "all" && n.risk !== filterRisk) return false;
      if (filterType !== "all" && n.type !== filterType) return false;
      return true;
    });
  }, [nodes, filterRisk, filterType]);

  const campaignNodes = filteredNodes.filter(n => n.type === "campaign");
  const apkNodes = filteredNodes.filter(n => n.type === "apk");

  if (isLoading) {
    return <div className="p-8 max-w-7xl mx-auto space-y-6"><Skeleton className="h-10 w-64" /><Skeleton className="h-[600px] w-full" /></div>;
  }

  return (
    <div className="p-6 md:p-8 max-w-7xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold font-mono uppercase tracking-tight flex items-center gap-2">
            <Network className="h-6 w-6 text-primary" /> Fraud Network Map
          </h1>
          <p className="text-muted-foreground text-sm mt-1">Interactive visualization of APK fraud infrastructure and campaign clusters.</p>
        </div>
      </div>

      {/* Stats bar */}
      <div className="grid grid-cols-4 gap-3">
        {[
          { label: "Total Samples", value: stats.total, color: "text-blue-400" },
          { label: "Malicious", value: stats.fraud, color: "text-red-400" },
          { label: "Campaigns", value: stats.campaigns, color: "text-yellow-400" },
          { label: "Connections", value: stats.edges, color: "text-green-400" },
        ].map(s => (
          <Card key={s.label} className="bg-muted/20">
            <CardContent className="p-3 text-center">
              <div className={`text-2xl font-bold font-mono ${s.color}`}>{s.value}</div>
              <div className="text-[10px] uppercase tracking-wider text-muted-foreground">{s.label}</div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Filters */}
      <div className="flex gap-3 items-center">
        <Select value={filterRisk} onValueChange={setFilterRisk}>
          <SelectTrigger className="w-[150px] bg-muted/30"><SelectValue placeholder="Risk Level" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Risks</SelectItem>
            <SelectItem value="Critical">Critical</SelectItem>
            <SelectItem value="High">High</SelectItem>
            <SelectItem value="Medium">Medium</SelectItem>
            <SelectItem value="Low">Low</SelectItem>
          </SelectContent>
        </Select>
        <Select value={filterType} onValueChange={setFilterType}>
          <SelectTrigger className="w-[150px] bg-muted/30"><SelectValue placeholder="Node Type" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Types</SelectItem>
            <SelectItem value="campaign">Campaigns</SelectItem>
            <SelectItem value="apk">APKs</SelectItem>
          </SelectContent>
        </Select>
        <div className="flex gap-4 ml-auto">
          {Object.entries(TYPE_STYLES).map(([type, s]) => (
            <div key={type} className="flex items-center gap-1.5">
              <div className={`w-3 h-3 rounded-full border ${s.border} ${s.bg}`} />
              <span className="text-[10px] font-mono uppercase text-muted-foreground">{s.label}</span>
            </div>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main graph area */}
        <div className="lg:col-span-2">
          <Card className="overflow-hidden border-border/50">
            <CardContent className="p-0">
              <div className="relative bg-slate-950/80 min-h-[600px] overflow-auto p-6">
                {/* Radial layout: campaigns in center ring, APKs around them */}
                <div className="space-y-8">
                  {campaignNodes.map((camp) => {
                    const connectedApks = edges.filter(e => e.to === camp.id).map(e => e.from);
                    const relatedApks = apkNodes.filter(a => connectedApks.includes(a.id));
                    const style = TYPE_STYLES[camp.type];
                    const isSelected = selectedNode?.id === camp.id;

                    return (
                      <div key={camp.id} className="relative">
                        {/* Campaign header */}
                        <button
                          onClick={() => setSelectedNode(camp)}
                          className={`flex items-center gap-3 p-3 rounded-lg border transition-all w-full text-left ${
                            isSelected ? "border-red-500 bg-red-500/10 shadow-lg shadow-red-500/10" : "border-border/30 bg-muted/10 hover:border-red-500/50 hover:bg-red-500/5"
                          }`}
                        >
                          <div className={`w-10 h-10 rounded-full ${style.bg} border ${style.border} flex items-center justify-center shrink-0`}>
                            <Users className="h-5 w-5 text-red-400" />
                          </div>
                          <div className="min-w-0 flex-1">
                            <div className="flex items-center gap-2">
                              <span className="font-mono font-bold text-sm text-red-400">{camp.label}</span>
                              <div className={`w-2 h-2 rounded-full ${RISK_DOT[camp.risk] || "bg-gray-500"}`} />
                              <Badge variant="outline" className="text-[9px] h-4">{camp.data.samples} samples</Badge>
                            </div>
                            <p className="text-[11px] text-muted-foreground truncate">{camp.data.threats}</p>
                          </div>
                          <AlertTriangle className="h-4 w-4 text-red-400/50 shrink-0" />
                        </button>

                        {/* Connected APKs */}
                        {relatedApks.length > 0 && (
                          <div className="ml-6 mt-2 pl-4 border-l-2 border-red-500/20 space-y-1.5">
                            {relatedApks.map((apk) => {
                              const isApkSelected = selectedNode?.id === apk.id;
                              return (
                                <button
                                  key={apk.id}
                                  onClick={() => setSelectedNode(apk)}
                                  className={`flex items-center gap-2.5 p-2 rounded-md w-full text-left transition-all ${
                                    isApkSelected ? "bg-yellow-500/10 border border-yellow-500/40" : "hover:bg-muted/20 border border-transparent"
                                  }`}
                                >
                                  <div className={`w-2 h-2 rounded-full ${RISK_DOT[apk.risk] || "bg-gray-500"} shrink-0`} />
                                  <FileCode2 className="h-3.5 w-3.5 text-yellow-500/70 shrink-0" />
                                  <span className="font-mono text-xs truncate flex-1">{apk.label}</span>
                                  <span className="text-[10px] text-muted-foreground shrink-0">{apk.data.riskScore}/100</span>
                                  <Badge variant="outline" className={`text-[8px] h-3.5 shrink-0 ${
                                    apk.data.verdict === "MALICIOUS" ? "border-red-500/40 text-red-400" :
                                    apk.data.verdict === "SUSPICIOUS" ? "border-yellow-500/40 text-yellow-400" :
                                    "border-green-500/40 text-green-400"
                                  }`}>{apk.data.verdict}</Badge>
                                </button>
                              );
                            })}
                          </div>
                        )}
                      </div>
                    );
                  })}

                  {/* Unlinked APKs */}
                  {(() => {
                    const linkedIds = new Set(edges.map(e => e.from));
                    const unlinked = apkNodes.filter(a => !linkedIds.has(a.id));
                    if (unlinked.length === 0) return null;
                    return (
                      <div className="pt-4 border-t border-border/20">
                        <p className="text-xs font-mono text-muted-foreground uppercase mb-3">Unlinked Samples ({unlinked.length})</p>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5">
                          {unlinked.slice(0, 20).map(apk => (
                            <button
                              key={apk.id}
                              onClick={() => setSelectedNode(apk)}
                              className={`flex items-center gap-2 p-1.5 rounded text-left transition-all ${
                                selectedNode?.id === apk.id ? "bg-muted/30 border border-border" : "hover:bg-muted/10 border border-transparent"
                              }`}
                            >
                              <div className={`w-1.5 h-1.5 rounded-full ${RISK_DOT[apk.risk] || "bg-gray-500"}`} />
                              <span className="font-mono text-[11px] truncate">{apk.label}</span>
                            </button>
                          ))}
                        </div>
                      </div>
                    );
                  })()}
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Detail panel */}
        <div className="space-y-4">
          <Card className="sticky top-6">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-mono uppercase flex items-center gap-2">
                <Eye className="h-4 w-4" /> {selectedNode ? "Node Inspector" : "Select a Node"}
              </CardTitle>
            </CardHeader>
            <CardContent>
              {selectedNode ? (() => {
                const style = TYPE_STYLES[selectedNode.type];
                const Icon = style.icon;
                return (
                  <div className="space-y-4">
                    <div className="flex items-center gap-3">
                      <div className={`w-10 h-10 rounded-full ${style.bg} border ${style.border} flex items-center justify-center`}>
                        <Icon className="h-5 w-5" />
                      </div>
                      <div className="min-w-0">
                        <p className="font-mono font-bold text-sm truncate">{selectedNode.label}</p>
                        <div className="flex items-center gap-2 mt-0.5">
                          <Badge variant="outline" className="text-[9px]">{style.label}</Badge>
                          <div className={`w-2 h-2 rounded-full ${RISK_DOT[selectedNode.risk]}`} />
                          <span className="text-[10px] text-muted-foreground">{selectedNode.risk}</span>
                        </div>
                      </div>
                    </div>

                    <div className="space-y-2 pt-3 border-t border-border/30">
                      {Object.entries(selectedNode.data).filter(([k]) => k !== "apkIds").map(([key, val]) => (
                        <div key={key} className="flex justify-between items-start gap-2">
                          <span className="text-[11px] text-muted-foreground capitalize">{key.replace(/([A-Z])/g, " $1")}</span>
                          <span className="font-mono text-[11px] text-right max-w-[160px] truncate">{String(val)}</span>
                        </div>
                      ))}
                    </div>

                    {selectedNode.type === "apk" && selectedNode.data.id && (
                      <Button variant="outline" size="sm" className="w-full mt-2" asChild>
                        <Link href={`/investigations/${selectedNode.data.id}`}>
                          <ExternalLink className="h-3 w-3 mr-2" /> View Full Investigation
                        </Link>
                      </Button>
                    )}
                  </div>
                );
              })() : (
                <div className="text-center py-10 text-muted-foreground">
                  <Network className="h-12 w-12 mx-auto mb-3 opacity-20" />
                  <p className="text-sm">Click any campaign or APK node to inspect its details.</p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Quick stats */}
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-xs font-mono uppercase text-muted-foreground">Top Campaigns</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              {campaignNodes.sort((a, b) => (b.data.samples || 0) - (a.data.samples || 0)).slice(0, 5).map(c => (
                <button key={c.id} onClick={() => setSelectedNode(c)} className="flex items-center justify-between w-full p-1.5 rounded hover:bg-muted/20 transition-colors">
                  <div className="flex items-center gap-2">
                    <div className={`w-2 h-2 rounded-full ${RISK_DOT[c.risk]}`} />
                    <span className="font-mono text-xs">{c.label}</span>
                  </div>
                  <span className="text-[10px] text-muted-foreground">{c.data.samples} APKs</span>
                </button>
              ))}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
