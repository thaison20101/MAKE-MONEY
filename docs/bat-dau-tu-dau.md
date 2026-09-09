# Bắt đầu từ số 0

Làm lần lượt. Cùng checklist trên tab **Bắt đầu** của app.

## 1. Bảo mật máy

- Dùng Chrome, Brave hoặc Firefox. Bookmark site quan trọng (sàn, Etherscan). Gõ tay domain lần đầu, không bấm ads.
- Trình quản lý mật khẩu: [Bitwarden](https://bitwarden.com) (extension + app).
- 2FA: [Aegis](https://getaegis.app) (Android) hoặc Google Authenticator. **Không** dùng SMS nếu tránh được.
- Nên có email riêng cho sàn (không dùng email chính công ty).
- Không cài “ví airdrop”, crack, file `.exe` từ Discord. Không chạy script lạ “claim hộ”.

## 2. Tải gì trên desktop

Chỉ từ store / site chính thức:

| App | Việc | Link gợi ý |
|-----|------|------------|
| Rabby hoặc MetaMask | Ví EVM | [rabby.io](https://rabby.io) / [metamask.io](https://metamask.io) |
| Phantom | Ví Solana (sau này) | [phantom.app](https://phantom.app) |
| Telegram Desktop | Cảnh báo + kênh dự án | [desktop.telegram.org](https://desktop.telegram.org) |
| Node.js LTS | Chạy dashboard này | [nodejs.org](https://nodejs.org) — bản **LTS**, tick Add to PATH |
| Ledger Live (tuỳ chọn) | Ví lạnh số lớn | [ledger.com](https://www.ledger.com) |

Kiểm tra URL trước khi tải. Ads giả MetaMask rất nhiều.

## 3. Tạo tài khoản (một bộ — không farm)

1. **Một ví hot**: tạo trong Rabby/MetaMask. Ghi 12/24 từ ra **giấy**, không đưa tool này, không chụp cloud.
2. **Một sàn**: [Binance](https://www.binance.com) hoặc [Bybit](https://www.bybit.com). KYC theo luật nơi bạn ở — tự chịu trách nhiệm.
3. **Telegram**: đăng ký → [@BotFather](https://t.me/BotFather) → `/newbot` → copy token vào `.env` (`TELEGRAM_BOT_TOKEN`). Nhắn bot, lấy `chat_id` (có thể dùng `@userinfobot`).
4. Tuỳ chọn: Discord/X chỉ để follow announcement **đã verify**.

## 4. Cấu hình ví

Trong ví, thêm mạng: Ethereum, Arbitrum, Base, BNB Chain (danh sách chính thức của Rabby).

Mua/rút **một ít** ETH (hoặc ETH trên L2) làm gas. Tách:

- Ví A: chơi airdrop / gas nhỏ
- Ví B: tiết kiệm — **không** kết nối site lạ

Dán **địa chỉ ví A** (public) vào tab Ví trên app. Không dán seed.

## 5. Sàn và API

Xem [san-va-api.md](./san-va-api.md). Tóm tắt: 2FA, anti-phishing, API **Enable Trading**, **tắt Withdraw**, IP whitelist nếu có.

Nạp số nhỏ để thử. Paper trên tool không cần API.

## 6. Chạy project này

**Windows PowerShell:** xem [chay-tren-windows.md](./chay-tren-windows.md). Tóm tắt: cài Git + Node LTS → đóng PowerShell → clone repo → `cd` vào thư mục có file `package.json` (không phải `C:\Windows\system32`) →:

```powershell
cd $HOME\Documents\MAKE-MONEY
git checkout cursor/crypto-passive-guide-f98f
Copy-Item .env.example .env
npm install
npm test
npm run dev
```

macOS / Linux:

```bash
cd thư-mục-repo
cp .env.example .env
npm install
npm test
npm run dev
```

Mở `http://localhost:3000`. Để `TRADING_MODE=paper`.

Treo worker 24/7 (cửa sổ khác):

```bash
npm run worker
```

Hoặc [pm2](https://pm2.keymetrics.io): `pm2 start npm --name crypto-worker -- run worker`

## 7. Ngày 1

- Đọc xong bài Ethereum 01–05
- Tick checklist Bắt đầu
- Xem Radar meme (paper)
- Chọn **một** game, đọc playbook — chưa live trade

## 8. Ngày 2+

- Bật 2–3 module Máy 24/7
- Xem Sổ gom
- Chỉ bật `TRADING_MODE=live` khi hiểu circuit breaker và API không withdraw
