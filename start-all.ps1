# start-all.ps1 - Start all servers for ai-agent

Write-Host "Starting Redis container..." -ForegroundColor Cyan
Push-Location "$PSScriptRoot\backend"
docker compose up -d
Pop-Location

$services = @(
    @{ Name = "Auth Service"; Path = "backend\services\auth"; Command = "npm run dev" },
    @{ Name = "Chat Service"; Path = "backend\services\chat"; Command = "npm run dev" },
    @{ Name = "Agent Service"; Path = "backend\services\agent"; Command = "npm run dev" },
    @{ Name = "QBank Service"; Path = "backend\services\qBank"; Command = "npm run dev" },
    @{ Name = "Mentor Service"; Path = "backend\services\mentor"; Command = "npm run dev" },
    @{ Name = "Lost & Found Service"; Path = "backend\services\lostFound"; Command = "npm run dev" },
    @{ Name = "Student Portal"; Path = "backend\services\studentPortal"; Command = "npm run dev" },
    @{ Name = "API Gateway"; Path = "backend\gateway"; Command = "npm run dev" },
    @{ Name = "Frontend"; Path = "frontend"; Command = "npm run dev" }
)

foreach ($svc in $services) {
    Write-Host "Starting $($svc.Name)..." -ForegroundColor Yellow
    $svcPath = Join-Path $PSScriptRoot $svc.Path
    Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd '$svcPath'; $($svc.Command)"
}

Write-Host "`nAll servers have been launched in separate terminal windows." -ForegroundColor Green
