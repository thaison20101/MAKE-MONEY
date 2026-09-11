# 09. DEX và CEX

## Ý chính

**CEX** (Binance, Bybit, OKX): công ty giữ tiền giúp bạn, có KYC, API. **DEX** (Uniswap, Jupiter): bạn tự giữ chìa, đổi token trong pool.

## Giải thích

CEX giống sàn chứng khoán: nạp vào, họ ghi sổ nội bộ. Rủi ro: sàn phá sản, khóa rút, hack. Lợi: dễ, thanh khoản sâu, bot này **trade qua API** (không withdraw).

DEX: không cần KYC, nhưng bạn chịu gas, **slippage**, honeypot, link giả. Bot **không** tự ký DEX bằng seed.

**Slippage**: giá trượt khi lệnh lớn / pool mỏng. Meme hay trượt vài % — đủ ăn mất mục tiêu chốt 5%.

## Thử ngay

So một cặp BTC/USDT trên Binance với Uniswap (nếu có). Chênh lệch giá + phí là “chi phí thực” khi lướt.

## Sai lầm hay gặp

- Để hết tiền trên CEX không 2FA.
- Swap DEX với slippage 12% “cho chắc” — hay bị kẹp giá.
