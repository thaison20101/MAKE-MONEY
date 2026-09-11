# setup-windows.ps1
# Chay SAU KHI da cd vao thu muc repo (co package.json).
# Vi du:
#   cd $HOME\Documents\MAKE-MONEY
#   powershell -ExecutionPolicy Bypass -File .\scripts\setup-windows.ps1

$ErrorActionPreference = "Stop"

if (-not (Test-Path ".\package.json") -or -not (Test-Path ".\.env.example")) {
  Write-Host "Ban dang o sai thu muc: $(Get-Location)"
  Write-Host "Hay:"
  Write-Host "  cd `$HOME\Documents\MAKE-MONEY"
  Write-Host "  git checkout cursor/crypto-passive-guide-f98f"
  Write-Host "Roi chay lai script nay. Khong chay trong C:\Windows\system32."
  exit 1
}

$node = Get-Command node -ErrorAction SilentlyContinue
$npm = Get-Command npm -ErrorAction SilentlyContinue
if (-not $node -or -not $npm) {
  Write-Host "Chua co Node.js / npm. Cai LTS tai https://nodejs.org roi DONG PowerShell, mo lai."
  exit 1
}

Write-Host "Node $($node.Source) — $(node -v) / npm $(npm -v)"

if (-not (Test-Path ".\.env")) {
  Copy-Item .env.example .env
  Write-Host "Da copy .env.example -> .env"
} else {
  Write-Host ".env da co, khong ghi de."
}

Write-Host "Dang npm install..."
npm install
Write-Host "Dang npm test..."
npm test
Write-Host "Xong. Chay app:"
Write-Host "  npm run dev"
Write-Host "Roi mo http://localhost:3000"
