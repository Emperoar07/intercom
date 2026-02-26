$ErrorActionPreference = "Stop"

$targets = Get-CimInstance Win32_Process | Where-Object {
  $_.Name -eq "pear-runtime.exe" -and (
    $_.CommandLine -like "*--peer-store-name local-host*" -or
    $_.CommandLine -like "*--peer-store-name local-joiner*"
  )
}

if (-not $targets) {
  Write-Host "No local-host/local-joiner pear-runtime processes found."
  exit 0
}

foreach ($t in $targets) {
  try {
    Stop-Process -Id $t.ProcessId -Force -ErrorAction Stop
    Write-Host "Stopped PID $($t.ProcessId)"
  } catch {
    Write-Host "Failed to stop PID $($t.ProcessId): $($_.Exception.Message)"
  }
}
