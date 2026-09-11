import { NextResponse } from "next/server";
import { liveStatusPublic, loadDotEnv } from "@/lib/live-config";

export const dynamic = "force-dynamic";

export async function GET() {
  loadDotEnv();
  return NextResponse.json(liveStatusPublic());
}
