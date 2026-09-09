import { emptyPaper } from "./meme-engine";
import { rankRadar } from "./radar";
import { DEFAULT_MEME_SETTINGS, type AppState, type RadarCoin } from "./types";

const now = Date.now();

const rawRadar: Omit<RadarCoin, "trendScore" | "rank">[] = [
  {
    id: "pepe",
    symbol: "PEPE",
    name: "Pepe",
    venue: "cex",
    listedOnCex: true,
    volume24h: 420_000_000,
    change24h: 18,
    spreadPct: 0.08,
    ageHours: 24 * 400,
    source: "binance+coingecko"
  },
  {
    id: "wif",
    symbol: "WIF",
    name: "dogwifhat",
    venue: "cex",
    listedOnCex: true,
    volume24h: 210_000_000,
    change24h: 11,
    spreadPct: 0.12,
    ageHours: 24 * 200,
    source: "binance"
  },
  {
    id: "bonk",
    symbol: "BONK",
    name: "Bonk",
    venue: "cex",
    listedOnCex: true,
    volume24h: 180_000_000,
    change24h: 7,
    spreadPct: 0.1,
    ageHours: 24 * 300,
    source: "binance"
  },
  {
    id: "newcex",
    symbol: "TREND",
    name: "TrendCat (ví dụ CEX mới nổi)",
    venue: "cex",
    listedOnCex: true,
    volume24h: 35_000_000,
    change24h: 42,
    spreadPct: 0.4,
    ageHours: 36,
    source: "bybit-new-listing"
  },
  {
    id: "dexonly",
    symbol: "RUGX",
    name: "DexOnly New (chỉ DEX)",
    venue: "dex",
    listedOnCex: false,
    volume24h: 8_000_000,
    change24h: 120,
    spreadPct: 3.2,
    ageHours: 8,
    source: "dexscreener"
  },
  {
    id: "widespread",
    symbol: "THIN",
    name: "ThinBook",
    venue: "cex",
    listedOnCex: true,
    volume24h: 90_000,
    change24h: 9,
    spreadPct: 4.5,
    ageHours: 48,
    source: "okx"
  }
];

export const ETHEREUM_LESSONS = [
  { id: "01", file: "01-blockchain.md", title: "Blockchain là gì" },
  { id: "02", file: "02-ethereum.md", title: "Ethereum là gì" },
  { id: "03", file: "03-eth-vs-token.md", title: "ETH và token" },
  { id: "04", file: "04-vi-seed.md", title: "Ví, địa chỉ, seed" },
  { id: "05", file: "05-gas.md", title: "Giao dịch và gas" },
  { id: "06", file: "06-smart-contract.md", title: "Smart contract" },
  { id: "07", file: "07-token-chuan.md", title: "ERC-20, NFT, Etherscan" },
  { id: "08", file: "08-l2.md", title: "L2 và mạng khác" },
  { id: "09", file: "09-dex-cex.md", title: "DEX và CEX" },
  { id: "10", file: "10-defi.md", title: "DeFi cơ bản" },
  { id: "11", file: "11-nft-game.md", title: "NFT và game" },
  { id: "12", file: "12-airdrop.md", title: "Airdrop và points" },
  { id: "13", file: "13-meme.md", title: "Meme coin" },
  { id: "14", file: "14-lua-dao.md", title: "Lừa đảo thường gặp" },
  { id: "15", file: "15-phap-ly.md", title: "Thuế và pháp lý" }
] as const;

export function createInitialState(cashUsd = 1000): AppState {
  return {
    tradingMode: "paper",
    walletAddress: "",
    telegramReady: false,
    onboarding: [
      { id: "security", title: "Bảo mật máy (trình duyệt, mật khẩu, 2FA)", done: false },
      { id: "apps", title: "Tải Rabby/MetaMask, Telegram, Node.js LTS (Windows: docs/chay-tren-windows.md)", done: false },
      { id: "accounts", title: "Tạo 1 ví + 1 sàn + bot Telegram", done: false },
      { id: "networks", title: "Thêm mạng + để gas + tách ví", done: false },
      { id: "api", title: "API sàn chỉ trade, tắt Withdraw", done: false },
      { id: "run-app", title: "Chạy app ở chế độ paper", done: false },
      { id: "day1", title: "Chọn 1 game + đọc playbook, chưa live", done: false },
      { id: "meme-paper", title: "Bật radar meme paper, hiểu TP sớm / SL", done: false }
    ],
    lessons: ETHEREUM_LESSONS.map((l) => ({ id: l.id, understood: false })),
    meme: { ...DEFAULT_MEME_SETTINGS },
    paper: emptyPaper(cashUsd, now),
    radar: rankRadar(rawRadar.map((c) => ({ ...c, trendScore: 0 }))),
    modules: [
      { id: "meme-wave", name: "Lướt meme (radar + chốt sớm)", enabled: true, kind: "paper", lastRunAt: null, lastNote: "" },
      { id: "cex-earn", name: "CEX Earn / lãi linh hoạt", enabled: true, kind: "paper", lastRunAt: null, lastNote: "" },
      { id: "airdrop-checkin", name: "Airdrop / points check-in", enabled: true, kind: "remind", lastRunAt: null, lastNote: "" },
      { id: "game-official", name: "Game API chính thức", enabled: false, kind: "auto", lastRunAt: null, lastNote: "" },
      { id: "claim-remind", name: "Nhắc claim (bạn tự ký)", enabled: true, kind: "remind", lastRunAt: null, lastNote: "" },
      { id: "defi-watch", name: "Theo dõi DeFi đã vào", enabled: true, kind: "remind", lastRunAt: null, lastNote: "" },
      { id: "research-rss", name: "Nghiên cứu RSS / YouTube", enabled: true, kind: "remind", lastRunAt: null, lastNote: "" }
    ],
    games: [
      {
        id: "layer3-sample",
        name: "Quest mùa mẫu (Layer3-style)",
        selected: false,
        hasOfficialApi: false,
        risk: "trung-binh",
        dailyCap: 1,
        actionsToday: 0,
        summary: "Làm quest on-chain/điểm danh trên site chính thức. Không có API — bot chỉ nhắc.",
        playbook: [
          "Mở đúng domain chính thức (kiểm tra bookmark).",
          "Kết nối 1 ví hot nhỏ, không ví tiết kiệm.",
          "Làm 1–2 quest/ngày, ghi lại.",
          "Không dùng tool click hộ.",
          "Dừng nếu yêu cầu approve token lạ hoặc phí vô lý."
        ]
      },
      {
        id: "official-stub",
        name: "Mini-game có API official (stub)",
        selected: false,
        hasOfficialApi: true,
        risk: "thap",
        dailyCap: 1,
        actionsToday: 0,
        summary: "Ví dụ adapter: 1 action/ngày qua API dự án công bố. Không giả người chơi.",
        playbook: [
          "Đọc docs API official của game.",
          "Lấy API key game (không phải seed).",
          "Bật module, để daily cap = 1.",
          "Xem Sổ gom phần thưởng ước lượng."
        ]
      },
      {
        id: "telegram-clicker",
        name: "Telegram clicker (không auto)",
        selected: false,
        hasOfficialApi: false,
        risk: "cao",
        dailyCap: 0,
        actionsToday: 0,
        summary: "Bot không auto-click. Nếu bạn chơi tay: 1 acc, không farm.",
        playbook: [
          "Chỉ vào bot/@game chính thức.",
          "Không mua tool 'tự tap'.",
          "Coi phần thưởng là xổ số, không phải lương."
        ]
      }
    ],
    airdrops: [
      {
        id: "sample-l2",
        name: "Mùa points L2 mẫu",
        status: "theo-doi",
        chain: "Base / Arbitrum",
        note: "Bridge + swap nhỏ trên 1 ví. Không sybil."
      },
      {
        id: "sample-claim",
        name: "Claim demo (đến hạn)",
        status: "den-han-claim",
        chain: "Ethereum",
        note: "Bot nhắc — bạn mở link chính thức và ký trên ví."
      }
    ],
    research: [
      {
        id: "r1",
        title: "DCA vs all-in — tóm tắt giáo dục",
        source: "Allowlist blog",
        summary: "Chia nhỏ lần mua giảm rủi ro timing. Không phải tín hiệu mua hôm nay.",
        strategy: "DCA",
        fomo: false,
        url: "https://ethereum.org",
        at: now
      },
      {
        id: "r2",
        title: "Video '100x meme hôm nay' (ví dụ FOMO)",
        source: "YouTube RSS (mẫu)",
        summary: "Kêu gọi vào lệnh gấp. Tool đánh dấu FOMO — không copy-trade.",
        strategy: "meme-fomo",
        fomo: true,
        url: "https://www.youtube.com",
        at: now - 3600_000
      }
    ],
    earnings: [],
    defiWatches: [
      { id: "aave", protocol: "Aave (ví dụ)", note: "Chỉ theo dõi nếu bạn đã nạp. Bot không tự deposit.", apy: 3.2 }
    ],
    prices: fixturePrices()
  };
}

export function fixturePrices(): Record<string, number> {
  return {
    PEPE: 0.00001,
    WIF: 1.8,
    BONK: 0.00002,
    TREND: 0.42,
    RUGX: 0.01,
    THIN: 0.05
  };
}
