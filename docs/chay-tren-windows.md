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

## Tắt máy (hôm nay) và mở lại (ngày mai)

App **không** chạy khi tắt máy hoặc đóng PowerShell. Tick “Đã hiểu”, checklist, sổ paper nằm trong file `data\app-state.json` trên máy bạn — **không mất** khi tắt.

**Tắt hôm nay**

1. Cửa sổ đang `npm run dev`: bấm vào đó, nhấn `Ctrl + C`. Hỏi `Terminate batch job?` thì gõ `Y` rồi Enter. Hoặc **đóng hẳn** cửa sổ PowerShell đó.
2. Nếu có cửa sổ `npm run worker`: cũng `Ctrl + C` hoặc đóng cửa sổ.
3. Tắt máy / ngủ máy bình thường.

**Ngày mai xem lại** — không clone lại, không `npm install` lại (trừ khi cập nhật code):

```powershell
cd $HOME\Documents\MAKE-MONEY
npm run dev
```

Mở [http://localhost:3000](http://localhost:3000). Worker (tuỳ chọn):

```powershell
cd $HOME\Documents\MAKE-MONEY
npm run worker
```

Nếu `npm` lại báo scripts disabled: `npm.cmd run dev` hoặc chạy lại `Set-ExecutionPolicy` như bước 2.

Nếu báo cổng 3000 đang dùng: còn cửa sổ `dev` cũ — đóng nó, hoặc Task Manager → `Node.js JavaScript Runtime` → End task.

## Truy cập từ máy / điện thoại khác

`http://localhost:3000` **chỉ** mở được trên **máy đang chạy** `npm run dev`. Máy khác gõ localhost thì là máy của họ, không phải máy bạn.

App đã lắng nghe mọi card mạng (`0.0.0.0`). Chỉ nên mở **cùng Wi‑Fi / LAN**. Đừng port-forward router ra internet (file `.env` có thể chứa API).

**Trên máy đang chạy app (Windows):**

1. Để nguyên cửa sổ `npm run dev` (phải đang Ready).
2. Lấy IP LAN:

```powershell
ipconfig
```

Tìm **Wireless LAN adapter Wi-Fi** (hoặc Ethernet) → dòng **IPv4 Address**, dạng `192.168.x.x` hoặc `10.x.x.x`. Không dùng `127.0.0.1`.

3. Mở cổng 3000 trên tường lửa (PowerShell **Run as administrator**, một lần):

```powershell
netsh advfirewall firewall add rule name="MAKE-MONEY 3000" dir=in action=allow protocol=TCP localport=3000
```

**Trên máy / điện thoại kia** (cùng Wi‑Fi, tắt VPN nếu VPN tách mạng):

```
http://192.168.x.x:3000
```

Thay `192.168.x.x` bằng IPv4 vừa copy. Phải có `http://` và `:3000`.

Nếu không vào được: hai máy khác Wi‑Fi (guest/5GHz vs 2.4), firewall chặn, hoặc `npm run dev` đã tắt. Điện thoại dùng dữ liệu di động thì **không** thấy LAN nhà.

Ở mạng khác (nhà bạn bè, 4G): cần VPN LAN kiểu Tailscale sau này — không hướng dẫn mở port WAN.

## Nếu vẫn lỗi

| Thông báo | Nguyên nhân | Làm gì |
|-----------|-------------|--------|
| `Cannot find path '...\system32\.env.example'` | Đang ở sai thư mục | `cd $HOME\Documents\MAKE-MONEY` rồi `dir .env.example` |
| `npm is not recognized` | Chưa cài Node, hoặc chưa mở lại PowerShell | Cài LTS, đóng PowerShell, mở lại, `node -v` |
| `env.example` không có sau `cd MAKE-MONEY` | Đang nhánh `ADMIN` | `git checkout cursor/crypto-passive-guide-f98f` |
| `npm.ps1 cannot be loaded` / scripts disabled | PowerShell chặn script | `Set-ExecutionPolicy -Scope CurrentUser -ExecutionPolicy RemoteSigned` rồi `Y`; hoặc dùng `npm.cmd` / mở **cmd** |
| Cổng 3000 bị chiếm | App cũ còn chạy | Đóng cửa sổ `npm run dev` cũ, hoặc Task Manager → dừng Node |
| Máy khác gõ localhost không ra | localhost = chính máy đó | Dùng `http://IPv4-máy-chạy-app:3000`, cùng Wi‑Fi, mở firewall cổng 3000 |

Không dán seed / mật khẩu sàn vào PowerShell hay file `.env` ngoài API trade-only (xem [ranh-gioi-bot.md](./ranh-gioi-bot.md)).
