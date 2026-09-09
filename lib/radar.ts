import type { MemeSettings, RadarCoin } from "./types";

export function computeTrendScore(coin: Omit<RadarCoin, "trendScore" | "rank">): number {
  const recency = coin.ageHours <= 72 ? 25 : coin.ageHours <= 24 * 14 ? 12 : 0;
  const vol = Math.min(30, Math.log10(Math.max(coin.volume24h, 1)) * 4);
  const pump = Math.min(25, Math.max(0, coin.change24h) * 0.4);
  const cexBonus = coin.listedOnCex ? 15 : 0;
  const spreadPenalty = coin.spreadPct > 2 ? -15 : coin.spreadPct > 1 ? -6 : 0;
  const tooNewPenalty = coin.ageHours < 12 && !coin.listedOnCex ? -20 : 0;
  return Math.round(recency + vol + pump + cexBonus + spreadPenalty + tooNewPenalty);
}

export function rankRadar(coins: Omit<RadarCoin, "rank">[]): RadarCoin[] {
  return [...coins]
    .map((c) => ({ ...c, trendScore: c.trendScore || computeTrendScore(c) }))
    .sort((a, b) => b.trendScore - a.trendScore)
    .map((c, i) => ({ ...c, rank: i + 1 }));
}

export function isDexAlertOnly(coin: RadarCoin, settings: MemeSettings): boolean {
  if (!coin.listedOnCex) return true;
  if (coin.ageHours < settings.minAgeHours && coin.venue === "dex") return true;
  return false;
}

export function passesTradeFilters(coin: RadarCoin, settings: MemeSettings): boolean {
  if (isDexAlertOnly(coin, settings)) return false;
  if (coin.volume24h < settings.minQuoteVolume24h) return false;
  if (coin.spreadPct > settings.maxSpreadPct) return false;
  return true;
}

export function followCandidates(coins: RadarCoin[], settings: MemeSettings): RadarCoin[] {
  return rankRadar(coins)
    .filter((c) => passesTradeFilters(c, settings))
    .filter((c) => c.rank <= settings.autoFollowTopN);
}

export function shouldAlertNewTrend(coin: RadarCoin, settings: MemeSettings): boolean {
  return coin.rank <= 5 || (!coin.listedOnCex && coin.trendScore >= 40 && coin.ageHours >= settings.minAgeHours);
}
