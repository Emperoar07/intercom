$ErrorActionPreference = "Stop"

$root = Join-Path $PSScriptRoot ".."
$root = [System.IO.Path]::GetFullPath($root)
$pearCmd = Join-Path $env:APPDATA "npm\pear.cmd"

if (-not (Test-Path $pearCmd)) {
  throw "pear.cmd not found at $pearCmd. Install pear first: npm install -g pear"
}

New-Item -ItemType Directory -Force -Path (Join-Path $root "proof") | Out-Null

foreach ($f in @("host-local.log","host-local.err","joiner-local.log","joiner-local.err")) {
  $p = Join-Path $root ("proof\" + $f)
  if (Test-Path $p) { Remove-Item $p -Force -ErrorAction SilentlyContinue }
}

# Stop old local demo processes (best effort)
$targets = Get-CimInstance Win32_Process | Where-Object {
  $_.Name -eq "pear-runtime.exe" -and (
    $_.CommandLine -like "*--peer-store-name local-host*" -or
    $_.CommandLine -like "*--peer-store-name local-joiner*"
  )
}
foreach ($t in $targets) {
  try { Stop-Process -Id $t.ProcessId -Force -ErrorAction Stop } catch {}
}

Start-Process -FilePath $pearCmd `
  -ArgumentList @(
    "run",".",
    "--peer-store-name","local-host",
    "--msb-store-name","local-host-msb",
    "--subnet-channel","focus-vibe-local",
    "--sidechannels","focus-room-alpha",
    "--sidechannel-welcome-required","0",
    "--sc-bridge","1",
    "--sc-bridge-token","localtoken123",
    "--sc-bridge-port","49222"
  ) `
  -WorkingDirectory $root `
  -RedirectStandardOutput (Join-Path $root "proof\host-local.log") `
  -RedirectStandardError (Join-Path $root "proof\host-local.err") `
  -WindowStyle Hidden

Start-Sleep -Seconds 6

$bootstrapPath = Join-Path $root "stores\local-host\subnet-bootstrap.hex"
if (-not (Test-Path $bootstrapPath)) {
  throw "Host bootstrap not found at $bootstrapPath"
}
$bootstrap = (Get-Content $bootstrapPath -Raw).Trim()

Start-Process -FilePath $pearCmd `
  -ArgumentList @(
    "run",".",
    "--peer-store-name","local-joiner",
    "--msb-store-name","local-joiner-msb",
    "--subnet-channel","focus-vibe-local",
    "--subnet-bootstrap",$bootstrap,
    "--sidechannels","focus-room-alpha",
    "--sidechannel-welcome-required","0",
    "--sc-bridge","1",
    "--sc-bridge-token","joinertoken123",
    "--sc-bridge-port","49223"
  ) `
  -WorkingDirectory $root `
  -RedirectStandardOutput (Join-Path $root "proof\joiner-local.log") `
  -RedirectStandardError (Join-Path $root "proof\joiner-local.err") `
  -WindowStyle Hidden

Start-Sleep -Seconds 8

Write-Host "Local hosting started."
Write-Host "Host SC-Bridge:    ws://127.0.0.1:49222  token=localtoken123"
Write-Host "Joiner SC-Bridge:  ws://127.0.0.1:49223  token=joinertoken123"
Write-Host "Logs:"
Write-Host "  proof/host-local.log"
Write-Host "  proof/joiner-local.log"
Write-Host ""
Write-Host "Important for sync:"
Write-Host "  On joiner, call focus_join first for a room before host focus_start."
