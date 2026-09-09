# Lướt meme: radar, follow, chốt sớm

## Radar

Worker lấy tín hiệu công khai (DexScreener, CoinGecko trending, cặp CEX). Mỗi coin có `trendScore` (mới + volume + biến động + đã CEX − phạt spread / quá mới DEX).

- **Đã CEX + lọt top + qua lọc** → có thể auto-follow (paper/live).
- **Chỉ DEX / tuổi thấp / spread rộng** → cảnh báo, **không** mua giây đầu launch.

## Rule mặc định (chỉnh trên tab Meme)

- Chốt sớm **5%** (không chờ +50%).
- Scale-out: bán 50% lúc +5%, phần còn trailing ~3% từ đỉnh lệnh.
- Cắt lỗ **15%**.
- Trần thời gian cầm (mặc định 180 phút) — hết giờ thì bán, không gồng.
- Sau SL: **xoay** coin khác trong radar (không mua lại ngay coin vừa thua).
- Coin cũ: giảm **20%** so với đỉnh/giá bán → bắt đáy **một lần**.
- `autoFollowTopN` = 2; `maxOpenMemes` = 2.
- Pause nếu lỗ ngày ≥ 25% vốn gốc paper.

## Vì sao chốt 5% trong khi meme có thể +100%

Sóng mới xì nhanh. Mục tiêu tool là **bắt kịp + ra sớm**, gom nhiều vòng nhỏ, không ngồi chờ đỉnh. Phí/spread 1–2% mỗi chiều có thể ăn hết 5% — đó là lý do lọc volume/spread và paper trước.

## Không làm

Sniper block đầu, sandwich, pump group, all-in token mint 10 phút trên DEX.
