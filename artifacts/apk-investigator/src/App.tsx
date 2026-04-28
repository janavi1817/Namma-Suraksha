import React from "react";
import { Switch, Route, Router as WouterRouter, Redirect } from "wouter";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { AppLayout } from "@/components/layout/app-layout";
import { AuthProvider, useAuth } from "@/lib/auth-context";
import LoginPage from "@/pages/login";
import Dashboard from "@/pages/dashboard";
import InvestigationsList from "@/pages/investigations/list";
import NewInvestigation from "@/pages/investigations/new";
import InvestigationDetail from "@/pages/investigations/detail";
import CampaignsList from "@/pages/campaigns/list";
import CampaignDetail from "@/pages/campaigns/detail";
import NetworkGraph from "@/pages/network-graph";
import NotFound from "@/pages/not-found";

const queryClient = new QueryClient();

function ProtectedRoutes() {
  const { isAuthenticated } = useAuth();
  if (!isAuthenticated) return <Redirect to="/login" />;

  return (
    <AppLayout>
      <Switch>
        <Route path="/" component={Dashboard} />
        <Route path="/scan" component={NewInvestigation} />
        <Route path="/investigations" component={InvestigationsList} />
        <Route path="/investigations/new" component={NewInvestigation} />
        <Route path="/investigations/:id" component={InvestigationDetail} />
        <Route path="/campaigns" component={CampaignsList} />
        <Route path="/campaigns/:clusterId" component={CampaignDetail} />
        <Route path="/network" component={NetworkGraph} />
        <Route component={NotFound} />
      </Switch>
    </AppLayout>
  );
}

function AppRouter() {
  const { isAuthenticated } = useAuth();
  return (
    <Switch>
      <Route path="/login">
        {isAuthenticated ? <Redirect to="/" /> : <LoginPage />}
      </Route>
      <Route>{() => <ProtectedRoutes />}</Route>
    </Switch>
  );
}

function App() {
  React.useEffect(() => {
    document.documentElement.classList.add("dark");
  }, []);

  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <TooltipProvider>
          <WouterRouter base={import.meta.env.BASE_URL.replace(/\/$/, "")}>
            <AppRouter />
          </WouterRouter>
          <Toaster />
        </TooltipProvider>
      </AuthProvider>
    </QueryClientProvider>
  );
}

export default App;
