# Máy 24/7 + học Ethereum

Dashboard tiếng Việt: **học Ethereum từ gốc**, **hướng dẫn cài app / tạo tài khoản**, máy **treo 24/7** (airdrop, game official, CEX paper, **radar meme + chốt sớm**).

Đây **không phải lời khuyên đầu tư**. Không gửi seed, mật khẩu, 2FA, hay API có quyền rút tiền.

## Chạy nhanh

**Windows:** đừng gõ lệnh khi prompt là `PS C:\Windows\system32>`. Làm theo [docs/chay-tren-windows.md](docs/chay-tren-windows.md) (cài Git + Node LTS, clone repo, `cd` vào thư mục có `package.json`).

```powershell
cd $HOME\Documents\MAKE-MONEY
git checkout cursor/crypto-passive-guide-f98f
Copy-Item .env.example .env
npm install
npm test
npm run dev
```

macOS / Linux (đã ở **trong** thư mục repo):

```bash
cp .env.example .env
npm install
npm test
npm run dev
```

Mở [http://localhost:3000](http://localhost:3000).

Treo worker (cửa sổ khác):

```bash
npm run worker
```

## Đọc gì trước

Mục lục: [docs/README.md](docs/README.md)

1. Tab **Học Ethereum** (15 bài)
2. [docs/bat-dau-tu-dau.md](docs/bat-dau-tu-dau.md) — Rabby/MetaMask, sàn, Telegram, Node.js
3. Tab **Bắt đầu** — tick checklist
4. Tab **Meme / Radar** — paper follow + chốt ~5%
5. [docs/ranh-gioi-bot.md](docs/ranh-gioi-bot.md)

## Bot làm / không làm

- Làm: nhiều module song song trên **một** ví + một sàn; radar xu hướng; paper/live CEX theo rule; game **API official** + daily cap; nhắc claim.
- Không: farm nhiều acc, auto-click né ban, sniper DEX launch, copy-trade YouTube, giữ private key.

## Live CEX

`TRADING_MODE=paper` mặc định. Đổi `live` chỉ khi đã tạo API **trade-only** (xem [docs/san-va-api.md](docs/san-va-api.md)). Engine lệnh trong repo hiện mô phỏng paper trên dữ liệu local; gắn lệnh sàn thật khi bạn đã hiểu rủi ro và có key.
