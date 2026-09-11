# Sàn và API (Binance / Bybit / OKX)

## Trước khi nạp

1. Bật 2FA (app, không SMS nếu được).
2. Mã anti-phishing (hiện trong email sàn).
3. Whitelist địa chỉ rút (khuyến nghị).
4. Passkey / withdrawal PIN nếu sàn có.

## Tạo API trade-only

**Binance:** Hồ sơ → API Management → tạo key → chỉ **Enable Spot & Margin Trading**. Không Enable Withdrawals. Hạn chế IP nếu máy cố định.

**Bybit:** API → tạo → quyền **Read + Trade**, không Withdraw.

**OKX:** API → trading, không withdraw. Cần passphrase (`CEX_PASSWORD` trong `.env`).

Dán `CEX_API_KEY` / `CEX_API_SECRET` vào `.env` **local**, không commit, không gửi chat.

## Paper vs live

- `TRADING_MODE=paper`: không gọi lệnh thật.
- `live`: chỉ khi bạn chủ động đổi env. Tool vẫn không rút tiền nếu bạn không cấp quyền withdraw — **đừng cấp**.

## KYC

Làm đúng giấy tờ của bạn. Tool không hướng dẫn giả mạo hay lách lệnh cấm nơi bạn ở.
