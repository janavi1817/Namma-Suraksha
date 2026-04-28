import React from "react";
import { Badge } from "@/components/ui/badge";

export function RiskBadge({ level }: { level: string }) {
  const normalizedLevel = level.toLowerCase();
  
  let variant: "default" | "secondary" | "destructive" | "outline" = "default";
  let bgClass = "";
  
  if (normalizedLevel === "critical") {
    bgClass = "bg-[#ff3333] hover:bg-[#ff3333]/80 text-white border-transparent";
  } else if (normalizedLevel === "high") {
    bgClass = "bg-[#ff8800] hover:bg-[#ff8800]/80 text-white border-transparent";
  } else if (normalizedLevel === "medium") {
    bgClass = "bg-[#ffcc00] hover:bg-[#ffcc00]/80 text-black border-transparent";
  } else if (normalizedLevel === "low") {
    bgClass = "bg-[#00cc66] hover:bg-[#00cc66]/80 text-white border-transparent";
  }
  
  return (
    <Badge variant="outline" className={`${bgClass} font-mono font-semibold uppercase tracking-wider text-[10px]`}>
      {level}
    </Badge>
  );
}
