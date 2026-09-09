import { NextResponse } from "next/server";
import { readLesson, ETHEREUM_LESSONS } from "@/lib/docs";

export const dynamic = "force-dynamic";

export async function GET(req: Request) {
  const id = new URL(req.url).searchParams.get("id") || "01";
  const lesson = readLesson(id);
  if (!lesson) return NextResponse.json({ error: "not found" }, { status: 404 });
  return NextResponse.json({ ...lesson, catalog: ETHEREUM_LESSONS });
}
