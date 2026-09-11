import { followCandidates, passesTradeFilters } from "./radar";
import type {
  MemeSettings,
  PaperAccount,
  Position,
  PriceMap,
  RadarCoin,
  TradeEvent
} from "./types";

function dayKey(now: number): string {
  return new Date(now).toISOString().slice(0, 10);
}

function pushEvent(account: PaperAccount, event: Omit<TradeEvent, "at">, now: number) {
  account.events = [{ at: now, ...event }, ...account.events].slice(0, 200);
}

function sleeveCash(account: PaperAccount, settings: MemeSettings): number {
  const equity = account.cashUsd + positionValue(account, {});
  return (equity * settings.memeSleevePct) / 100;
}

function positionValue(account: PaperAccount, prices: PriceMap): number {
  return account.positions.reduce((sum, p) => {
    const px = prices[p.symbol] ?? p.entryPrice;
    return sum + px * p.remainingQty;
  }, 0);
}

function openNotional(account: PaperAccount): number {
  return account.positions.reduce((sum, p) => sum + p.entryPrice * p.remainingQty, 0);
}

function resetDay(account: PaperAccount, now: number) {
  const key = dayKey(now);
  if (account.dayKey !== key) {
    account.dayKey = key;
    account.dailyPnl = 0;
    account.paused = false;
  }
}

export function markToMarketPnl(pos: Position, price: number): number {
  return (price - pos.entryPrice) * pos.remainingQty;
}

export function pctFromEntry(pos: Position, price: number): number {
  return ((price - pos.entryPrice) / pos.entryPrice) * 100;
}

function sell(
  account: PaperAccount,
  pos: Position,
  price: number,
  qty: number,
  kind: TradeEvent["kind"],
  now: number,
  note: string
) {
  const useQty = Math.min(qty, pos.remainingQty);
  const pnl = (price - pos.entryPrice) * useQty;
  account.cashUsd += price * useQty;
  account.dailyPnl += pnl;
  pos.remainingQty -= useQty;
  pushEvent(account, { kind, symbol: pos.symbol, price, qty: useQty, pnlUsd: round2(pnl), note }, now);

  if (pos.remainingQty <= 1e-9) {
    account.positions = account.positions.filter((p) => p.id !== pos.id);
    const existing = account.oldWatchlist.find((o) => o.symbol === pos.symbol);
    if (existing) {
      existing.lastSellPrice = price;
      existing.peak = Math.max(existing.peak, pos.peakPrice, price);
      if (kind === "sell_sl") existing.dipUsed = false;
    } else {
      account.oldWatchlist.push({
        symbol: pos.symbol,
        lastSellPrice: price,
        peak: Math.max(pos.peakPrice, price),
        dipUsed: kind !== "sell_sl"
      });
    }
    if (kind === "sell_sl") account.lastStopAt = now;
  }
}

function buy(
  account: PaperAccount,
  symbol: string,
  price: number,
  usd: number,
  source: Position["source"],
  now: number
): boolean {
  if (usd < 1 || account.cashUsd < usd) return false;
  const qty = usd / price;
  account.cashUsd -= usd;
  const pos: Position = {
    id: `${symbol}-${now}`,
    symbol,
    entryPrice: price,
    qty,
    remainingQty: qty,
    openedAt: now,
    peakPrice: price,
    scaledOut: false,
    source
  };
  account.positions.push(pos);
  pushEvent(account, { kind: "buy", symbol, price, qty, note: `Mua ${source} ~$${usd.toFixed(2)}` }, now);
  return true;
}

export function round2(n: number): number {
  return Math.round(n * 100) / 100;
}

export function tickMeme(input: {
  account: PaperAccount;
  settings: MemeSettings;
  radar: RadarCoin[];
  prices: PriceMap;
  now: number;
}): { account: PaperAccount; followed: string[]; alerts: string[] } {
  const account: PaperAccount = structuredClone(input.account);
  const { settings, radar, prices, now } = input;
  resetDay(account, now);

  const equity = account.startCashUsd;
  if (account.dailyPnl <= (-equity * settings.dailyLossPausePct) / 100) {
    if (!account.paused) {
      account.paused = true;
      pushEvent(
        account,
        { kind: "pause", symbol: "*", note: `Pause: lỗ ngày chạm ${settings.dailyLossPausePct}% sleeve gốc` },
        now
      );
    }
  }

  const alerts: string[] = [];
  for (const coin of radar) {
    if (!coin.listedOnCex && coin.rank <= 5) {
      alerts.push(`${coin.symbol} đang nổi trên DEX — chỉ cảnh báo, không auto-mua`);
      const already = account.events.some((e) => e.kind === "alert" && e.symbol === coin.symbol);
      if (!already) {
        pushEvent(account, { kind: "alert", symbol: coin.symbol, note: "DEX-only: không follow live" }, now);
      }
    }
    if (coin.spreadPct > settings.maxSpreadPct && coin.listedOnCex) {
      const already = account.events.some((e) => e.kind === "skip" && e.symbol === coin.symbol);
      if (!already) {
        pushEvent(
          account,
          { kind: "skip", symbol: coin.symbol, note: `Bỏ qua: spread ${coin.spreadPct}% > ${settings.maxSpreadPct}%` },
          now
        );
      }
    }
  }

  for (const pos of [...account.positions]) {
    const price = prices[pos.symbol];
    if (!price) continue;
    pos.peakPrice = Math.max(pos.peakPrice, price);
    const pct = pctFromEntry(pos, price);
    const heldMin = (now - pos.openedAt) / 60_000;

    if (pct <= -settings.stopLossPct) {
      sell(account, pos, price, pos.remainingQty, "sell_sl", now, `Cắt lỗ ${pct.toFixed(2)}%`);
      continue;
    }

    if (settings.scaleOut && !pos.scaledOut && pct >= settings.takeProfitPct) {
      sell(account, pos, price, pos.remainingQty / 2, "sell_scale", now, `Chốt sớm 50% +${pct.toFixed(2)}%`);
      pos.scaledOut = true;
      continue;
    }

    if (!settings.scaleOut && pct >= settings.takeProfitPct) {
      sell(account, pos, price, pos.remainingQty, "sell_tp", now, `Chốt sớm +${pct.toFixed(2)}%`);
      continue;
    }

    if (pos.scaledOut) {
      const trailPct = ((price - pos.peakPrice) / pos.peakPrice) * 100;
      if (trailPct <= -3 || pct >= settings.takeProfitPct + 3) {
        sell(account, pos, price, pos.remainingQty, "sell_tp", now, "Chốt phần còn lại (trailing / TP phụ)");
        continue;
      }
    }

    if (heldMin >= settings.maxHoldMinutes && pct < settings.takeProfitPct) {
      sell(account, pos, price, pos.remainingQty, "sell_time", now, `Hết ${settings.maxHoldMinutes} phút — bán, không gồng`);
    }
  }

  if (account.paused) {
    return { account, followed: [], alerts };
  }

  const cooldownMs = settings.cooldownMinutes * 60_000;
  const inCooldown = now - account.lastStopAt < cooldownMs;

  const followed: string[] = [];
  const justStoppedSymbols = new Set(
    account.events.filter((e) => e.kind === "sell_sl" && now - e.at < 10_000).map((e) => e.symbol)
  );
  const justSoldSymbols = new Set(
    account.events
      .filter((e) => e.kind.startsWith("sell_") && now - e.at < 10_000)
      .map((e) => e.symbol)
  );
  const openSymbols = new Set(account.positions.map((p) => p.symbol));
  const slots = settings.maxOpenMemes - account.positions.length;
  const sizeUsd = Math.min(
    account.cashUsd * 0.45,
    Math.max(10, sleeveCash(account, settings) / Math.max(1, settings.maxOpenMemes))
  );

  if (slots > 0 && !inCooldown && justStoppedSymbols.size > 0) {
    const rotate = followCandidates(radar, settings).find(
      (c) => !justStoppedSymbols.has(c.symbol) && !openSymbols.has(c.symbol) && prices[c.symbol]
    );
    if (rotate && buy(account, rotate.symbol, prices[rotate.symbol], sizeUsd, "rotate", now)) {
      openSymbols.add(rotate.symbol);
    }
  }

  if (account.positions.length < settings.maxOpenMemes && !inCooldown) {
    const remain = settings.maxOpenMemes - account.positions.length;
    const candidates = followCandidates(radar, settings).filter(
      (c) =>
        !openSymbols.has(c.symbol) &&
        !justStoppedSymbols.has(c.symbol) &&
        !justSoldSymbols.has(c.symbol) &&
        prices[c.symbol]
    );
    for (const coin of candidates.slice(0, remain)) {
      if (buy(account, coin.symbol, prices[coin.symbol], sizeUsd, "follow", now)) {
        followed.push(coin.symbol);
        openSymbols.add(coin.symbol);
      }
    }
  }

  if (account.positions.length < settings.maxOpenMemes && !inCooldown) {
    for (const old of account.oldWatchlist) {
      if (old.dipUsed) continue;
      if (openSymbols.has(old.symbol)) continue;
      if (account.positions.length >= settings.maxOpenMemes) break;
      const price = prices[old.symbol];
      if (!price) continue;
      const ref = Math.max(old.lastSellPrice, old.peak);
      const drop = ((ref - price) / ref) * 100;
      const coin = radar.find((c) => c.symbol === old.symbol);
      if (coin && !passesTradeFilters(coin, settings)) continue;
      if (drop >= settings.dipBuyPct) {
        if (buy(account, old.symbol, price, sizeUsd, "dip", now)) {
          old.dipUsed = true;
          openSymbols.add(old.symbol);
        }
      }
    }
  }

  return { account, followed, alerts };
}

export function emptyPaper(cashUsd: number, now = Date.now()): PaperAccount {
  return {
    cashUsd,
    startCashUsd: cashUsd,
    positions: [],
    oldWatchlist: [],
    lastStopAt: 0,
    dailyPnl: 0,
    dayKey: dayKey(now),
    paused: false,
    events: []
  };
}
