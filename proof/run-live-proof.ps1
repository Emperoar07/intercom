$ErrorActionPreference = "Stop"
Set-Location (Join-Path $PSScriptRoot "..")
node .\proof\run-live-proof.mjs
