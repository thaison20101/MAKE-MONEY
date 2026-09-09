import { NextResponse } from "next/server";
import { tickMeme } from "@/lib/meme-engine";
import { loadState, resetState, saveState, updateState } from "@/lib/store";
import { runWorkerTick } from "@/lib/worker-tick";
import type { AppState, MemeSettings } from "@/lib/types";

export const dynamic = "force-dynamic";

export async function GET() {
  return NextResponse.json(loadState());
}

type Action =
  | { type: "reset" }
  | { type: "wallet"; address: string }
  | { type: "onboarding"; id: string; done: boolean }
  | { type: "lesson"; id: string; understood: boolean }
  | { type: "meme"; settings: Partial<MemeSettings> }
  | { type: "module"; id: string; enabled: boolean }
  | { type: "game"; id: string; selected: boolean }
  | { type: "tick" }
  | { type: "mode"; tradingMode: AppState["tradingMode"] }
  | { type: "demoShock"; symbol: string; factor: number };

export async function POST(req: Request) {
  const body = (await req.json()) as Action;

  if (body.type === "reset") return NextResponse.json(resetState());

  if (body.type === "tick") {
    const next = await runWorkerTick(loadState(), { fetchRadar: false });
    return NextResponse.json(saveState(next));
  }

  if (body.type === "demoShock") {
    const current = loadState();
    if (current.prices[body.symbol] != null) {
      current.prices[body.symbol] *= body.factor;
    }
    const meme = tickMeme({
      account: current.paper,
      settings: current.meme,
      radar: current.radar,
      prices: current.prices,
      now: Date.now()
    });
    current.paper = meme.account;
    return NextResponse.json(saveState(current));
  }

  const state = updateState((s) => {
    const n: AppState = structuredClone(s);
    switch (body.type) {
      case "wallet":
        n.walletAddress = body.address.trim();
        break;
      case "onboarding": {
        const step = n.onboarding.find((x) => x.id === body.id);
        if (step) step.done = body.done;
        break;
      }
      case "lesson": {
        const les = n.lessons.find((x) => x.id === body.id);
        if (les) les.understood = body.understood;
        break;
      }
      case "meme":
        n.meme = { ...n.meme, ...body.settings };
        break;
      case "module": {
        const m = n.modules.find((x) => x.id === body.id);
        if (m) m.enabled = body.enabled;
        break;
      }
      case "game": {
        const g = n.games.find((x) => x.id === body.id);
        if (g) g.selected = body.selected;
        break;
      }
      case "mode":
        n.tradingMode = body.tradingMode === "live" ? "live" : "paper";
        break;
      default:
        break;
    }
    return n;
  });

  return NextResponse.json(state);
}
