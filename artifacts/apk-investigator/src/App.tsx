import React from "react";
import { Switch, Route, Router as WouterRouter } from "wouter";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { AppLayout } from "@/components/layout/app-layout";
import Dashboard from "@/pages/dashboard";
import InvestigationsList from "@/pages/investigations/list";
import NewInvestigation from "@/pages/investigations/new";
import InvestigationDetail from "@/pages/investigations/detail";
import CampaignsList from "@/pages/campaigns/list";
import CampaignDetail from "@/pages/campaigns/detail";
import NotFound from "@/pages/not-found";

const queryClient = new QueryClient();

function Router() {
  return (
    <AppLayout>
      <Switch>
        <Route path="/" component={Dashboard} />
        <Route path="/investigations" component={InvestigationsList} />
        <Route path="/investigations/new" component={NewInvestigation} />
        <Route path="/investigations/:id" component={InvestigationDetail} />
        <Route path="/campaigns" component={CampaignsList} />
        <Route path="/campaigns/:clusterId" component={CampaignDetail} />
        <Route component={NotFound} />
      </Switch>
    </AppLayout>
  );
}

function App() {
  // Enforce dark mode by default for the SOC feel
  React.useEffect(() => {
    document.documentElement.classList.add('dark');
  }, []);

  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <WouterRouter base={import.meta.env.BASE_URL.replace(/\/$/, "")}>
          <Router />
        </WouterRouter>
        <Toaster />
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
