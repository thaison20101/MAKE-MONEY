# Máy 24/7 — kiếm thụ động (gom dần)

## Kỳ vọng thật

Không có máy “in tiền”. Kênh thụ động thường **nhỏ và không đều**: lãi CEX, points, quest official, PnL paper/live meme. Sổ gom để bạn thấy từng đồng ước lượng — không phải bảo chứng lãi.

## Nhân bản đúng nghĩa

- **Có:** nhiều **tác vụ** song song (meme + jobs earn + nhắc airdrop + 1–n game API) trên **một** ví + **một** sàn.
- **Không:** clone 10 ví / 10 acc Telegram để farm. Dễ ban, sybil, tool từ chối.

Treo: `npm run worker` để chạy vòng lặp (radar, module, paper meme). Dashboard `npm run dev` để xem.

## Kênh nào auto / nào chỉ nhắc

| Kênh | Hành vi |
|------|---------|
| Meme radar + lướt | Paper/live CEX theo rule TP/SL |
| CEX Earn | Paper ước lãi; live nếu API sàn cho earn |
| Airdrop check-in | Nhắc + cộng points ước lượng |
| Game official | 1 action/ngày nếu bạn chọn game có API |
| Game không API | Checklist, bạn tự chơi |
| Claim on-chain | Nhắc, bạn ký ví |
| DeFi watch | Cảnh báo APY |
| Research RSS | Tóm tắt, không copy-trade |

## Dự án mới

Worker có thể kéo trending. **Không** tự join mint/game lạ. Bạn bật module / chọn game / follow meme khi đã CEX.
