import { isLiveConfigured, liveLimits, loadDotEnv } from "../lib/live-config";
import { loadState, saveState } from "../lib/store";
import { runWorkerTick } from "../lib/worker-tick";
import { executeLiveEvent, fetchCexPrices, fetchUsdtFree } from "../lib/cex-live";
import { notifyTelegram } from "../lib/telegram";
import type { AppState, TradeEvent } from "../lib/types";

loadDotEnv();

const INTERVAL_MS = Number(process.env.WORKER_INTERVAL_MS || 45_000);

function undoPaperBuy(state: AppState, event: TradeEvent) {
  const pos = [...state.paper.positions].reverse().find((p) => p.symbol === event.symbol);
  if (!pos) return;
  state.paper.positions = state.paper.positions.filter((p) => p.id !== pos.id);
  state.paper.cashUsd += pos.entryPrice * pos.remainingQty;
}

async function liveTick(state: AppState): Promise<AppState> {
  const now = Date.now();
  const symbols = state.radar.filter((c) => c.listedOnCex).map((c) => c.symbol);
  try {
    const real = await fetchCexPrices(symbols);
    state.prices = { ...state.prices, ...real };
    const free = await fetchUsdtFree();
    state.paper.cashUsd = Math.min(free, liveLimits().maxUsdt);
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err);
    state.paper.events = [
      { at: now, kind: "alert" as const, symbol: "*", note: `Live giá/số dư lỗi: ${msg}` },
      ...state.paper.events
    ].slice(0, 200);
    await notifyTelegram(`Live lỗi: ${msg}`);
    return state;
  }

  const next = await runWorkerTick(state, { fetchRadar: true, skipPriceWalk: true });
  const fresh = next.paper.events.filter((e) => now - e.at < 8000);
  let cash = next.paper.cashUsd;
  for (const event of [...fresh].reverse()) {
    const result = await executeLiveEvent(event, cash);
    event.note = `${event.note} | ${result.note}`;
    if (event.kind === "buy") {
      if (result.ok) cash -= (event.qty || 0) * (event.price || 0);
      else undoPaperBuy(next, event);
    }
    if (result.note !== "bỏ qua loại sự kiện" && result.note !== "không live") {
      await notifyTelegram(result.note);
    }
  }
  next.tradingMode = "live";
  return next;
}

async function loop() {
  console.log(`[worker] tick ${new Date().toISOString()} live=${isLiveConfigured()}`);
  try {
    const current = loadState();
    const next = isLiveConfigured()
      ? await liveTick(current)
      : await runWorkerTick(current, { fetchRadar: true });
    saveState(next);
    console.log(
      `[worker] radar=${next.radar.length} positions=${next.paper.positions.length} earnings=${next.earnings.length}`
    );
  } catch (err) {
    console.error("[worker] error", err);
  }
}

const limits = liveLimits();
console.log(
  `[worker] interval ${INTERVAL_MS}ms mode=${process.env.TRADING_MODE || "paper"} liveConfigured=${isLiveConfigured()} maxOrder=${limits.maxOrderUsdt}`
);
void loop();
setInterval(() => {
  void loop();
}, INTERVAL_MS);
