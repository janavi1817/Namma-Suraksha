import React, { useState, useCallback } from "react";
import { useLocation } from "wouter";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useCreateInvestigation, getListInvestigationsQueryKey } from "@workspace/api-client-react";
import { useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { Progress } from "@/components/ui/progress";
import {
  Upload, FileCode2, ShieldAlert, Cpu, Sparkles, Loader2,
  ArrowRight, CheckCircle2, AlertTriangle, Zap, Shield, Eye,
} from "lucide-react";

const formSchema = z.object({
  sampleName: z.string().min(1, "Sample name is required"),
  sha256: z.string().length(64, "SHA-256 must be exactly 64 characters"),
  packageName: z.string().optional(),
  versionName: z.string().optional(),
  targetSdk: z.coerce.number().optional().or(z.literal("").transform(() => undefined)),
  compileSdk: z.coerce.number().optional().or(z.literal("").transform(() => undefined)),
  permissions: z.string().optional(),
  urls: z.string().optional(),
  domains: z.string().optional(),
  ipAddresses: z.string().optional(),
  apiKeys: z.string().optional(),
  codeSnippets: z.string().optional(),
});
type FormValues = z.infer<typeof formSchema>;

const DEMO_PAYLOAD: Partial<FormValues> = {
  sampleName: "FakeBanking_v2.apk",
  sha256: "8d234568b25e1fc4a47558319f6a1e35a0928374828dfb8417c80e1b21235b3f",
  packageName: "com.example.app",
  versionName: "1.0.0",
  targetSdk: 33,
  compileSdk: 34,
  permissions: "android.permission.READ_CONTACTS\nandroid.permission.SEND_SMS\nandroid.permission.ACCESS_FINE_LOCATION",
  urls: "https://api.example.com/upload\nhttps://cdn.malware.net/payload",
  domains: "malware.net\nc2server.xyz",
  ipAddresses: "192.168.1.1\n45.33.32.156",
  apiKeys: "AIzaSy...\nsk-live-...",
  codeSnippets: "Paste suspicious Java/Smali code here...",
};

const SCAN_STEPS = [
  { label: "Receiving APK file...", icon: Upload },
  { label: "Extracting certificate fingerprint...", icon: Shield },
  { label: "Reading package manifest...", icon: FileCode2 },
  { label: "Scanning embedded URLs & IPs...", icon: Eye },
  { label: "Auditing permissions...", icon: ShieldAlert },
  { label: "Matching against threat database...", icon: Zap },
  { label: "Running AI-powered analysis...", icon: Cpu },
  { label: "Generating investigation report...", icon: Sparkles },
];

export default function NewInvestigation() {
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [analysisStep, setAnalysisStep] = useState(0);
  const [progress, setProgress] = useState(0);
  const [isDragging, setIsDragging] = useState(false);
  const [uploadedFile, setUploadedFile] = useState<string | null>(null);

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: { sampleName: "", sha256: "", packageName: "", versionName: "", permissions: "", urls: "", domains: "", ipAddresses: "", apiKeys: "", codeSnippets: "" },
  });

  const createInvestigation = useCreateInvestigation();

  const loadDemoData = () => {
    Object.entries(DEMO_PAYLOAD).forEach(([k, v]) => form.setValue(k as any, v));
    setUploadedFile("FakeBanking_v2.apk");
    toast({ title: "Sample Trojan Loaded", description: "Form filled with demo banking trojan data." });
  };

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files[0];
    if (file && (file.name.endsWith(".apk") || file.name.endsWith(".aab"))) {
      setUploadedFile(file.name);
      form.setValue("sampleName", file.name);
      // Generate a fake SHA256 for demo
      const fakeHash = Array.from({ length: 64 }, () => "0123456789abcdef"[Math.floor(Math.random() * 16)]).join("");
      form.setValue("sha256", fakeHash);
      toast({ title: "APK Received", description: `${file.name} (${(file.size / 1024 / 1024).toFixed(1)} MB)` });
    } else {
      toast({ title: "Invalid File", description: "Only .apk and .aab files are supported.", variant: "destructive" });
    }
  }, [form, toast]);

  const parseArrayField = (val?: string) => val ? val.split(/[\n,]+/).map(s => s.trim()).filter(Boolean) : [];

  React.useEffect(() => {
    if (!createInvestigation.isPending) return;
    const interval = setInterval(() => {
      setAnalysisStep(prev => prev >= SCAN_STEPS.length - 1 ? prev : prev + 1);
      setProgress(prev => Math.min(prev + (100 / SCAN_STEPS.length), 95));
    }, 2500);
    return () => clearInterval(interval);
  }, [createInvestigation.isPending]);

  const onSubmit = (values: FormValues) => {
    setAnalysisStep(0);
    setProgress(0);
    createInvestigation.mutate({
      data: {
        ...values,
        permissions: parseArrayField(values.permissions),
        urls: parseArrayField(values.urls),
        domains: parseArrayField(values.domains),
        ipAddresses: parseArrayField(values.ipAddresses),
        apiKeys: parseArrayField(values.apiKeys),
        phoneNumbers: [],
        codeSnippets: values.codeSnippets || null,
      },
    }, {
      onSuccess: (data) => {
        setProgress(100);
        queryClient.invalidateQueries({ queryKey: getListInvestigationsQueryKey() });
        toast({ title: "Analysis Complete", description: "AI investigation finished." });
        setTimeout(() => setLocation(`/investigations/${data.id}`), 600);
      },
      onError: (error) => {
        toast({ title: "Analysis Failed", description: error.message || "An error occurred.", variant: "destructive" });
      },
    });
  };

  // ── Scanning animation screen ──
  if (createInvestigation.isPending) {
    return (
      <div className="min-h-[80vh] flex items-center justify-center p-6">
        <Card className="w-full max-w-lg border-primary/20 shadow-2xl shadow-primary/10 bg-card/90 backdrop-blur-xl overflow-hidden">
          {/* Animated top bar */}
          <div className="h-1 bg-gradient-to-r from-primary via-blue-500 to-primary bg-[length:200%_100%] animate-[shimmer_2s_linear_infinite]" />
          <CardHeader className="text-center pb-2">
            <div className="mx-auto w-16 h-16 rounded-full bg-primary/10 border-2 border-primary/30 flex items-center justify-center mb-4 relative">
              <Cpu className="h-7 w-7 text-primary animate-pulse" />
              <div className="absolute inset-0 rounded-full border-2 border-primary/20 animate-ping" />
            </div>
            <CardTitle className="text-xl font-mono uppercase tracking-wider">Scanning in Progress</CardTitle>
            <CardDescription>AI-powered autonomous analysis running...</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6 pt-4">
            <div className="relative">
              <Progress value={progress} className="h-3" />
              <span className="absolute right-0 -top-5 text-xs font-mono text-primary">{Math.round(progress)}%</span>
            </div>
            <div className="space-y-3 font-mono text-sm">
              {SCAN_STEPS.map((step, idx) => {
                const Icon = step.icon;
                const state = idx < analysisStep ? "done" : idx === analysisStep ? "active" : "pending";
                return (
                  <div key={idx} className={`flex items-center gap-3 p-2 rounded-md transition-all duration-500 ${
                    state === "done" ? "text-green-400 bg-green-500/5" :
                    state === "active" ? "text-primary bg-primary/5 border border-primary/20" :
                    "text-muted-foreground/30"
                  }`}>
                    {state === "done" ? <CheckCircle2 className="h-4 w-4 text-green-400 shrink-0" /> :
                     state === "active" ? <Loader2 className="h-4 w-4 animate-spin shrink-0" /> :
                     <Icon className="h-4 w-4 shrink-0" />}
                    <span>{step.label}</span>
                    {state === "done" && <span className="ml-auto text-[10px] text-green-400/60">✓ Complete</span>}
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  // ── Main form ──
  return (
    <div className="p-6 md:p-8 max-w-4xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold font-mono uppercase tracking-tight text-foreground flex items-center gap-2">
            <Upload className="h-6 w-6 text-primary" /> New Investigation
            <Badge variant="secondary" className="text-[10px] bg-primary/10 text-primary border-primary/20">AI-powered</Badge>
          </h1>
          <p className="text-muted-foreground text-sm mt-1">Submit APK forensic artifacts for autonomous analysis.</p>
        </div>
        <Button variant="outline" size="sm" onClick={loadDemoData} className="font-mono text-xs uppercase tracking-wider">
          Load sample trojan
        </Button>
      </div>

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          {/* APK File Drop Zone */}
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-xs font-mono uppercase text-muted-foreground tracking-widest">APK File</CardTitle>
            </CardHeader>
            <CardContent>
              <div
                onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
                onDragLeave={() => setIsDragging(false)}
                onDrop={handleDrop}
                onClick={() => { loadDemoData(); }}
                className={`relative border-2 border-dashed rounded-xl p-8 text-center cursor-pointer transition-all duration-300 ${
                  isDragging ? "border-primary bg-primary/5 scale-[1.02]" :
                  uploadedFile ? "border-green-500/50 bg-green-500/5" :
                  "border-border/50 hover:border-primary/50 hover:bg-muted/30"
                }`}
              >
                {uploadedFile ? (
                  <div className="flex flex-col items-center gap-2">
                    <CheckCircle2 className="h-8 w-8 text-green-400" />
                    <p className="font-mono text-sm font-bold text-green-400">{uploadedFile}</p>
                    <p className="text-xs text-muted-foreground">File ready for analysis</p>
                  </div>
                ) : (
                  <div className="flex flex-col items-center gap-2">
                    <Upload className={`h-8 w-8 transition-transform ${isDragging ? "text-primary scale-110" : "text-muted-foreground"}`} />
                    <p className="text-sm font-medium">Drop APK / AAB here or click to browse</p>
                    <p className="text-xs text-muted-foreground">Supports .apk and .aab files — max 500 MB</p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Core File Metadata */}
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-xs font-mono uppercase text-muted-foreground tracking-widest">Core File Metadata</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField control={form.control} name="sampleName" render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-xs text-muted-foreground">Sample name *</FormLabel>
                    <FormControl><Input placeholder="e.g. FakeBanking_v2.apk" {...field} className="font-mono text-sm bg-muted/30 border-border/50" /></FormControl>
                    <FormMessage />
                  </FormItem>
                )} />
                <FormField control={form.control} name="sha256" render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-xs text-muted-foreground">SHA-256 hash *</FormLabel>
                    <FormControl><Input placeholder="64-character hex string" {...field} className="font-mono text-sm bg-muted/30 border-border/50" /></FormControl>
                    <FormMessage />
                  </FormItem>
                )} />
              </div>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <FormField control={form.control} name="packageName" render={({ field }) => (
                  <FormItem className="col-span-2">
                    <FormLabel className="text-xs text-muted-foreground">Package name</FormLabel>
                    <FormControl><Input placeholder="com.example.app" {...field} className="font-mono text-sm bg-muted/30 border-border/50" /></FormControl>
                  </FormItem>
                )} />
                <FormField control={form.control} name="versionName" render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-xs text-muted-foreground">Version</FormLabel>
                    <FormControl><Input placeholder="1.0.0" {...field} className="font-mono text-sm bg-muted/30 border-border/50" /></FormControl>
                  </FormItem>
                )} />
                <div className="grid grid-cols-2 gap-2">
                  <FormField control={form.control} name="targetSdk" render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-xs text-muted-foreground">Target SDK</FormLabel>
                      <FormControl><Input type="number" placeholder="33" {...field} className="font-mono text-sm bg-muted/30 border-border/50" /></FormControl>
                    </FormItem>
                  )} />
                  <FormField control={form.control} name="compileSdk" render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-xs text-muted-foreground">Compile SDK</FormLabel>
                      <FormControl><Input type="number" placeholder="34" {...field} className="font-mono text-sm bg-muted/30 border-border/50" /></FormControl>
                    </FormItem>
                  )} />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Extracted Artifacts */}
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-xs font-mono uppercase text-muted-foreground tracking-widest">Extracted Artifacts</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <FormField control={form.control} name="permissions" render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-xs text-muted-foreground">Manifest permissions</FormLabel>
                  <FormControl><Textarea placeholder={"android.permission.READ_CONTACTS\nandroid.permission.SEND_SMS\nandroid.permission.ACCESS_FINE_LOCATION"} {...field} className="font-mono text-sm min-h-[80px] bg-muted/30 border-border/50" /></FormControl>
                </FormItem>
              )} />
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField control={form.control} name="urls" render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-xs text-muted-foreground">Extracted URLs</FormLabel>
                    <FormControl><Textarea placeholder={"https://api.example.com/upload\nhttps://cdn.malware.net/payload"} {...field} className="font-mono text-sm min-h-[80px] bg-muted/30 border-border/50" /></FormControl>
                  </FormItem>
                )} />
                <FormField control={form.control} name="domains" render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-xs text-muted-foreground">Domains</FormLabel>
                    <FormControl><Textarea placeholder={"malware.net\nc2server.xyz"} {...field} className="font-mono text-sm min-h-[80px] bg-muted/30 border-border/50" /></FormControl>
                  </FormItem>
                )} />
                <FormField control={form.control} name="ipAddresses" render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-xs text-muted-foreground">IP addresses</FormLabel>
                    <FormControl><Textarea placeholder={"192.168.1.1\n45.33.32.156"} {...field} className="font-mono text-sm min-h-[80px] bg-muted/30 border-border/50" /></FormControl>
                  </FormItem>
                )} />
                <FormField control={form.control} name="apiKeys" render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-xs text-muted-foreground">Hardcoded API keys</FormLabel>
                    <FormControl><Textarea placeholder={"AIzaSy...\nsk-live-..."} {...field} className="font-mono text-sm min-h-[80px] bg-muted/30 border-border/50" /></FormControl>
                  </FormItem>
                )} />
              </div>
              <FormField control={form.control} name="codeSnippets" render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-xs text-muted-foreground">Decompiled code snippets</FormLabel>
                  <FormControl><Textarea placeholder="Paste suspicious Java/Smali code here..." {...field} className="font-mono text-xs min-h-[160px] bg-slate-950/50 border-border/50" /></FormControl>
                </FormItem>
              )} />
            </CardContent>
            <CardFooter className="bg-muted/20 py-4 flex flex-col items-center gap-2 border-t border-border/50">
              <Button type="submit" size="lg" className="w-full max-w-xs font-mono uppercase tracking-wider text-base">
                Run analysis
              </Button>
              <p className="text-[10px] text-muted-foreground/50">Analysis is performed by AI — results are advisory only</p>
            </CardFooter>
          </Card>
        </form>
      </Form>
    </div>
  );
}
