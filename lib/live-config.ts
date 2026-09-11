import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";

export function loadDotEnv() {
  const path = join(process.cwd(), ".env");
  if (!existsSync(path)) return;
  for (const raw of readFileSync(path, "utf8").split(/\r?\n/)) {
    const line = raw.trim();
    if (!line || line.startsWith("#")) continue;
    const eq = line.indexOf("=");
    if (eq < 1) continue;
    const key = line.slice(0, eq).trim();
    let val = line.slice(eq + 1).trim();
    if ((val.startsWith('"') && val.endsWith('"')) || (val.startsWith("'") && val.endsWith("'"))) {
      val = val.slice(1, -1);
    }
    if (process.env[key] == null || process.env[key] === "") process.env[key] = val;
  }
}

export function isLiveConfigured(): boolean {
  return (
    process.env.TRADING_MODE === "live" &&
    process.env.I_ACCEPT_LIVE_TRADING === "yes" &&
    Boolean(process.env.CEX_API_KEY) &&
    Boolean(process.env.CEX_API_SECRET)
  );
}

export function liveLimits() {
  return {
    maxUsdt: Math.max(10, Number(process.env.LIVE_MAX_USDT || 40)),
    maxOrderUsdt: Math.max(6, Number(process.env.LIVE_MAX_ORDER_USDT || 12)),
    minOrderUsdt: Math.max(5, Number(process.env.LIVE_MIN_ORDER_USDT || 6)),
    cexId: (process.env.CEX_ID || "binance").toLowerCase()
  };
}

export function toUsdtMarket(symbol: string): string {
  const s = symbol.trim().toUpperCase().replace(/^\$/, "");
  if (s.includes("/")) return s.endsWith("/USDT") ? s : `${s.split("/")[0]}/USDT`;
  return `${s}/USDT`;
}

export function capOrderUsdt(
  want: number,
  limits: { maxOrder: number; minOrder: number; cash: number }
): number {
  const capped = Math.min(want, limits.maxOrder, Math.max(0, limits.cash));
  if (capped < limits.minOrder) return 0;
  return Math.floor(capped * 100) / 100;
}

export function liveStatusPublic() {
  return {
    liveConfigured: isLiveConfigured(),
    envMode: process.env.TRADING_MODE || "paper",
    accepted: process.env.I_ACCEPT_LIVE_TRADING === "yes",
    hasKeys: Boolean(process.env.CEX_API_KEY && process.env.CEX_API_SECRET),
    exchange: liveLimits().cexId,
    maxUsdt: liveLimits().maxUsdt,
    maxOrderUsdt: liveLimits().maxOrderUsdt
  };
}
