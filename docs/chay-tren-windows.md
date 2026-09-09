# Chạy trên Windows (PowerShell)

Hai lỗi bạn gặp:

1. Lệnh chạy trong `C:\Windows\system32` — đó **không** phải thư mục project. File `.env.example` nằm trong repo đã clone.
2. Máy **chưa có Node.js**, nên PowerShell không hiểu `npm`.

Làm đúng thứ tự dưới đây. **Không** cần mở PowerShell “Run as administrator”.

## Bước 1 — Cài Git

Bạn có thể thấy trang **“Windows GUIs”** (GitHub Desktop, SourceTree, GitKraken, TortoiseGit). Đó là **app giao diện tùy chọn**, không phải bản cài Git bắt buộc.

Chọn **một** trong hai:

**A — Chỉ dòng lệnh (đủ cho project này)**

1. Tải installer Git, không phải GUI: [https://git-scm.com/download/win](https://git-scm.com/download/win)
2. Nếu site đẩy sang danh sách GUI: kéo lên / bấm **Downloads** → **Windows** → file **64-bit Git for Windows Setup**.
3. Cài, để mặc định, để nguyên **Git from the command line**.
4. Đóng hết PowerShell cũ, mở PowerShell mới, gõ `git --version`.

**B — Muốn GUI: GitHub Desktop (miễn phí)**

Repo đang ở GitHub nên GUI hợp nhất là **GitHub Desktop**. Không cần SourceTree / GitKraken / TortoiseGit để chạy tool này.

1. Tải [https://desktop.github.com](https://desktop.github.com)
2. File → Clone repository → URL `https://github.com/thaison20101/MAKE-MONEY.git` → clone vào `Documents`
3. Current branch: chọn `cursor/crypto-passive-guide-f98f` (nhánh `ADMIN` gần như trống)
4. Repository → **Open in Command Prompt** / PowerShell (để `cd` đúng thư mục repo)
5. Vẫn phải cài **Node.js LTS** (bước 2) rồi `npm install` trong thư mục đó

Sau khi có `git --version` (cách A hoặc B), sang bước 2.

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

### Nếu `npm -v` báo “running scripts is disabled” / `npm.ps1 cannot be loaded`

PowerShell đang chặn script. Trong **cùng** cửa sổ (không cần Admin), gõ:

```powershell
Set-ExecutionPolicy -Scope CurrentUser -ExecutionPolicy RemoteSigned
```

Gõ `Y` rồi Enter. Kiểm tra lại:

```powershell
npm -v
```

Cách khác, không đổi policy: gọi `npm.cmd` thay vì `npm`:

```powershell
npm.cmd -v
npm.cmd install
npm.cmd test
npm.cmd run dev
```

Hoặc mở **Command Prompt** (`cmd`) thay PowerShell — `npm` chạy bình thường ở đó.

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
| `npm.ps1 cannot be loaded` / scripts disabled | PowerShell chặn script | `Set-ExecutionPolicy -Scope CurrentUser -ExecutionPolicy RemoteSigned` rồi `Y`; hoặc dùng `npm.cmd` / mở **cmd** |
| Cổng 3000 bị chiếm | App cũ còn chạy | Đóng cửa sổ `npm run dev` cũ, hoặc Task Manager → dừng Node |

Không dán seed / mật khẩu sàn vào PowerShell hay file `.env` ngoài API trade-only (xem [ranh-gioi-bot.md](./ranh-gioi-bot.md)).
