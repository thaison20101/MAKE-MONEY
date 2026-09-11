# 06. Smart contract

## Ý chính

Smart contract là **chương trình trên blockchain**, tự chạy đúng code đã đăng. Không có nhân viên để “hủy giúp” nếu bạn ký nhầm.

## Giải thích

Ví dụ máy bán hàng: bỏ đúng xu, ra đúng lon. Sai nút thì xu không trở lại theo cách bạn muốn.

**Approve** = cho phép hợp đồng rút token của bạn tới một hạn mức. Approve “unlimited” cho site lạ là cửa để **drain** (hút sạch).

Hợp đồng có thể có cửa sau (admin), bug, hoặc giả mạo (code khác với website).

## Thử ngay

Khi MetaMask/Rabby hiện popup, đọc: bạn đang *gửi ETH* hay *approve token*? Nếu không hiểu thì **Reject**.

## Sai lầm hay gặp

- Ký “signature” lạ (Permit / Permit2 / Seaport) vì tưởng chỉ “đăng nhập”.
- Tin “contract đã verified” = an toàn. Verified chỉ nghĩa code đọc được, không nghĩa lương thiện.
