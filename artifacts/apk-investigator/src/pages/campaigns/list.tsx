import React from "react";
import { Link } from "wouter";
import { useListCampaigns, getListCampaignsQueryKey } from "@workspace/api-client-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Network, Users } from "lucide-react";
import { RiskBadge } from "@/components/ui/risk-badge";
import { format } from "date-fns";

export default function CampaignList() {
  const { data: campaigns, isLoading } = useListCampaigns({
    query: { queryKey: getListCampaignsQueryKey() }
  });

  return (
    <div className="p-6 md:p-8 max-w-7xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-bold font-mono uppercase tracking-tight text-foreground flex items-center gap-2">
          <Network className="h-6 w-6 text-primary" /> Threat Campaigns
        </h1>
        <p className="text-muted-foreground text-sm mt-1">Identified clusters of related malware samples and actors.</p>
      </div>

      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[...Array(6)].map((_, i) => <Skeleton key={i} className="h-48 w-full" />)}
        </div>
      ) : campaigns?.length === 0 ? (
        <Card className="bg-background">
          <CardContent className="flex flex-col items-center justify-center py-16">
            <Network className="h-12 w-12 text-muted/50 mb-4" />
            <p className="text-lg font-medium">No campaigns identified</p>
            <p className="text-sm text-muted-foreground text-center mt-1">
              Campaigns are automatically created when autonomous analysis finds related infrastructure or code patterns.
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {campaigns?.map(campaign => (
            <Link key={campaign.clusterId} href={`/campaigns/${campaign.clusterId}`}>
              <Card className="hover:border-primary/50 transition-colors h-full flex flex-col cursor-pointer bg-card/50 backdrop-blur-sm">
                <CardHeader className="pb-2">
                  <div className="flex justify-between items-start mb-2">
                    <RiskBadge level={campaign.topRiskLevel} />
                    <div className="flex items-center text-xs text-muted-foreground bg-muted px-2 py-1 rounded-md border border-border">
                      <Users className="h-3 w-3 mr-1" />
                      {campaign.sampleCount} samples
                    </div>
                  </div>
                  <CardTitle className="text-xl font-mono truncate">{campaign.clusterName}</CardTitle>
                </CardHeader>
                <CardContent className="mt-auto pt-4 space-y-4">
                  <div>
                    <div className="text-[10px] uppercase font-bold tracking-wider text-muted-foreground mb-1">Avg Risk Score</div>
                    <div className="font-mono text-2xl font-bold">{(campaign.averageRiskScore ?? 0).toFixed(1)}</div>
                  </div>
                  <div className="grid grid-cols-2 gap-2 text-xs border-t border-border pt-4">
                    <div>
                      <div className="text-[10px] uppercase tracking-wider text-muted-foreground">First Seen</div>
                      <div className="font-mono mt-1">{format(new Date(campaign.firstSeen), 'MMM d, yyyy')}</div>
                    </div>
                    <div>
                      <div className="text-[10px] uppercase tracking-wider text-muted-foreground">Last Active</div>
                      <div className="font-mono mt-1">{format(new Date(campaign.lastSeen), 'MMM d, yyyy')}</div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
