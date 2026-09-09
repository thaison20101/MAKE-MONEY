import { loadState, saveState } from "../lib/store";
import { runWorkerTick } from "../lib/worker-tick";

const INTERVAL_MS = Number(process.env.WORKER_INTERVAL_MS || 45_000);

async function loop() {
  console.log(`[worker] tick ${new Date().toISOString()}`);
  try {
    const next = await runWorkerTick(loadState(), { fetchRadar: true });
    saveState(next);
    console.log(
      `[worker] radar=${next.radar.length} positions=${next.paper.positions.length} earnings=${next.earnings.length}`
    );
  } catch (err) {
    console.error("[worker] error", err);
  }
}

console.log(`[worker] 24/7 interval ${INTERVAL_MS}ms — TRADING_MODE=${process.env.TRADING_MODE || "paper"}`);
void loop();
setInterval(() => {
  void loop();
}, INTERVAL_MS);
