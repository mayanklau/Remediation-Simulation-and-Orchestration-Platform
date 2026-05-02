import { NextResponse } from "next/server";
import { buildCyberRiskIntelligenceModel } from "@/domain/cyber-risk-intelligence";

export async function GET() {
  return NextResponse.json({ intelligence: buildCyberRiskIntelligenceModel() });
}
