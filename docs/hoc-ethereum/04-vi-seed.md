# 04. Ví, địa chỉ, seed, private key

## Ý chính

Ví không phải túi đựng file tiền. Ví là **chìa** để ký lệnh trên sổ cái. **Seed** (12/24 từ) = chìa master. Đưa seed cho ai = đưa hết tiền.

## Giải thích

- **Địa chỉ**: số tài khoản công khai, gửi được, giống số IBAN. Bắt đầu `0x…` trên Ethereum.
- **Private key**: chìa của một địa chỉ.
- **Seed / recovery phrase**: sinh ra nhiều private key. Mất seed + không sao lưu = mất. Hỗ trợ giả mạo hay “admin tool” xin seed = lừa đảo.

Hot wallet (extension trình duyệt) tiện, rủi ro malware cao hơn. Cold wallet (Ledger) an toàn hơn cho số lớn.

**Bot này không bao giờ được nhận seed.** Chỉ dán **địa chỉ** (public) để xem số dư.

## Thử ngay

Cài Rabby hoặc MetaMask từ store chính thức (xem [Bắt đầu từ số 0](../bat-dau-tu-dau.md)). Tạo ví, **viết seed ra giấy**, không chụp cloud.

## Sai lầm hay gặp

- Lưu seed trong Notes, Google Drive, ảnh điện thoại.
- Nhập seed vào website “claim airdrop” hoặc Discord “support”.
