import React from "react";
import { useRoute, useLocation } from "wouter";
import { Link } from "wouter";
import { useGetInvestigation, getGetInvestigationQueryKey, useDeleteInvestigation, getListInvestigationsQueryKey } from "@workspace/api-client-react";
import { useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { 
  ArrowLeft, Terminal, ShieldAlert, AlertTriangle, FileCode2, 
  Network, Copy, Trash2, Cpu, CheckCircle2, Lock, Tag, Users, Activity
} from "lucide-react";
import { RiskBadge } from "@/components/ui/risk-badge";
import { formatDistanceToNow, format } from "date-fns";
import { useToast } from "@/hooks/use-toast";

export default function InvestigationDetail() {
  const [, params] = useRoute("/investigations/:id");
  const id = params?.id ? parseInt(params.id, 10) : undefined;
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: inv, isLoading } = useGetInvestigation(id!, {
    query: {
      enabled: !!id,
      queryKey: getGetInvestigationQueryKey(id!)
    }
  });

  const deleteInvestigation = useDeleteInvestigation();

  const handleDelete = () => {
    if (!id || !confirm("Are you sure you want to delete this investigation?")) return;
    deleteInvestigation.mutate({ id }, {
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: getListInvestigationsQueryKey() });
        toast({ title: "Investigation deleted" });
        setLocation("/investigations");
      }
    });
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    toast({ title: "Copied to clipboard", duration: 2000 });
  };

  if (isLoading || !inv) {
    return (
      <div className="p-6 md:p-8 max-w-7xl mx-auto space-y-6">
        <Skeleton className="h-10 w-32 mb-6" />
        <Skeleton className="h-48 w-full mb-6" />
        <Skeleton className="h-[500px] w-full" />
      </div>
    );
  }

  const a = inv.analysis;

  return (
    <div className="p-6 md:p-8 max-w-7xl mx-auto space-y-6 pb-24">
      <div className="flex items-center justify-between">
        <Button variant="ghost" size="sm" asChild className="-ml-3">
          <Link href="/investigations">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back
          </Link>
        </Button>
        <Button variant="destructive" size="sm" onClick={handleDelete} disabled={deleteInvestigation.isPending}>
          <Trash2 className="mr-2 h-4 w-4" /> Delete
        </Button>
      </div>

      {/* Hero Block - Exec Summary */}
      <div className="relative rounded-xl border border-border overflow-hidden bg-card text-card-foreground">
        <div className={`absolute top-0 left-0 w-1 h-full ${
          inv.riskLevel === 'Critical' ? 'bg-[#ff3333]' :
          inv.riskLevel === 'High' ? 'bg-[#ff8800]' :
          inv.riskLevel === 'Medium' ? 'bg-[#ffcc00]' : 'bg-[#00cc66]'
        }`} />
        
        <div className="p-6 md:p-8 space-y-6">
          <div className="flex flex-col md:flex-row md:items-start justify-between gap-6">
            <div className="space-y-2">
              <div className="flex items-center gap-3">
                <RiskBadge level={inv.riskLevel} />
                <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase border ${
                  inv.verdict === 'MALICIOUS' ? 'bg-destructive/10 text-destructive border-destructive/20' :
                  inv.verdict === 'SUSPICIOUS' ? 'bg-yellow-500/10 text-yellow-500 border-yellow-500/20' :
                  'bg-green-500/10 text-green-500 border-green-500/20'
                }`}>
                  {inv.verdict}
                </span>
                <span className="text-xs text-muted-foreground font-mono">
                  CONFIDENCE: {inv.confidence}
                </span>
              </div>
              <h1 className="text-2xl md:text-3xl font-bold font-mono tracking-tight">{inv.sampleName}</h1>
              <p className="text-muted-foreground font-mono text-sm">SHA256: {inv.sha256}</p>
            </div>
            
            <div className="flex gap-6 shrink-0 bg-muted/30 p-4 rounded-lg border border-border/50">
              <div>
                <div className="text-[10px] uppercase font-bold tracking-wider text-muted-foreground mb-1">Risk Score</div>
                <div className="font-mono text-4xl font-bold text-primary">{inv.riskScore}</div>
              </div>
              <div className="w-px bg-border/50"></div>
              <div>
                <div className="text-[10px] uppercase font-bold tracking-wider text-muted-foreground mb-1">Threat Type</div>
                <div className="font-mono text-lg font-bold">{inv.primaryThreatType}</div>
              </div>
            </div>
          </div>

          <div className="prose prose-sm dark:prose-invert max-w-none text-muted-foreground bg-muted/10 p-4 rounded border border-border/30">
            <p className="font-medium text-foreground">{a.executiveSummary}</p>
          </div>
        </div>
      </div>

      <Tabs defaultValue="brief" className="w-full">
        <TabsList className="w-full flex flex-wrap h-auto bg-transparent border-b border-border rounded-none justify-start p-0">
          <TabsTrigger value="brief" className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent font-mono text-xs uppercase tracking-wider py-3">Brief</TabsTrigger>
          <TabsTrigger value="behaviors" className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent font-mono text-xs uppercase tracking-wider py-3">Behaviors</TabsTrigger>
          <TabsTrigger value="code" className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent font-mono text-xs uppercase tracking-wider py-3">Code & Permissions</TabsTrigger>
          <TabsTrigger value="network" className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent font-mono text-xs uppercase tracking-wider py-3">Network</TabsTrigger>
          <TabsTrigger value="attribution" className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent font-mono text-xs uppercase tracking-wider py-3">Attribution</TabsTrigger>
          <TabsTrigger value="risk" className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent font-mono text-xs uppercase tracking-wider py-3">Risk & Prediction</TabsTrigger>
          <TabsTrigger value="rules" className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent font-mono text-xs uppercase tracking-wider py-3">Rules & IOCs</TabsTrigger>
        </TabsList>

        <div className="mt-6">
          {/* PLAIN ENGLISH BRIEF */}
          <TabsContent value="brief" className="space-y-6 m-0">
            <Card>
              <CardHeader>
                <CardTitle className="text-sm font-mono uppercase flex items-center gap-2">
                  <Terminal className="h-4 w-4" /> Plain English Brief
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="prose dark:prose-invert max-w-none text-foreground/80 leading-relaxed whitespace-pre-wrap">
                  {a.plainEnglishBrief}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-sm font-mono uppercase flex items-center gap-2">
                  <Cpu className="h-4 w-4" /> AI Reasoning Chain
                </CardTitle>
                <CardDescription>How the autonomous agent reached its conclusions</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {a.reasoningChain.map((step, idx) => (
                    <div key={idx} className="flex gap-4">
                      <div className="flex flex-col items-center">
                        <div className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full border border-primary/50 bg-primary/10 text-[10px] font-mono font-bold text-primary">
                          {idx + 1}
                        </div>
                        {idx !== a.reasoningChain.length - 1 && <div className="w-px h-full bg-border my-1"></div>}
                      </div>
                      <div className="pb-4">
                        <h4 className="text-sm font-mono font-bold text-foreground mb-1">{step.step}</h4>
                        <p className="text-sm text-muted-foreground">{step.observation}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* BEHAVIORS */}
          <TabsContent value="behaviors" className="space-y-6 m-0">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {a.behaviors.map((beh, idx) => (
                <Card key={idx} className="flex flex-col h-full bg-card/50">
                  <CardHeader className="pb-2">
                    <div className="flex justify-between items-start gap-2">
                      <CardTitle className="text-base font-bold flex items-center gap-2">
                        <AlertTriangle className="h-4 w-4 text-warning" />
                        {beh.title}
                      </CardTitle>
                      <Badge variant="outline" className="font-mono text-[10px]">Conf: {beh.confidence}%</Badge>
                    </div>
                    <CardDescription className="text-xs">{beh.type}</CardDescription>
                  </CardHeader>
                  <CardContent className="pt-2 flex-1 flex flex-col">
                    <p className="text-sm text-foreground/80 mb-4">{beh.description}</p>
                    <div className="mt-auto space-y-2">
                      <div className="text-[10px] font-mono uppercase text-muted-foreground tracking-wider">Evidence</div>
                      <ul className="space-y-1">
                        {beh.evidence.map((ev, i) => (
                          <li key={i} className="text-xs font-mono bg-muted/50 p-1.5 rounded border border-border/50 text-muted-foreground">
                            {ev}
                          </li>
                        ))}
                      </ul>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>

            <Card>
              <CardHeader>
                <CardTitle className="text-sm font-mono uppercase">MITRE ATT&CK Tactics</CardTitle>
              </CardHeader>
              <CardContent className="flex flex-wrap gap-2">
                {a.mitreTactics.map(tactic => (
                  <div key={tactic.id} className="border border-border bg-muted/30 rounded p-3 flex-1 min-w-[250px]">
                    <div className="flex items-center gap-2 mb-1">
                      <Badge variant="secondary" className="font-mono text-xs">{tactic.id}</Badge>
                      <span className="font-bold text-sm">{tactic.name}</span>
                    </div>
                    <p className="text-xs text-muted-foreground">{tactic.description}</p>
                  </div>
                ))}
              </CardContent>
            </Card>
          </TabsContent>

          {/* CODE & PERMISSIONS */}
          <TabsContent value="code" className="space-y-6 m-0">
            <Card>
              <CardHeader>
                <CardTitle className="text-sm font-mono uppercase flex items-center gap-2">
                  <Lock className="h-4 w-4" /> Abused Permissions
                </CardTitle>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="w-[300px]">Permission</TableHead>
                      <TableHead className="w-[100px]">Risk</TableHead>
                      <TableHead>Explanation</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {a.permissionAbuse.map((p, idx) => (
                      <TableRow key={idx}>
                        <TableCell className="font-mono text-xs">{p.permission.split('.').pop()}</TableCell>
                        <TableCell>
                          <RiskBadge level={p.riskLevel} />
                        </TableCell>
                        <TableCell className="text-sm text-muted-foreground">{p.explanation}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>

            <div className="space-y-4">
              <h3 className="text-lg font-bold font-mono uppercase flex items-center gap-2">
                <FileCode2 className="h-5 w-5 text-primary" /> Code Findings
              </h3>
              {a.codeFindings.map((cf, idx) => (
                <Card key={idx} className="border-l-4" style={{ borderLeftColor: cf.severity === 'Critical' ? '#ff3333' : cf.severity === 'High' ? '#ff8800' : 'var(--border)' }}>
                  <CardHeader className="pb-2">
                    <div className="flex justify-between">
                      <CardTitle className="text-base">{cf.title}</CardTitle>
                      <Badge variant="outline" className="font-mono text-[10px]">{cf.severity}</Badge>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="bg-[#1e1e1e] p-4 rounded-md overflow-x-auto border border-[#333]">
                      <pre className="text-xs font-mono text-[#d4d4d4]"><code>{cf.snippet}</code></pre>
                    </div>
                    <p className="text-sm text-muted-foreground">{cf.meaning}</p>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          {/* NETWORK */}
          <TabsContent value="network" className="space-y-6 m-0">
            <Card>
              <CardHeader>
                <CardTitle className="text-sm font-mono uppercase flex items-center gap-2">
                  <Network className="h-4 w-4" /> Infrastructure Analysis
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <p className="text-sm text-foreground/80">{a.networkInfrastructure.summary}</p>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <h4 className="text-xs font-mono uppercase text-muted-foreground tracking-wider mb-3">C2 Domains</h4>
                    {a.networkInfrastructure.c2Domains.length > 0 ? (
                      <ul className="space-y-2">
                        {a.networkInfrastructure.c2Domains.map((d, i) => (
                          <li key={i} className="flex justify-between items-center bg-muted/50 p-2 rounded border border-border/50">
                            <span className="font-mono text-sm">{d}</span>
                            <Button variant="ghost" size="icon" className="h-6 w-6" onClick={() => copyToClipboard(d)}>
                              <Copy className="h-3 w-3" />
                            </Button>
                          </li>
                        ))}
                      </ul>
                    ) : <span className="text-sm text-muted-foreground">None identified</span>}
                  </div>
                  <div>
                    <h4 className="text-xs font-mono uppercase text-muted-foreground tracking-wider mb-3">C2 IPs</h4>
                    {a.networkInfrastructure.c2Ips.length > 0 ? (
                      <ul className="space-y-2">
                        {a.networkInfrastructure.c2Ips.map((ip, i) => (
                          <li key={i} className="flex justify-between items-center bg-muted/50 p-2 rounded border border-border/50">
                            <span className="font-mono text-sm">{ip}</span>
                            <Button variant="ghost" size="icon" className="h-6 w-6" onClick={() => copyToClipboard(ip)}>
                              <Copy className="h-3 w-3" />
                            </Button>
                          </li>
                        ))}
                      </ul>
                    ) : <span className="text-sm text-muted-foreground">None identified</span>}
                  </div>
                </div>

                <div>
                  <h4 className="text-xs font-mono uppercase text-muted-foreground tracking-wider mb-3">Infrastructure Patterns</h4>
                  <ul className="list-disc pl-5 text-sm text-muted-foreground space-y-1">
                    {a.networkInfrastructure.infrastructurePatterns.map((pat, i) => (
                      <li key={i}>{pat}</li>
                    ))}
                  </ul>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* ATTRIBUTION */}
          <TabsContent value="attribution" className="space-y-6 m-0">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle className="text-sm font-mono uppercase flex items-center gap-2">
                    <Users className="h-4 w-4" /> Campaign Attribution
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center gap-3">
                    <span className="font-mono text-xl font-bold text-primary">{a.campaign.clusterName}</span>
                    {a.campaign.isNewCampaign && (
                      <Badge variant="secondary" className="bg-primary/20 text-primary border-primary/30">NEW CAMPAIGN</Badge>
                    )}
                  </div>
                  <p className="text-sm text-muted-foreground">{a.campaign.rationale}</p>
                  
                  <div className="grid grid-cols-2 gap-4 py-3 border-y border-border/50">
                    <div>
                      <div className="text-[10px] uppercase font-bold tracking-wider text-muted-foreground mb-1">Related Samples</div>
                      <div className="font-mono font-bold">{a.campaign.relatedSampleCount}</div>
                    </div>
                    <div>
                      <div className="text-[10px] uppercase font-bold tracking-wider text-muted-foreground mb-1">Attack Vector</div>
                      <div className="font-mono font-bold text-sm">{a.campaign.attackVector}</div>
                    </div>
                  </div>

                  <div>
                    <div className="text-[10px] uppercase font-bold tracking-wider text-muted-foreground mb-2">Shared Indicators</div>
                    <div className="flex flex-wrap gap-2">
                      {a.campaign.sharedIndicators.map((ind, i) => (
                        <span key={i} className="px-2 py-1 bg-muted rounded text-xs font-mono border border-border/50">{ind}</span>
                      ))}
                    </div>
                  </div>

                  {a.campaign.clusterId && (
                    <Button variant="outline" className="w-full" asChild>
                      <Link href={`/campaigns/${a.campaign.clusterId}`}>View Full Campaign Cluster</Link>
                    </Button>
                  )}
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="text-sm font-mono uppercase flex items-center gap-2">
                    <ShieldAlert className="h-4 w-4" /> Root Offender
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="font-mono text-xl font-bold">{a.rootOffender.actorName}</div>
                      <div className="text-xs text-muted-foreground">{a.rootOffender.actorType}</div>
                    </div>
                    <div className="text-right">
                      <div className="text-[10px] uppercase font-bold tracking-wider text-muted-foreground mb-1">Confidence</div>
                      <Badge variant="outline">{a.rootOffender.confidence}</Badge>
                    </div>
                  </div>

                  <div>
                    <div className="text-[10px] uppercase font-bold tracking-wider text-muted-foreground mb-2">Evidence</div>
                    <ul className="list-disc pl-5 text-sm text-muted-foreground space-y-1">
                      {a.rootOffender.evidence.map((ev, i) => (
                        <li key={i}>{ev}</li>
                      ))}
                    </ul>
                  </div>

                  <div>
                    <div className="text-[10px] uppercase font-bold tracking-wider text-muted-foreground mb-2">Historical Associations</div>
                    <div className="flex flex-wrap gap-2">
                      {a.rootOffender.historicalAssociations.map((assoc, i) => (
                        <span key={i} className="px-2 py-1 bg-muted/50 rounded text-xs border border-border/50">{assoc}</span>
                      ))}
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* RISK & PREDICTION */}
          <TabsContent value="risk" className="space-y-6 m-0">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle className="text-sm font-mono uppercase flex items-center gap-2">
                    <Activity className="h-4 w-4" /> Risk Matrix
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="grid grid-cols-3 gap-4 text-center">
                    <div className="bg-muted/30 p-3 rounded border border-border/50">
                      <div className="text-[10px] uppercase font-bold tracking-wider text-muted-foreground mb-1">Likelihood</div>
                      <div className="font-mono text-2xl font-bold">{a.riskMatrix.likelihood}/10</div>
                    </div>
                    <div className="bg-muted/30 p-3 rounded border border-border/50">
                      <div className="text-[10px] uppercase font-bold tracking-wider text-muted-foreground mb-1">Impact</div>
                      <div className="font-mono text-2xl font-bold">{a.riskMatrix.impact}/10</div>
                    </div>
                    <div className="bg-muted/30 p-3 rounded border border-border/50">
                      <div className="text-[10px] uppercase font-bold tracking-wider text-muted-foreground mb-1">Composite</div>
                      <div className="font-mono text-2xl font-bold text-primary">{a.riskMatrix.composite}</div>
                    </div>
                  </div>

                  {a.riskMatrix.cvssVector && (
                    <div>
                      <div className="text-[10px] uppercase font-bold tracking-wider text-muted-foreground mb-1">CVSS Vector</div>
                      <div className="font-mono text-sm bg-muted p-2 rounded border border-border">{a.riskMatrix.cvssVector}</div>
                    </div>
                  )}

                  <div>
                    <div className="text-[10px] uppercase font-bold tracking-wider text-muted-foreground mb-1">Methodology</div>
                    <p className="text-sm text-muted-foreground">{a.riskMatrix.methodology}</p>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="text-sm font-mono uppercase flex items-center gap-2">
                    <Tag className="h-4 w-4" /> Threat Prediction
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <div className="text-[10px] uppercase font-bold tracking-wider text-muted-foreground mb-1">Evolution</div>
                    <p className="text-sm text-foreground/90">{a.prediction.predictedEvolution}</p>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4 pt-2">
                    <div>
                      <div className="text-[10px] uppercase font-bold tracking-wider text-muted-foreground mb-1">Variant Likelihood</div>
                      <Badge variant="outline">{a.prediction.variantLikelihood}</Badge>
                    </div>
                    <div>
                      <div className="text-[10px] uppercase font-bold tracking-wider text-muted-foreground mb-1">Infra Reuse</div>
                      <Badge variant="outline">{a.prediction.infrastructureReuse}</Badge>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4 pt-2">
                    <div>
                      <div className="text-[10px] uppercase font-bold tracking-wider text-muted-foreground mb-2">Target Regions</div>
                      <div className="flex flex-wrap gap-1">
                        {a.prediction.targetRegions.map((r, i) => (
                          <span key={i} className="text-xs bg-muted/50 px-2 py-0.5 rounded">{r}</span>
                        ))}
                      </div>
                    </div>
                    <div>
                      <div className="text-[10px] uppercase font-bold tracking-wider text-muted-foreground mb-2">Target Industries</div>
                      <div className="flex flex-wrap gap-1">
                        {a.prediction.targetIndustries.map((ind, i) => (
                          <span key={i} className="text-xs bg-muted/50 px-2 py-0.5 rounded">{ind}</span>
                        ))}
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
            
            <Card>
              <CardHeader>
                <CardTitle className="text-sm font-mono uppercase">Proactive Defenses</CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2">
                  {a.prediction.proactiveDefenses.map((def, i) => (
                    <li key={i} className="flex items-start gap-2 text-sm text-muted-foreground">
                      <CheckCircle2 className="h-4 w-4 text-green-500 mt-0.5 shrink-0" />
                      <span>{def}</span>
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>
          </TabsContent>

          {/* RULES & IOCS */}
          <TabsContent value="rules" className="space-y-6 m-0">
            <Card>
              <CardHeader>
                <CardTitle className="text-sm font-mono uppercase">Indicators of Compromise (IOCs)</CardTitle>
              </CardHeader>
              <CardContent className="p-0">
                <Table>
                  <TableHeader>
                    <TableRow className="hover:bg-transparent">
                      <TableHead className="w-[120px]">Type</TableHead>
                      <TableHead>Value</TableHead>
                      <TableHead>Context</TableHead>
                      <TableHead className="w-[50px]"></TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {a.iocs.map((ioc, idx) => (
                      <TableRow key={idx} className="group cursor-default">
                        <TableCell className="font-mono text-[10px] uppercase tracking-wider font-bold text-muted-foreground">
                          {ioc.type}
                        </TableCell>
                        <TableCell className="font-mono text-sm">{ioc.value}</TableCell>
                        <TableCell className="text-xs text-muted-foreground">{ioc.context}</TableCell>
                        <TableCell>
                          <Button variant="ghost" size="icon" className="h-6 w-6 opacity-0 group-hover:opacity-100 transition-opacity" onClick={() => copyToClipboard(ioc.value)}>
                            <Copy className="h-3 w-3" />
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between pb-2">
                  <CardTitle className="text-sm font-mono uppercase">YARA Rule</CardTitle>
                  <Button variant="ghost" size="icon" className="h-6 w-6" onClick={() => copyToClipboard(a.detectionRules.yara)}>
                    <Copy className="h-3 w-3" />
                  </Button>
                </CardHeader>
                <CardContent>
                  <div className="bg-[#1e1e1e] p-3 rounded overflow-x-auto border border-[#333]">
                    <pre className="text-xs font-mono text-[#d4d4d4]"><code>{a.detectionRules.yara}</code></pre>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between pb-2">
                  <CardTitle className="text-sm font-mono uppercase">Suricata Rule</CardTitle>
                  <Button variant="ghost" size="icon" className="h-6 w-6" onClick={() => copyToClipboard(a.detectionRules.suricata)}>
                    <Copy className="h-3 w-3" />
                  </Button>
                </CardHeader>
                <CardContent>
                  <div className="bg-[#1e1e1e] p-3 rounded overflow-x-auto border border-[#333]">
                    <pre className="text-xs font-mono text-[#d4d4d4]"><code>{a.detectionRules.suricata}</code></pre>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between pb-2">
                  <CardTitle className="text-sm font-mono uppercase">SIEM Query</CardTitle>
                  <Button variant="ghost" size="icon" className="h-6 w-6" onClick={() => copyToClipboard(a.detectionRules.siemQuery)}>
                    <Copy className="h-3 w-3" />
                  </Button>
                </CardHeader>
                <CardContent>
                  <div className="bg-[#1e1e1e] p-3 rounded overflow-x-auto border border-[#333]">
                    <pre className="text-xs font-mono text-[#d4d4d4]"><code>{a.detectionRules.siemQuery}</code></pre>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between pb-2">
                  <CardTitle className="text-sm font-mono uppercase">EDR Rule</CardTitle>
                  <Button variant="ghost" size="icon" className="h-6 w-6" onClick={() => copyToClipboard(a.detectionRules.edrRule)}>
                    <Copy className="h-3 w-3" />
                  </Button>
                </CardHeader>
                <CardContent>
                  <div className="bg-[#1e1e1e] p-3 rounded overflow-x-auto border border-[#333]">
                    <pre className="text-xs font-mono text-[#d4d4d4]"><code>{a.detectionRules.edrRule}</code></pre>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </div>
      </Tabs>
    </div>
  );
}
