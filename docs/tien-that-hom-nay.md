# Hôm nay: tải app, tạo TK, bật tiền thật (số nhỏ)

Đây **không phải lời khuyên đầu tư**. Tiền thật có thể mất hết. Chỉ nạp số bạn chấp nhận mất. KYC / luật nơi bạn ở: tự chịu.

Live **không** bật bằng nút trên web. Chỉ khi file `.env` trên máy bạn có `TRADING_MODE=live` **và** `I_ACCEPT_LIVE_TRADING=yes` **và** API **chỉ trade** (tắt Withdraw).

**Không gửi** seed, mật khẩu, 2FA, API cho chat / agent.

## A. Tải app (chỉ link chính thức)

Gõ tay trên thanh địa chỉ, **không bấm quảng cáo Google**.

| App | Việc | Tải |
|-----|------|-----|
| Chrome hoặc Brave | Trình duyệt | [google.com/chrome](https://www.google.com/chrome/) / [brave.com](https://brave.com) |
| Rabby **hoặc** MetaMask | Ví (1 cái) | [rabby.io](https://rabby.io) / [metamask.io](https://metamask.io) |
| Telegram Desktop | Cảnh báo bot | [desktop.telegram.org](https://desktop.telegram.org) |
| Google Authenticator hoặc Aegis | 2FA sàn | CH Play / App Store **đúng tên hãng** |
| Bitwarden (khuyến nghị) | Lưu mật khẩu | [bitwarden.com](https://bitwarden.com) |
| Binance **hoặc** Bybit | Sàn (1 cái) | [binance.com](https://www.binance.com) / [bybit.com](https://www.bybit.com) — app **official** |

Không cài “ví airdrop”, crack, tool farm acc.

## B. Tạo ví (chưa nạp)

1. Cài **một** ví (Rabby hoặc MetaMask).
2. Tạo ví mới. **Viết 12/24 từ ra giấy**, hai bản, không chụp ảnh / không Cloud.
3. Không nhập seed vào website nào.
4. Copy **địa chỉ** `0x…` (public) — sau này dán tab **Ví** trên app.

## C. Tạo tài khoản sàn

1. Đăng ký **một** sàn (Binance hoặc Bybit) bằng email riêng.
2. KYC đúng giấy tờ của bạn (nếu luật nơi bạn ở không cho thì **đừng** lách).
3. Bật **2FA app** (không SMS nếu tránh được).
4. Bật mã anti-phishing + whitelist rút (khuyến nghị).

## D. Nạp số nhỏ (học phí)

Nạp **USDT** số nhỏ (ví dụ mức mất được: vài chục USD, không phải lương).  
Rút thử **một lần** về ví của bạn để chắc chắn rút được.

## E. API chỉ trade — bắt buộc

**Binance:** Hồ sơ → API Management → tạo → chỉ **Enable Spot & Margin Trading**. **Không** Enable Withdrawals. IP whitelist nếu máy cố định.

**Bybit:** API → Read + **Trade**, không Withdraw.

Copy Key + Secret vào `.env` **trên máy bạn**. Không gửi chat.

## F. Bật live trên máy (sau `git pull`)

PowerShell **trong** `MAKE-MONEY`:

```powershell
cd $HOME\Documents\MAKE-MONEY
git pull
git checkout cursor/crypto-passive-guide-f98f
npm install
notepad .env
```

Sửa `.env` (giữ `paper` cho đến khi đã nạp + API xong):

```
TRADING_MODE=live
I_ACCEPT_LIVE_TRADING=yes
CEX_ID=binance
CEX_API_KEY=dán_key
CEX_API_SECRET=dán_secret
LIVE_MAX_USDT=40
LIVE_MAX_ORDER_USDT=12
```

Lưu. Chạy **hai** cửa sổ:

```powershell
npm run dev
```

```powershell
cd $HOME\Documents\MAKE-MONEY
npm run worker
```

Tab **CEX** trên [http://localhost:3000](http://localhost:3000) phải hiện **Live thật: đã cấu hình**. Worker mới đặt lệnh; chỉ `npm run dev` thì chưa auto.

## Live bot làm gì / không làm

- Làm: mua/bán **spot CEX** cặp `xxx/USDT` đã có trên sàn, theo radar + chốt sớm / cắt lỗ, trần `LIVE_MAX_ORDER_USDT`.
- Không: rút tiền, DEX meme, token giả `TREND` trên paper, ký ví on-chain.

Tắt live: `.env` → `TRADING_MODE=paper`, lưu, restart worker.
