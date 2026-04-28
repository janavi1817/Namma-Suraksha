import React from "react";
import { useRoute } from "wouter";
import { Link } from "wouter";
import { useGetCampaign, getGetCampaignQueryKey } from "@workspace/api-client-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Network, Calendar, ShieldAlert } from "lucide-react";
import { RiskBadge } from "@/components/ui/risk-badge";
import { formatDistanceToNow, format } from "date-fns";

export default function CampaignDetail() {
  const [, params] = useRoute("/campaigns/:clusterId");
  const clusterId = params?.clusterId;

  const { data: campaign, isLoading } = useGetCampaign(clusterId!, {
    query: {
      enabled: !!clusterId,
      queryKey: getGetCampaignQueryKey(clusterId!)
    }
  });

  if (isLoading || !campaign) {
    return (
      <div className="p-6 md:p-8 max-w-7xl mx-auto space-y-6">
        <Skeleton className="h-10 w-32 mb-6" />
        <Skeleton className="h-32 w-full mb-6" />
        <Skeleton className="h-64 w-full" />
      </div>
    );
  }

  return (
    <div className="p-6 md:p-8 max-w-7xl mx-auto space-y-6">
      <Button variant="ghost" size="sm" asChild className="-ml-3">
        <Link href="/campaigns">
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Campaigns
        </Link>
      </Button>

      <div className="flex flex-col md:flex-row md:items-start justify-between gap-4">
        <div>
          <div className="flex items-center gap-3 mb-2">
            <h1 className="text-3xl font-bold font-mono uppercase tracking-tight text-foreground flex items-center gap-2">
              <Network className="h-8 w-8 text-primary" /> {campaign.clusterName}
            </h1>
            <RiskBadge level={campaign.topRiskLevel} />
          </div>
          <p className="text-muted-foreground font-mono text-sm">Cluster ID: {campaign.clusterId}</p>
        </div>
        
        <div className="flex gap-4 p-4 rounded-lg bg-card border border-border">
          <div>
            <div className="text-[10px] uppercase font-bold tracking-wider text-muted-foreground mb-1">Samples</div>
            <div className="font-mono text-2xl font-bold">{campaign.sampleCount}</div>
          </div>
          <div className="w-px bg-border"></div>
          <div>
            <div className="text-[10px] uppercase font-bold tracking-wider text-muted-foreground mb-1">Avg Risk</div>
            <div className="font-mono text-2xl font-bold">{(campaign.averageRiskScore ?? 0).toFixed(1)}</div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-mono uppercase flex items-center gap-2">
              <Calendar className="h-4 w-4" /> Timeline
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex justify-between items-center py-2 border-b border-border/50">
              <span className="text-sm text-muted-foreground">First Seen</span>
              <span className="font-mono text-sm">{format(new Date(campaign.firstSeen), 'MMM d, yyyy HH:mm')}</span>
            </div>
            <div className="flex justify-between items-center py-2">
              <span className="text-sm text-muted-foreground">Last Active</span>
              <span className="font-mono text-sm">{format(new Date(campaign.lastSeen), 'MMM d, yyyy HH:mm')}</span>
            </div>
          </CardContent>
        </Card>
      </div>

      <div>
        <h2 className="text-xl font-bold font-mono uppercase tracking-tight mb-4 flex items-center gap-2">
          <ShieldAlert className="h-5 w-5 text-primary" /> Member Samples
        </h2>
        <div className="space-y-3">
          {campaign.members.map((inv) => (
             <Link key={inv.id} href={`/investigations/${inv.id}`} className="block group">
             <Card className="hover:border-primary/50 transition-colors bg-card/50 backdrop-blur-sm">
               <CardContent className="p-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                 <div className="flex items-start gap-4 w-full">
                   <div className="pt-1">
                     <RiskBadge level={inv.riskLevel} />
                   </div>
                   <div className="space-y-1 min-w-0 flex-1">
                     <div className="flex items-center gap-2 flex-wrap">
                       <h3 className="font-mono font-bold text-base truncate group-hover:text-primary transition-colors">
                         {inv.sampleName}
                       </h3>
                       {inv.verdict === "MALICIOUS" && (
                         <span className="px-2 py-0.5 rounded bg-destructive/10 text-destructive text-[10px] font-bold uppercase border border-destructive/20">
                           Malicious
                         </span>
                       )}
                     </div>
                     <div className="text-xs font-mono text-muted-foreground truncate">
                       SHA256: {inv.sha256}
                     </div>
                   </div>
                 </div>
                 
                 <div className="flex flex-row sm:flex-col items-center sm:items-end justify-between sm:justify-center w-full sm:w-auto gap-2 border-t sm:border-t-0 pt-4 sm:pt-0 border-border mt-2 sm:mt-0">
                   <div className="text-sm">
                     <span className="text-muted-foreground uppercase text-[10px] font-bold tracking-wider mr-2">Score</span>
                     <span className="font-mono font-bold text-base">{inv.riskScore}</span>
                   </div>
                   <div className="text-xs text-muted-foreground whitespace-nowrap">
                     {formatDistanceToNow(new Date(inv.createdAt), { addSuffix: true })}
                   </div>
                 </div>
               </CardContent>
             </Card>
           </Link>
          ))}
        </div>
      </div>
    </div>
  );
}
