param([string]$Executable = "$PSScriptRoot\..\src-tauri\target\release\ordi-academie.exe")
$ErrorActionPreference = 'Stop'
$taskRoot = [IO.Path]::GetFullPath((Join-Path $PSScriptRoot '..'))
$reportPath = Join-Path $taskRoot '.qa\windows-smoke.json'
$qaRoot = Split-Path $reportPath
New-Item -ItemType Directory -Path $qaRoot -Force | Out-Null
if (Test-Path -LiteralPath $reportPath) { Remove-Item -LiteralPath $reportPath }
$process = Start-Process -FilePath $Executable -ArgumentList @('--smoke-test', ('"' + $reportPath + '"')) -WindowStyle Hidden -PassThru
if (-not $process.WaitForExit(45000)) { Stop-Process -Id $process.Id; throw 'Le test Windows a dépassé son délai.' }
if (-not (Test-Path -LiteralPath $reportPath)) { throw "Rapport de test absent (code $($process.ExitCode))." }
$report = Get-Content -LiteralPath $reportPath -Raw | ConvertFrom-Json
if (-not $report.ok) { throw $report.error }
$report | ConvertTo-Json -Depth 6
