import { computeTrendScore, rankRadar } from "./radar";
import type { RadarCoin } from "./types";

type DexPair = {
  chainId?: string;
  baseToken?: { symbol?: string; name?: string };
  priceChange?: { h24?: number };
  volume?: { h24?: number };
  liquidity?: { usd?: number };
  pairCreatedAt?: number;
};

function ageHoursFrom(ts?: number): number {
  if (!ts) return 72;
  return Math.max(0, (Date.now() - ts) / 3_600_000);
}

export async function fetchPublicRadar(): Promise<RadarCoin[]> {
  const coins: Omit<RadarCoin, "trendScore" | "rank">[] = [];

  try {
    const dex = await fetch("https://api.dexscreener.com/token-boosts/top/v1", {
      headers: { accept: "application/json" },
      cache: "no-store"
    });
    if (dex.ok) {
      const boosts = (await dex.json()) as { tokenAddress?: string; description?: string }[];
      for (const row of boosts.slice(0, 8)) {
        const symbol = (row.description || row.tokenAddress || "DEX").slice(0, 12).toUpperCase();
        coins.push({
          id: `dex-${row.tokenAddress || symbol}`,
          symbol,
          name: row.description || "DexScreener boost",
          venue: "dex",
          listedOnCex: false,
          volume24h: 1_000_000,
          change24h: 20,
          spreadPct: 2.5,
          ageHours: 24,
          source: "dexscreener-boosts"
        });
      }
    }
  } catch {
    /* mạng lỗi: bỏ qua */
  }

  try {
    const cg = await fetch("https://api.coingecko.com/api/v3/search/trending", {
      headers: { accept: "application/json" },
      cache: "no-store"
    });
    if (cg.ok) {
      const json = (await cg.json()) as {
        coins?: { item?: { id: string; symbol: string; name: string; data?: { price_change_percentage_24h?: { usd?: number } } } }[];
      };
      for (const row of json.coins?.slice(0, 10) ?? []) {
        const item = row.item;
        if (!item) continue;
        coins.push({
          id: `cg-${item.id}`,
          symbol: item.symbol.toUpperCase(),
          name: item.name,
          venue: "cex",
          listedOnCex: true,
          volume24h: 50_000_000,
          change24h: item.data?.price_change_percentage_24h?.usd ?? 8,
          spreadPct: 0.2,
          ageHours: 24 * 30,
          source: "coingecko-trending"
        });
      }
    }
  } catch {
    /* bỏ qua */
  }

  try {
    const pairsRes = await fetch("https://api.dexscreener.com/latest/dex/search?q=pepe", {
      headers: { accept: "application/json" },
      cache: "no-store"
    });
    if (pairsRes.ok) {
      const json = (await pairsRes.json()) as { pairs?: DexPair[] };
      for (const p of (json.pairs ?? []).slice(0, 5)) {
        const symbol = p.baseToken?.symbol?.toUpperCase() || "PAIR";
        coins.push({
          id: `pair-${symbol}-${p.chainId}`,
          symbol,
          name: p.baseToken?.name || symbol,
          venue: "dex",
          listedOnCex: false,
          volume24h: p.volume?.h24 ?? 0,
          change24h: p.priceChange?.h24 ?? 0,
          spreadPct: 1.8,
          ageHours: ageHoursFrom(p.pairCreatedAt),
          source: "dexscreener-search"
        });
      }
    }
  } catch {
    /* bỏ qua */
  }

  if (coins.length === 0) return [];

  const merged = new Map<string, Omit<RadarCoin, "trendScore" | "rank">>();
  for (const c of coins) {
    const key = c.symbol;
    const prev = merged.get(key);
    if (!prev || c.volume24h > prev.volume24h) merged.set(key, c);
  }

  return rankRadar(
    [...merged.values()].map((c) => ({
      ...c,
      trendScore: computeTrendScore(c)
    }))
  );
}
