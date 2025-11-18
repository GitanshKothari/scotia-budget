# Fix Chocolatey Lock Issue
# Run this script as Administrator

Write-Host "Cleaning up Chocolatey lock files..." -ForegroundColor Yellow

# Remove lock files
Remove-Item "C:\ProgramData\chocolatey\lib\b15f6a0b4887f5441348471dad20e30534334204" -Force -ErrorAction SilentlyContinue
Remove-Item "C:\ProgramData\chocolatey\lib-bad" -Recurse -Force -ErrorAction SilentlyContinue

Write-Host "Lock files cleaned. You can now try installing Java again:" -ForegroundColor Green
Write-Host "choco install temurin17 -y" -ForegroundColor Cyan

