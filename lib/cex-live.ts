import ccxt, { type Exchange } from "ccxt";
import { capOrderUsdt, isLiveConfigured, liveLimits, toUsdtMarket } from "./live-config";
import type { PriceMap, TradeEvent } from "./types";

let cached: Exchange | null = null;

function createExchange(privateApi: boolean): Exchange {
  const id = liveLimits().cexId;
  const opts: Record<string, unknown> = {
    enableRateLimit: true,
    options: { defaultType: "spot" }
  };
  if (privateApi) {
    opts.apiKey = process.env.CEX_API_KEY;
    opts.secret = process.env.CEX_API_SECRET;
    if (process.env.CEX_PASSWORD) opts.password = process.env.CEX_PASSWORD;
  }
  let ex: Exchange;
  if (id === "bybit") ex = new ccxt.bybit(opts);
  else if (id === "okx") ex = new ccxt.okx(opts);
  else if (id === "binance") ex = new ccxt.binance(opts);
  else throw new Error(`Sàn không hỗ trợ: ${id}`);
  ex.withdraw = async () => {
    throw new Error("Withdraw bị tắt trong tool");
  };
  return ex;
}

export function getPrivateExchange(): Exchange {
  if (!isLiveConfigured()) throw new Error("Live chưa cấu hình");
  if (!cached) cached = createExchange(true);
  return cached;
}

export function getPublicExchange(): Exchange {
  return createExchange(false);
}

export async function fetchCexPrices(symbols: string[]): Promise<PriceMap> {
  const ex = isLiveConfigured() ? getPrivateExchange() : getPublicExchange();
  await ex.loadMarkets();
  const prices: PriceMap = {};
  for (const raw of [...new Set(symbols)]) {
    const market = toUsdtMarket(raw);
    if (!ex.markets?.[market]) continue;
    try {
      const t = await ex.fetchTicker(market);
      const last = Number(t.last || t.close);
      if (last > 0) prices[raw.replace("/USDT", "")] = last;
    } catch {
      /* bỏ symbol lỗi */
    }
  }
  return prices;
}

export async function fetchUsdtFree(): Promise<number> {
  const ex = getPrivateExchange();
  const bal = await ex.fetchBalance();
  const free = Number(
    (bal as { USDT?: { free?: number }; free?: { USDT?: number } }).USDT?.free ??
      (bal as { free?: { USDT?: number } }).free?.USDT ??
      0
  );
  return Number.isFinite(free) ? free : 0;
}

export async function marketExists(symbol: string): Promise<boolean> {
  const ex = isLiveConfigured() ? getPrivateExchange() : getPublicExchange();
  await ex.loadMarkets();
  return Boolean(ex.markets?.[toUsdtMarket(symbol)]);
}

export type LiveExecResult = { ok: boolean; note: string };

export async function executeLiveEvent(event: TradeEvent, cashUsdt: number): Promise<LiveExecResult> {
  if (!isLiveConfigured()) return { ok: false, note: "không live" };
  const limits = liveLimits();
  const market = toUsdtMarket(event.symbol);
  const ex = getPrivateExchange();
  await ex.loadMarkets();
  if (!ex.markets?.[market]) return { ok: false, note: `${market} không có trên sàn — bỏ` };

  try {
    if (event.kind === "buy") {
      const want = (event.qty || 0) * (event.price || 0) || limits.maxOrderUsdt;
      const usd = capOrderUsdt(want, {
        maxOrder: Math.min(limits.maxOrderUsdt, limits.maxUsdt),
        minOrder: limits.minOrderUsdt,
        cash: Math.min(cashUsdt, limits.maxUsdt)
      });
      if (!usd) return { ok: false, note: "size dưới min/trần — không mua" };
      await ex.createMarketBuyOrderWithCost(market, usd);
      return { ok: true, note: `LIVE mua ${market} ~$${usd}` };
    }

    if (event.kind.startsWith("sell_") && event.qty && event.qty > 0) {
      const amount = Number(ex.amountToPrecision(market, event.qty));
      if (!(amount > 0)) return { ok: false, note: "qty bán không hợp lệ" };
      await ex.createMarketSellOrder(market, amount);
      return { ok: true, note: `LIVE bán ${market} qty ${amount}` };
    }
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err);
    return { ok: false, note: `Lệnh lỗi: ${msg}` };
  }
  return { ok: false, note: "bỏ qua loại sự kiện" };
}
