import { NextResponse } from "next/server";
import { buildProductionRealityModel } from "@/domain/production-reality";

export async function GET() {
  return NextResponse.json({ reality: buildProductionRealityModel() });
}
