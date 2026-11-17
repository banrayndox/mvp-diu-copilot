# stop-all.ps1 - Stop all servers for ai-agent

$ports = @(5173, 6000, 8080, 8090, 8091, 8092, 8095, 8096, 8097)

Write-Host "Stopping services listening on application ports..." -ForegroundColor Cyan

foreach ($port in $ports) {
    $connections = Get-NetTCPConnection -LocalPort $port -ErrorAction SilentlyContinue
    if ($connections) {
        $pids = $connections | Select-Object -ExpandProperty OwningProcess -Unique
        foreach ($procId in $pids) {
            try {
                $proc = Get-Process -Id $procId -ErrorAction SilentlyContinue
                if ($proc -and $proc.ProcessName -ne "System" -and $proc.ProcessName -ne "Idle") {
                    Write-Host "Stopping $($proc.ProcessName) (PID: $procId) on port $port..." -ForegroundColor Yellow
                    Stop-Process -Id $procId -Force -ErrorAction SilentlyContinue
                }
            } catch {
                Write-Warning "Could not stop PID $procId`: $_"
            }
        }
    }
}

Write-Host "Stopping Redis container..." -ForegroundColor Cyan
Push-Location "$PSScriptRoot\backend"
docker compose stop
Pop-Location

Write-Host "`nAll servers stopped." -ForegroundColor Green
