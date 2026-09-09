import { tickMeme } from "./meme-engine";
import { runEnabledModules } from "./modules";
import { fetchPublicRadar } from "./radar-fetch";
import { fetchAllowlistResearch } from "./research-fetch";
import { notifyTelegram } from "./telegram";
import type { AppState } from "./types";

function walkPrices(prices: Record<string, number>, now: number): Record<string, number> {
  const next = { ...prices };
  for (const [sym, px] of Object.entries(next)) {
    const wave = Math.sin(now / 60000 + sym.length) * 0.012;
    const jitter = ((now / 1000 + sym.charCodeAt(0)) % 7) / 1000;
    next[sym] = Math.max(px * (1 + wave * 0.15 + jitter * 0.01), px * 0.2);
  }
  return next;
}

export async function runWorkerTick(state: AppState, opts?: { fetchRadar?: boolean }): Promise<AppState> {
  const now = Date.now();
  let next: AppState = structuredClone(state);

  if (opts?.fetchRadar !== false) {
    try {
      const live = await fetchPublicRadar();
      if (live.length) {
        const seedCex = next.radar.filter((c) => c.listedOnCex);
        const merged = [...live, ...seedCex.filter((s) => !live.some((l) => l.symbol === s.symbol))];
        next.radar = merged.slice(0, 24).map((c, i) => ({ ...c, rank: i + 1 }));
        for (const c of next.radar) {
          if (next.prices[c.symbol] == null) next.prices[c.symbol] = 1;
        }
      }
    } catch {
      /* giữ radar cũ */
    }
  }

  if (opts?.fetchRadar !== false && next.modules.find((m) => m.id === "research-rss")?.enabled) {
    try {
      const fresh = await fetchAllowlistResearch();
      if (fresh.length) {
        const keep = next.research.filter((r) => r.id.startsWith("r"));
        next.research = [...fresh, ...keep].slice(0, 20);
      }
    } catch {
      /* giữ feed cũ */
    }
  }

  next.prices = walkPrices(next.prices, now);

  if (next.modules.find((m) => m.id === "meme-wave")?.enabled) {
    const meme = tickMeme({
      account: next.paper,
      settings: next.meme,
      radar: next.radar,
      prices: next.prices,
      now
    });
    next.paper = meme.account;
    const lastBuy = meme.account.events.find((e) => e.kind === "buy" && now - e.at < 2000);
    if (lastBuy) {
      await notifyTelegram(`Paper follow ${lastBuy.symbol} @ ${lastBuy.price}`);
    }
    const lastTp = meme.account.events.find((e) => (e.kind === "sell_tp" || e.kind === "sell_scale") && now - e.at < 2000);
    if (lastTp) {
      await notifyTelegram(`Chốt sớm ${lastTp.symbol} PnL ${lastTp.pnlUsd}`);
    }
  }

  const ran = runEnabledModules(next, now);
  next = ran.state;
  return next;
}
