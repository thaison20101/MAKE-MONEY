# 05. Giao dịch và gas

## Ý chính

Mỗi lần bạn chuyển tiền hoặc bấm hợp đồng, mạng thu **gas**. Giao dịch **thất bại vẫn có thể mất gas**. Đơn vị nhỏ: **gwei**.

## Giải thích

Gas giống phí ship: hàng đông thì ship đắt. Ethereum lớp 1 lúc sốt có thể vài đến vài chục USD một lần approve. L2 (Base, Arbitrum) thường rẻ hơn nhiều.

Bạn chọn:

- **Max fee**: trần sẵn sàng trả
- Đợi lúc mạng vắng (xem [etherscan.io/gastracker](https://etherscan.io/gastracker))

Gửi nhầm địa chỉ / sai mạng: hầu như không hoàn.

## Thử ngay

Mở gas tracker. So sánh “Low / Average / High”. Chưa gửi gì cả.

## Sai lầm hay gặp

- Approve không giới hạn rồi quên; sau này contract độc hút token.
- Spam giao dịch lúc gas cao vì FOMO meme.
