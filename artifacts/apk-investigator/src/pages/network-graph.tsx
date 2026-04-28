import React, { useState, useMemo } from "react";
import { useListInvestigations, getListInvestigationsQueryKey } from "@workspace/api-client-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Network, ShieldAlert, Globe, Server, FileCode2, Users } from "lucide-react";

interface GraphNode {
  id: string;
  label: string;
  type: "apk" | "campaign" | "domain" | "ip" | "certificate";
  risk: "critical" | "high" | "medium" | "low";
  connections: number;
  details: Record<string, string>;
}

const NODE_COLORS = {
  apk: { bg: "bg-yellow-500", ring: "ring-yellow-500/30", text: "text-yellow-400" },
  campaign: { bg: "bg-red-500", ring: "ring-red-500/30", text: "text-red-400" },
  domain: { bg: "bg-blue-500", ring: "ring-blue-500/30", text: "text-blue-400" },
  ip: { bg: "bg-blue-400", ring: "ring-blue-400/30", text: "text-blue-300" },
  certificate: { bg: "bg-green-500", ring: "ring-green-500/30", text: "text-green-400" },
};

const RISK_COLORS = {
  critical: "bg-red-500/20 text-red-400 border-red-500/30",
  high: "bg-orange-500/20 text-orange-400 border-orange-500/30",
  medium: "bg-yellow-500/20 text-yellow-400 border-yellow-500/30",
  low: "bg-green-500/20 text-green-400 border-green-500/30",
};

export default function NetworkGraph() {
  const { data: investigations, isLoading } = useListInvestigations({}, {
    query: { queryKey: getListInvestigationsQueryKey({}) }
  });
  const [selectedNode, setSelectedNode] = useState<GraphNode | null>(null);

  const { nodes, edges } = useMemo(() => {
    const inv = Array.isArray(investigations) ? investigations : [];
    const nodeMap = new Map<string, GraphNode>();
    const edgeList: { from: string; to: string }[] = [];

    // Build campaign nodes
    const campaigns = new Map<string, { count: number; risk: string }>();
    for (const i of inv) {
      if (i.clusterId) {
        const c = campaigns.get(i.clusterId);
        if (c) c.count++;
        else campaigns.set(i.clusterId, { count: 1, risk: i.riskLevel });
      }
    }
    for (const [cid, data] of campaigns) {
      nodeMap.set(cid, {
        id: cid, label: cid, type: "campaign",
        risk: data.risk.toLowerCase() as any,
        connections: data.count,
        details: { "Total APKs": String(data.count), "Type": "Criminal Campaign" },
      });
    }

    // Build APK nodes and edges
    for (const i of inv.slice(0, 60)) {
      const apkId = `apk-${i.id}`;
      const riskKey = (i.riskLevel || "low").toLowerCase() as any;
      nodeMap.set(apkId, {
        id: apkId, label: i.sampleName, type: "apk", risk: riskKey,
        connections: i.clusterId ? 2 : 1,
        details: {
          "Package": i.packageName || "Unknown",
          "SHA256": i.sha256.slice(0, 16) + "...",
          "Verdict": i.verdict,
          "Risk Score": `${i.riskScore}/100`,
          "Threat Type": i.primaryThreatType,
        },
      });
      if (i.clusterId && nodeMap.has(i.clusterId)) {
        edgeList.push({ from: apkId, to: i.clusterId });
      }
    }

    return { nodes: [...nodeMap.values()], edges: edgeList };
  }, [investigations]);

  const campaignNodes = nodes.filter(n => n.type === "campaign");
  const apkNodes = nodes.filter(n => n.type === "apk");

  if (isLoading) {
    return (
      <div className="p-6 md:p-8 max-w-7xl mx-auto space-y-6">
        <Skeleton className="h-10 w-64" />
        <Skeleton className="h-[600px] w-full" />
      </div>
    );
  }

  return (
    <div className="p-6 md:p-8 max-w-7xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-bold font-mono uppercase tracking-tight text-foreground flex items-center gap-2">
          <Network className="h-6 w-6 text-primary" /> Fraud Network Map
        </h1>
        <p className="text-muted-foreground text-sm mt-1">Visual mapping of connected APKs, campaigns, and infrastructure.</p>
      </div>

      <div className="grid grid-cols-4 gap-3">
        <div className="flex items-center gap-2 p-2 rounded bg-muted/30 border border-border/50">
          <div className="w-3 h-3 rounded-full bg-red-500" />
          <span className="text-xs font-mono">Campaign ({campaignNodes.length})</span>
        </div>
        <div className="flex items-center gap-2 p-2 rounded bg-muted/30 border border-border/50">
          <div className="w-3 h-3 rounded-full bg-yellow-500" />
          <span className="text-xs font-mono">APK ({apkNodes.length})</span>
        </div>
        <div className="flex items-center gap-2 p-2 rounded bg-muted/30 border border-border/50">
          <div className="w-3 h-3 rounded-full bg-blue-500" />
          <span className="text-xs font-mono">Domain / IP</span>
        </div>
        <div className="flex items-center gap-2 p-2 rounded bg-muted/30 border border-border/50">
          <div className="w-3 h-3 rounded-full bg-green-500" />
          <span className="text-xs font-mono">Certificate</span>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Graph visualization area */}
        <div className="lg:col-span-2">
          <Card className="overflow-hidden">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-mono uppercase">Network Topology</CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              <div className="relative h-[550px] bg-slate-950/50 overflow-auto p-6">
                {/* Campaign cluster nodes */}
                <div className="flex flex-wrap gap-8 justify-center">
                  {campaignNodes.map((camp) => {
                    const connectedApks = edges.filter(e => e.to === camp.id).map(e => e.from);
                    const relatedApks = apkNodes.filter(a => connectedApks.includes(a.id));
                    return (
                      <div key={camp.id} className="flex flex-col items-center gap-4">
                        {/* Campaign hub */}
                        <button
                          onClick={() => setSelectedNode(camp)}
                          className={`relative w-16 h-16 rounded-full ${NODE_COLORS.campaign.bg} flex items-center justify-center ring-4 ${NODE_COLORS.campaign.ring} hover:scale-110 transition-transform cursor-pointer shadow-lg shadow-red-500/20 ${selectedNode?.id === camp.id ? "ring-white scale-110" : ""}`}
                        >
                          <Users className="h-6 w-6 text-white" />
                          <span className="absolute -top-1 -right-1 w-5 h-5 rounded-full bg-background text-[10px] font-bold flex items-center justify-center border border-red-500">
                            {relatedApks.length}
                          </span>
                        </button>
                        <span className="text-[10px] font-mono text-red-400 max-w-[80px] text-center truncate">{camp.label}</span>

                        {/* Connected APK nodes */}
                        <div className="flex flex-wrap gap-2 justify-center max-w-[200px]">
                          {relatedApks.slice(0, 8).map((apk) => (
                            <button
                              key={apk.id}
                              onClick={() => setSelectedNode(apk)}
                              className={`w-8 h-8 rounded-full ${NODE_COLORS.apk.bg} flex items-center justify-center hover:scale-125 transition-transform cursor-pointer ring-2 ${NODE_COLORS.apk.ring} ${selectedNode?.id === apk.id ? "ring-white scale-125" : ""}`}
                              title={apk.label}
                            >
                              <FileCode2 className="h-3 w-3 text-white" />
                            </button>
                          ))}
                          {relatedApks.length > 8 && (
                            <div className="w-8 h-8 rounded-full bg-muted flex items-center justify-center text-[10px] font-bold">
                              +{relatedApks.length - 8}
                            </div>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>

                {/* Unlinked APKs */}
                {apkNodes.filter(a => !edges.some(e => e.from === a.id)).length > 0 && (
                  <div className="mt-8 pt-6 border-t border-border/30">
                    <p className="text-xs font-mono text-muted-foreground mb-3 uppercase">Unlinked Samples</p>
                    <div className="flex flex-wrap gap-2">
                      {apkNodes.filter(a => !edges.some(e => e.from === a.id)).slice(0, 20).map((apk) => (
                        <button
                          key={apk.id}
                          onClick={() => setSelectedNode(apk)}
                          className={`w-7 h-7 rounded-full bg-muted/50 flex items-center justify-center hover:scale-125 transition-transform cursor-pointer ring-1 ring-border ${selectedNode?.id === apk.id ? "ring-white scale-125" : ""}`}
                          title={apk.label}
                        >
                          <FileCode2 className="h-3 w-3 text-muted-foreground" />
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Detail panel */}
        <div>
          <Card className="sticky top-6">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-mono uppercase">
                {selectedNode ? "Node Details" : "Click a Node"}
              </CardTitle>
            </CardHeader>
            <CardContent>
              {selectedNode ? (
                <div className="space-y-4">
                  <div className="flex items-center gap-3">
                    <div className={`w-10 h-10 rounded-full ${NODE_COLORS[selectedNode.type].bg} flex items-center justify-center`}>
                      {selectedNode.type === "campaign" ? <Users className="h-5 w-5 text-white" /> :
                       selectedNode.type === "apk" ? <FileCode2 className="h-5 w-5 text-white" /> :
                       selectedNode.type === "domain" ? <Globe className="h-5 w-5 text-white" /> :
                       <Server className="h-5 w-5 text-white" />}
                    </div>
                    <div>
                      <p className="font-mono font-bold text-sm truncate max-w-[180px]">{selectedNode.label}</p>
                      <div className="flex items-center gap-2 mt-1">
                        <Badge variant="outline" className="text-[10px] uppercase">{selectedNode.type}</Badge>
                        <Badge className={`text-[10px] ${RISK_COLORS[selectedNode.risk]}`}>{selectedNode.risk}</Badge>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-2 pt-2 border-t border-border/50">
                    {Object.entries(selectedNode.details).map(([key, val]) => (
                      <div key={key} className="flex justify-between text-sm">
                        <span className="text-muted-foreground">{key}</span>
                        <span className="font-mono text-xs text-right max-w-[150px] truncate">{val}</span>
                      </div>
                    ))}
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Connections</span>
                      <span className="font-mono font-bold">{selectedNode.connections}</span>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="text-center py-8 text-muted-foreground text-sm">
                  <Network className="h-12 w-12 mx-auto mb-3 opacity-30" />
                  <p>Select any node in the graph to view its details and connections.</p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
