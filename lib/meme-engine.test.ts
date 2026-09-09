import { describe, expect, it } from "vitest";
import { emptyPaper, tickMeme } from "./meme-engine";
import { followCandidates, isDexAlertOnly, rankRadar } from "./radar";
import { runEnabledModules } from "./modules";
import { createInitialState, fixturePrices } from "./seed";
import { DEFAULT_MEME_SETTINGS, type RadarCoin } from "./types";

const settings = { ...DEFAULT_MEME_SETTINGS, cooldownMinutes: 0, maxHoldMinutes: 180 };

function coin(partial: Partial<RadarCoin> & Pick<RadarCoin, "symbol">): RadarCoin {
  return {
    id: partial.symbol,
    name: partial.symbol,
    venue: "cex",
    listedOnCex: true,
    trendScore: 80,
    volume24h: 1_000_000,
    change24h: 20,
    spreadPct: 0.2,
    ageHours: 36,
    rank: 1,
    source: "test",
    ...partial
  };
}

describe("radar", () => {
  it("xếp hạng CEX mới nổi cao hơn DEX quá mới", () => {
    const ranked = rankRadar([
      coin({ symbol: "TREND", listedOnCex: true, ageHours: 36, change24h: 40, volume24h: 20_000_000, trendScore: 0 }),
      coin({
        symbol: "RUGX",
        venue: "dex",
        listedOnCex: false,
        ageHours: 8,
        change24h: 120,
        spreadPct: 3,
        volume24h: 5_000_000,
        trendScore: 0
      })
    ]);
    expect(ranked[0].symbol).toBe("TREND");
    expect(isDexAlertOnly(ranked.find((c) => c.symbol === "RUGX")!, settings)).toBe(true);
  });

  it("không follow coin chỉ DEX hoặc spread quá rộng", () => {
    const radar = rankRadar([
      coin({ symbol: "RUGX", venue: "dex", listedOnCex: false, rank: 1, trendScore: 99 }),
      coin({ symbol: "THIN", spreadPct: 4.5, volume24h: 90_000, listedOnCex: true })
    ]);
    expect(followCandidates(radar, settings)).toHaveLength(0);
  });

  it("follow top N đã CEX qua lọc", () => {
    const radar = [
      coin({ symbol: "AAA", rank: 1, trendScore: 90 }),
      coin({ symbol: "BBB", rank: 2, trendScore: 80 }),
      coin({ symbol: "CCC", rank: 3, trendScore: 70 })
    ];
    const followed = followCandidates(radar, { ...settings, autoFollowTopN: 2 });
    expect(followed.map((c) => c.symbol)).toEqual(["AAA", "BBB"]);
  });
});

describe("meme engine", () => {
  it("follow coin #1 có CEX rồi chốt sớm +5%", () => {
    const radar = [coin({ symbol: "TREND", rank: 1, trendScore: 99 })];
    const t0 = 1_700_000_000_000;
    const opened = tickMeme({
      account: emptyPaper(1000, t0),
      settings: { ...settings, scaleOut: false, autoFollowTopN: 1, maxOpenMemes: 1 },
      radar,
      prices: { TREND: 1 },
      now: t0
    });
    expect(opened.followed).toEqual(["TREND"]);
    expect(opened.account.positions[0].symbol).toBe("TREND");

    const tp = tickMeme({
      account: opened.account,
      settings: { ...settings, scaleOut: false },
      radar,
      prices: { TREND: 1.05 },
      now: t0 + 60_000
    });
    expect(tp.account.positions).toHaveLength(0);
    expect(tp.account.events[0].kind).toBe("sell_tp");
    expect(tp.account.cashUsd).toBeGreaterThan(opened.account.cashUsd);
  });

  it("cắt lỗ rồi xoay sang coin khác", () => {
    const radar = [
      coin({ symbol: "AAA", rank: 1, trendScore: 90 }),
      coin({ symbol: "BBB", rank: 2, trendScore: 80 })
    ];
    const t0 = 1_700_000_000_000;
    const opened = tickMeme({
      account: emptyPaper(1000, t0),
      settings: { ...settings, autoFollowTopN: 1, maxOpenMemes: 1, scaleOut: false },
      radar,
      prices: { AAA: 10, BBB: 5 },
      now: t0
    });
    expect(opened.followed).toEqual(["AAA"]);

    const sl = tickMeme({
      account: opened.account,
      settings: { ...settings, autoFollowTopN: 2, maxOpenMemes: 1, scaleOut: false, cooldownMinutes: 0 },
      radar,
      prices: { AAA: 8.4, BBB: 5 },
      now: t0 + 1000
    });
    expect(sl.account.events.some((e) => e.kind === "sell_sl")).toBe(true);
    expect(sl.account.positions.some((p) => p.symbol === "BBB" && p.source === "rotate")).toBe(true);
    expect(sl.account.positions.some((p) => p.symbol === "AAA")).toBe(false);
  });

  it("bắt đáy coin cũ một lần khi giảm đủ %", () => {
    const radar = [coin({ symbol: "OLD", rank: 1 })];
    const t0 = 1_700_000_000_000;
    const account = emptyPaper(1000, t0);
    account.oldWatchlist = [{ symbol: "OLD", lastSellPrice: 10, peak: 12, dipUsed: false }];
    account.positions = [];

    const dip = tickMeme({
      account,
      settings: { ...settings, autoFollowTopN: 0, maxOpenMemes: 1 },
      radar,
      prices: { OLD: 8 },
      now: t0
    });
    expect(dip.account.positions[0]?.source).toBe("dip");
    expect(dip.account.oldWatchlist[0].dipUsed).toBe(true);

    const again = tickMeme({
      account: { ...dip.account, positions: [], cashUsd: 1000 },
      settings: { ...settings, autoFollowTopN: 0 },
      radar,
      prices: { OLD: 6 },
      now: t0 + 60_000
    });
    expect(again.account.positions.filter((p) => p.source === "dip")).toHaveLength(0);
  });

  it("bỏ qua spread quá rộng — không mua", () => {
    const radar = [coin({ symbol: "THIN", spreadPct: 4.5, volume24h: 50_000, rank: 1, trendScore: 99 })];
    const result = tickMeme({
      account: emptyPaper(1000),
      settings,
      radar,
      prices: { THIN: 1 },
      now: Date.now()
    });
    expect(result.followed).toHaveLength(0);
    expect(result.account.events.some((e) => e.kind === "skip")).toBe(true);
  });

  it("coin DEX-only chỉ alert, không follow", () => {
    const radar = rankRadar([
      coin({ symbol: "RUGX", venue: "dex", listedOnCex: false, rank: 1, trendScore: 99, ageHours: 8 })
    ]);
    const result = tickMeme({
      account: emptyPaper(1000),
      settings,
      radar,
      prices: { RUGX: 1 },
      now: Date.now()
    });
    expect(result.followed).toHaveLength(0);
    expect(result.alerts.some((a) => a.includes("DEX"))).toBe(true);
  });

  it("scale-out 50% lúc chạm TP", () => {
    const radar = [coin({ symbol: "TREND", rank: 1 })];
    const t0 = 1_700_000_000_000;
    const opened = tickMeme({
      account: emptyPaper(1000, t0),
      settings: { ...settings, scaleOut: true, autoFollowTopN: 1, maxOpenMemes: 1 },
      radar,
      prices: { TREND: 1 },
      now: t0
    });
    const half = opened.account.positions[0].remainingQty;
    const scaled = tickMeme({
      account: opened.account,
      settings: { ...settings, scaleOut: true },
      radar,
      prices: { TREND: 1.05 },
      now: t0 + 1000
    });
    expect(scaled.account.events[0].kind).toBe("sell_scale");
    expect(scaled.account.positions[0].remainingQty).toBeCloseTo(half / 2, 8);
  });
});

describe("modules", () => {
  it("chạy nhiều module song song và ghi sổ gom", () => {
    const state = createInitialState();
    state.games[1].selected = true;
    const { state: next } = runEnabledModules(state, Date.now());
    expect(next.earnings.length).toBeGreaterThan(0);
    expect(next.modules.find((m) => m.id === "cex-earn")?.lastNote).toContain("lãi");
    expect(fixturePrices().TREND).toBeGreaterThan(0);
  });
});
