import React, { useState } from "react";
import { useLocation } from "wouter";
import { useAuth } from "@/lib/auth-context";
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ShieldAlert, Lock, User, MapPin, AlertCircle } from "lucide-react";

const DISTRICTS = [
  "Bengaluru Urban", "Bengaluru Rural", "Mysuru", "Mangaluru", "Hubli-Dharwad",
  "Belagavi", "Kalaburagi", "Ballari", "Davangere", "Shivamogga",
  "Tumakuru", "Raichur", "Hassan", "Udupi", "Chitradurga",
];

export default function LoginPage() {
  const [officerId, setOfficerId] = useState("");
  const [password, setPassword] = useState("");
  const [district, setDistrict] = useState("");
  const [error, setError] = useState("");
  const [, setLocation] = useLocation();
  const { login } = useAuth();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    if (!officerId || !password || !district) {
      setError("All fields are required");
      return;
    }
    const success = login(officerId, password, district);
    if (success) {
      setLocation("/");
    } else {
      setError("Invalid Officer ID or Password");
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 p-4">
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-blue-900/20 via-transparent to-transparent" />

      <Card className="relative w-full max-w-md border-border/50 bg-card/80 backdrop-blur-xl shadow-2xl">
        <CardHeader className="text-center space-y-4 pb-2">
          <div className="mx-auto w-16 h-16 rounded-full bg-primary/10 border-2 border-primary/30 flex items-center justify-center">
            <ShieldAlert className="h-8 w-8 text-primary" />
          </div>
          <div>
            <h1 className="text-2xl font-bold font-mono uppercase tracking-wider text-primary">RAKSHAK</h1>
            <p className="text-sm text-muted-foreground mt-1">CB/CID Intelligence Platform</p>
            <p className="text-xs text-muted-foreground/60 mt-0.5">Karnataka State Police — Restricted Access</p>
          </div>
        </CardHeader>

        <form onSubmit={handleSubmit}>
          <CardContent className="space-y-4 pt-4">
            {error && (
              <div className="flex items-center gap-2 p-3 rounded-md bg-destructive/10 border border-destructive/20 text-destructive text-sm">
                <AlertCircle className="h-4 w-4 shrink-0" />
                {error}
              </div>
            )}

            <div className="space-y-2">
              <label className="text-xs font-mono uppercase tracking-wider text-muted-foreground">Officer ID</label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="e.g. KCID001 or admin"
                  value={officerId}
                  onChange={(e) => setOfficerId(e.target.value)}
                  className="pl-9 font-mono bg-background/50"
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-xs font-mono uppercase tracking-wider text-muted-foreground">Password</label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  type="password"
                  placeholder="Enter password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="pl-9 font-mono bg-background/50"
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-xs font-mono uppercase tracking-wider text-muted-foreground">District</label>
              <div className="relative">
                <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground z-10" />
                <Select value={district} onValueChange={setDistrict}>
                  <SelectTrigger className="pl-9 font-mono bg-background/50">
                    <SelectValue placeholder="Select District" />
                  </SelectTrigger>
                  <SelectContent>
                    {DISTRICTS.map((d) => (
                      <SelectItem key={d} value={d}>{d}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
          </CardContent>

          <CardFooter className="flex-col gap-4 pt-2">
            <Button type="submit" className="w-full font-mono uppercase tracking-wider" size="lg">
              <Lock className="mr-2 h-4 w-4" /> Login Securely
            </Button>
            <p className="text-[10px] text-muted-foreground/50 text-center">
              Karnataka CB/CID — Official Use Only • Unauthorized access is punishable under IT Act
            </p>
            <p className="text-[10px] text-muted-foreground/40 text-center">
              Demo: Officer ID <span className="font-mono text-primary/60">admin</span> / Password <span className="font-mono text-primary/60">admin</span>
            </p>
          </CardFooter>
        </form>
      </Card>
    </div>
  );
}
