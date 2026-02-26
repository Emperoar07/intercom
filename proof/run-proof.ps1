$ErrorActionPreference = "Stop"
Set-Location (Join-Path $PSScriptRoot "..")
node .\proof\generate-focus-proof.mjs
