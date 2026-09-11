export type PriceMap = Record<string, number>;
export type TradingMode = "paper" | "live";

export type Venue = "cex" | "dex";

export type MemeSettings = {
  takeProfitPct: number;
  stopLossPct: number;
  memeSleevePct: number;
  maxOpenMemes: number;
  dipBuyPct: number;
  cooldownMinutes: number;
  minQuoteVolume24h: number;
  maxSpreadPct: number;
  autoFollowTopN: number;
  maxHoldMinutes: number;
  scaleOut: boolean;
  minAgeHours: number;
  dailyLossPausePct: number;
};

export type RadarCoin = {
  id: string;
  symbol: string;
  name: string;
  venue: Venue;
  listedOnCex: boolean;
  trendScore: number;
  volume24h: number;
  change24h: number;
  spreadPct: number;
  ageHours: number;
  rank: number;
  source: string;
};

export type Position = {
  id: string;
  symbol: string;
  entryPrice: number;
  qty: number;
  remainingQty: number;
  openedAt: number;
  peakPrice: number;
  scaledOut: boolean;
  source: "follow" | "rotate" | "dip";
};

export type OldCoin = {
  symbol: string;
  lastSellPrice: number;
  peak: number;
  dipUsed: boolean;
};

export type TradeEvent = {
  at: number;
  kind: "buy" | "sell_tp" | "sell_sl" | "sell_time" | "sell_scale" | "skip" | "alert" | "pause";
  symbol: string;
  price?: number;
  qty?: number;
  pnlUsd?: number;
  note: string;
};

export type EarningEvent = {
  id: string;
  at: number;
  channel: string;
  label: string;
  amount: number;
  unit: string;
  usdEstimate: number;
};

export type PaperAccount = {
  cashUsd: number;
  startCashUsd: number;
  positions: Position[];
  oldWatchlist: OldCoin[];
  lastStopAt: number;
  dailyPnl: number;
  dayKey: string;
  paused: boolean;
  events: TradeEvent[];
};

export type OnboardingStep = {
  id: string;
  title: string;
  done: boolean;
};

export type LessonProgress = {
  id: string;
  understood: boolean;
};

export type PassiveModule = {
  id: string;
  name: string;
  enabled: boolean;
  kind: "auto" | "remind" | "paper";
  lastRunAt: number | null;
  lastNote: string;
};

export type GameCampaign = {
  id: string;
  name: string;
  selected: boolean;
  hasOfficialApi: boolean;
  risk: "thap" | "trung-binh" | "cao";
  dailyCap: number;
  actionsToday: number;
  playbook: string[];
  summary: string;
};

export type AirdropCampaign = {
  id: string;
  name: string;
  status: "theo-doi" | "den-han-claim" | "da-claim" | "het-mua";
  chain: string;
  note: string;
};

export type ResearchItem = {
  id: string;
  title: string;
  source: string;
  summary: string;
  strategy: string;
  fomo: boolean;
  url: string;
  at: number;
};

export type AppState = {
  tradingMode: TradingMode;
  walletAddress: string;
  telegramReady: boolean;
  onboarding: OnboardingStep[];
  lessons: LessonProgress[];
  meme: MemeSettings;
  paper: PaperAccount;
  radar: RadarCoin[];
  modules: PassiveModule[];
  games: GameCampaign[];
  airdrops: AirdropCampaign[];
  research: ResearchItem[];
  earnings: EarningEvent[];
  defiWatches: { id: string; protocol: string; note: string; apy: number }[];
  prices: Record<string, number>;
};

export const DEFAULT_MEME_SETTINGS: MemeSettings = {
  takeProfitPct: 5,
  stopLossPct: 15,
  memeSleevePct: 20,
  maxOpenMemes: 2,
  dipBuyPct: 20,
  cooldownMinutes: 30,
  minQuoteVolume24h: 200_000,
  maxSpreadPct: 1.5,
  autoFollowTopN: 2,
  maxHoldMinutes: 180,
  scaleOut: true,
  minAgeHours: 12,
  dailyLossPausePct: 25
};
