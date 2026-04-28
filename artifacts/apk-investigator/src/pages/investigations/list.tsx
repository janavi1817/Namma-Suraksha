import React, { useState } from "react";
import { Link } from "wouter";
import { useListInvestigations, getListInvestigationsQueryKey, ListInvestigationsRiskLevel } from "@workspace/api-client-react";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Search, Plus, FileCode2 } from "lucide-react";
import { RiskBadge } from "@/components/ui/risk-badge";
import { formatDistanceToNow } from "date-fns";

export default function InvestigationsList() {
  const [search, setSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [riskLevel, setRiskLevel] = useState<string>("all");

  React.useEffect(() => {
    const timer = setTimeout(() => setDebouncedSearch(search), 300);
    return () => clearTimeout(timer);
  }, [search]);

  const params: any = {};
  if (debouncedSearch) params.search = debouncedSearch;
  if (riskLevel && riskLevel !== "all") params.riskLevel = riskLevel as ListInvestigationsRiskLevel;

  const { data: investigations, isLoading } = useListInvestigations(params, {
    query: { queryKey: getListInvestigationsQueryKey(params) }
  });

  return (
    <div className="p-6 md:p-8 max-w-7xl mx-auto space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold font-mono uppercase tracking-tight text-foreground flex items-center gap-2">
            <FileCode2 className="h-6 w-6 text-primary" /> Investigations Registry
          </h1>
          <p className="text-muted-foreground text-sm mt-1">Search and filter historical threat analyses.</p>
        </div>
        <Button asChild>
          <Link href="/investigations/new">
            <Plus className="mr-2 h-4 w-4" /> New Investigation
          </Link>
        </Button>
      </div>

      <div className="flex flex-col sm:flex-row gap-4 items-center bg-card p-4 rounded-lg border border-border">
        <div className="relative w-full sm:max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input 
            placeholder="Search by hash, package, or name..." 
            className="pl-9 font-mono text-sm bg-background"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        <Select value={riskLevel} onValueChange={setRiskLevel}>
          <SelectTrigger className="w-full sm:w-[180px] bg-background">
            <SelectValue placeholder="Risk Level" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Risks</SelectItem>
            <SelectItem value="Critical">Critical</SelectItem>
            <SelectItem value="High">High</SelectItem>
            <SelectItem value="Medium">Medium</SelectItem>
            <SelectItem value="Low">Low</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-4">
        {isLoading ? (
          [...Array(5)].map((_, i) => <Skeleton key={i} className="h-24 w-full" />)
        ) : investigations?.length === 0 ? (
          <Card className="bg-background">
            <CardContent className="flex flex-col items-center justify-center py-12">
              <FileCode2 className="h-12 w-12 text-muted/50 mb-4" />
              <p className="text-lg font-medium">No investigations found</p>
              <p className="text-sm text-muted-foreground text-center mt-1">
                Try adjusting your search filters or create a new investigation.
              </p>
            </CardContent>
          </Card>
        ) : (
          investigations?.map((inv) => (
            <Link key={inv.id} href={`/investigations/${inv.id}`} className="block group">
              <Card className="hover:border-primary/50 transition-colors bg-card/50 backdrop-blur-sm">
                <CardContent className="p-4 sm:p-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                  <div className="flex items-start gap-4 w-full">
                    <div className="pt-1">
                      <RiskBadge level={inv.riskLevel} />
                    </div>
                    <div className="space-y-1 min-w-0 flex-1">
                      <div className="flex items-center gap-2 flex-wrap">
                        <h3 className="font-mono font-bold text-lg truncate group-hover:text-primary transition-colors">
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
                      {inv.packageName && (
                        <div className="text-xs text-muted-foreground truncate">
                          PKG: {inv.packageName}
                        </div>
                      )}
                    </div>
                  </div>
                  
                  <div className="flex flex-row sm:flex-col items-center sm:items-end justify-between sm:justify-center w-full sm:w-auto gap-2 border-t sm:border-t-0 pt-4 sm:pt-0 border-border mt-2 sm:mt-0">
                    <div className="text-sm">
                      <span className="text-muted-foreground uppercase text-[10px] font-bold tracking-wider mr-2">Score</span>
                      <span className="font-mono font-bold text-lg">{inv.riskScore}</span>
                    </div>
                    <div className="text-xs text-muted-foreground whitespace-nowrap">
                      {formatDistanceToNow(new Date(inv.createdAt), { addSuffix: true })}
                    </div>
                  </div>
                </CardContent>
              </Card>
            </Link>
          ))
        )}
      </div>
    </div>
  );
}
