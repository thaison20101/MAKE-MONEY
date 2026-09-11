import type { AppState, EarningEvent, PassiveModule } from "./types";

export function runEnabledModules(state: AppState, now: number): { state: AppState; notes: string[] } {
  const next: AppState = structuredClone(state);
  const notes: string[] = [];

  for (const mod of next.modules) {
    if (!mod.enabled) continue;
    const result = runModule(mod, next, now);
    mod.lastRunAt = now;
    mod.lastNote = result.note;
    notes.push(`${mod.name}: ${result.note}`);
    if (result.earning) next.earnings = [result.earning, ...next.earnings].slice(0, 500);
  }

  return { state: next, notes };
}

function runModule(
  mod: PassiveModule,
  state: AppState,
  now: number
): { note: string; earning?: EarningEvent } {
  switch (mod.id) {
    case "cex-earn":
      return {
        note: "Ước lãi flexible paper ~0.01%/ngày trên phần cash nhàn rỗi",
        earning: {
          id: `earn-${now}`,
          at: now,
          channel: "cex-earn",
          label: "Lãi CEX flexible (paper)",
          amount: state.paper.cashUsd * 0.0001,
          unit: "USD",
          usdEstimate: Math.round(state.paper.cashUsd * 0.0001 * 100) / 100
        }
      };
    case "airdrop-checkin": {
      const due = state.airdrops.filter((a) => a.status === "theo-doi" || a.status === "den-han-claim");
      return {
        note: due.length
          ? `Nhắc ${due.length} chiến dịch: ${due.map((a) => a.name).join(", ")}`
          : "Không có airdrop đến hạn",
        earning: {
          id: `pts-${now}`,
          at: now,
          channel: "airdrop",
          label: "Check-in points (ước lượng)",
          amount: due.length,
          unit: "points",
          usdEstimate: due.length * 0.2
        }
      };
    }
    case "game-official": {
      const games = state.games.filter((g) => g.selected && g.hasOfficialApi);
      let did = 0;
      for (const g of games) {
        if (g.actionsToday < g.dailyCap) {
          g.actionsToday += 1;
          did += 1;
        }
      }
      return {
        note: did ? `Chạy ${did} action official (daily cap)` : "Hết daily cap hoặc chưa chọn game API",
        earning: did
          ? {
              id: `game-${now}`,
              at: now,
              channel: "game",
              label: "Phần thưởng game official (ước lượng)",
              amount: did,
              unit: "reward",
              usdEstimate: did * 0.15
            }
          : undefined
      };
    }
    case "claim-remind": {
      const claims = state.airdrops.filter((a) => a.status === "den-han-claim");
      return { note: claims.length ? `Bạn tự ký claim: ${claims.map((a) => a.name).join(", ")}` : "Không có claim" };
    }
    case "defi-watch":
      return {
        note: state.defiWatches.map((d) => `${d.protocol} APY ${d.apy}%`).join(" · ") || "Chưa theo dõi protocol"
      };
    case "research-rss":
      return { note: `${state.research.length} tin trong feed — không tự đặt lệnh theo video` };
    case "meme-wave":
      return { note: "Engine meme chạy riêng mỗi tick giá/radar" };
    default:
      return { note: "Module không rõ" };
  }
}

export function resetDailyGameCaps(state: AppState): AppState {
  const next = structuredClone(state);
  for (const g of next.games) g.actionsToday = 0;
  return next;
}
