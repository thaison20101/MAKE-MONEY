# Chạy trên Windows (PowerShell)

Hai lỗi bạn gặp:

1. Lệnh chạy trong `C:\Windows\system32` — đó **không** phải thư mục project. File `.env.example` nằm trong repo đã clone.
2. Máy **chưa có Node.js**, nên PowerShell không hiểu `npm`.

Làm đúng thứ tự dưới đây. **Không** cần mở PowerShell “Run as administrator”.

## Bước 1 — Cài Git

1. Tải [git-scm.com/download/win](https://git-scm.com/download/win) (64-bit).
2. Cài, để mặc định, tick **Git from the command line**.
3. **Đóng hết** cửa sổ PowerShell cũ, mở PowerShell mới.
4. Gõ:

```powershell
git --version
```

Phải hiện số phiên bản (ví dụ `git version 2.xx`).

## Bước 2 — Cài Node.js LTS (để có `npm`)

1. Vào [https://nodejs.org](https://nodejs.org) — nút **LTS** (không phải Current).
2. Cài file `.msi`. Để nguyên tick **Add to PATH**.
3. **Đóng hết** PowerShell / Terminal / Cursor cũ.
4. Mở **PowerShell mới** (không Run as admin).
5. Kiểm tra:

```powershell
node -v
npm -v
```

Cả hai phải hiện số (ví dụ `v22.x` và `10.x`). Nếu vẫn “not recognized”: đăng xuất Windows hoặc restart máy, rồi mở PowerShell mới.

## Bước 3 — Clone repo và vào đúng thư mục

Mở PowerShell **thường**. Tạo thư mục làm việc rồi clone (nhánh có app + hướng dẫn):

```powershell
cd $HOME\Documents
git clone https://github.com/thaison20101/MAKE-MONEY.git
cd MAKE-MONEY
git checkout cursor/crypto-passive-guide-f98f
```

Nhánh `ADMIN` gần như trống. Phải `checkout` nhánh trên (hoặc merge PR) thì mới có `.env.example`.

Kiểm tra đang đúng chỗ:

```powershell
Get-Location
dir .env.example, package.json
```

Phải thấy hai file đó. Prompt **không** được là `PS C:\Windows\system32>`.

## Bước 4 — Copy env, cài package, chạy app

Trong thư mục `MAKE-MONEY` (cùng chỗ có `package.json`):

```powershell
Copy-Item .env.example .env
npm install
npm test
npm run dev
```

Chờ dòng kiểu `Local: http://localhost:3000`. Mở Chrome: [http://localhost:3000](http://localhost:3000).

Giữ cửa sổ đó. **Không** đóng khi đang dùng app.

Cửa sổ PowerShell thứ hai (cũng `cd` vào `MAKE-MONEY`) để treo worker:

```powershell
cd $HOME\Documents\MAKE-MONEY
npm run worker
```

## Nếu vẫn lỗi

| Thông báo | Nguyên nhân | Làm gì |
|-----------|-------------|--------|
| `Cannot find path '...\system32\.env.example'` | Đang ở sai thư mục | `cd $HOME\Documents\MAKE-MONEY` rồi `dir .env.example` |
| `npm is not recognized` | Chưa cài Node, hoặc chưa mở lại PowerShell | Cài LTS, đóng PowerShell, mở lại, `node -v` |
| `env.example` không có sau `cd MAKE-MONEY` | Đang nhánh `ADMIN` | `git checkout cursor/crypto-passive-guide-f98f` |
| `execution of scripts is disabled` | Policy PowerShell | Dùng `Copy-Item` như trên, hoặc `Set-ExecutionPolicy -Scope CurrentUser RemoteSigned` |
| Cổng 3000 bị chiếm | App cũ còn chạy | Đóng cửa sổ `npm run dev` cũ, hoặc Task Manager → dừng Node |

Không dán seed / mật khẩu sàn vào PowerShell hay file `.env` ngoài API trade-only (xem [ranh-gioi-bot.md](./ranh-gioi-bot.md)).
