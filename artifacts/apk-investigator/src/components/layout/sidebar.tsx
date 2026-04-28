import React from "react";
import { Link, useLocation } from "wouter";
import { LayoutDashboard, Search, Network, Upload, ShieldAlert, LogOut, Sun, Moon } from "lucide-react";
import { useAuth } from "@/lib/auth-context";
import { useTheme } from "@/lib/theme-context";
import {
  Sidebar, SidebarContent, SidebarGroup, SidebarGroupContent,
  SidebarGroupLabel, SidebarHeader, SidebarMenu, SidebarMenuItem,
  SidebarMenuButton, SidebarFooter,
} from "@/components/ui/sidebar";

export function AppSidebar() {
  const [location] = useLocation();
  const { officer, logout } = useAuth();
  const { theme, toggleTheme } = useTheme();

  return (
    <Sidebar className="border-r border-border bg-sidebar text-sidebar-foreground">
      <SidebarHeader className="p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-full bg-primary/10 border border-primary/30 flex items-center justify-center">
              <ShieldAlert className="h-4 w-4 text-primary" />
            </div>
            <div>
              <div className="font-mono text-sm font-bold uppercase tracking-wider text-primary">RAKSHAK</div>
              <div className="text-[10px] text-muted-foreground">CB/CID Intelligence</div>
            </div>
          </div>
          {/* Theme toggle */}
          <button
            onClick={toggleTheme}
            className="w-8 h-8 rounded-lg flex items-center justify-center bg-muted/50 hover:bg-muted border border-border/50 transition-all hover:scale-105"
            title={theme === "dark" ? "Switch to light mode" : "Switch to dark mode"}
          >
            {theme === "dark" ? <Sun className="h-4 w-4 text-yellow-400" /> : <Moon className="h-4 w-4 text-blue-600" />}
          </button>
        </div>
        {officer && (
          <div className="mt-3 p-2 rounded bg-muted/30 border border-border/50">
            <p className="text-xs font-medium truncate">{officer.name}</p>
            <p className="text-[10px] text-muted-foreground">{officer.rank} • {officer.district}</p>
          </div>
        )}
      </SidebarHeader>
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel className="text-xs font-semibold text-muted-foreground uppercase tracking-widest">
            Intelligence
          </SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              <SidebarMenuItem>
                <SidebarMenuButton asChild isActive={location === "/"}>
                  <Link href="/"><LayoutDashboard className="h-4 w-4" /><span>Dashboard</span></Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
              <SidebarMenuItem>
                <SidebarMenuButton asChild isActive={location === "/scan"}>
                  <Link href="/scan"><Upload className="h-4 w-4" /><span>APK Upload & Scan</span></Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
              <SidebarMenuItem>
                <SidebarMenuButton asChild isActive={location.startsWith("/investigations")}>
                  <Link href="/investigations"><Search className="h-4 w-4" /><span>Investigations</span></Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
              <SidebarMenuItem>
                <SidebarMenuButton asChild isActive={location === "/network"}>
                  <Link href="/network"><Network className="h-4 w-4" /><span>Network Graph</span></Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
              <SidebarMenuItem>
                <SidebarMenuButton asChild isActive={location.startsWith("/campaigns")}>
                  <Link href="/campaigns"><ShieldAlert className="h-4 w-4" /><span>Campaigns</span></Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
      <SidebarFooter className="p-4">
        <button
          onClick={logout}
          className="flex items-center gap-2 text-xs text-muted-foreground hover:text-destructive transition-colors w-full p-2 rounded hover:bg-destructive/10"
        >
          <LogOut className="h-3 w-3" /> Logout
        </button>
      </SidebarFooter>
    </Sidebar>
  );
}
