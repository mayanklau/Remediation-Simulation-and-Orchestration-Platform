import { NextResponse } from "next/server";
import { buildProductionEffectivenessModel } from "@/domain/production-effectiveness";

export async function GET() {
  return NextResponse.json({ effectiveness: buildProductionEffectivenessModel() });
}
