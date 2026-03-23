$ErrorActionPreference = 'Stop'

$workspace = Resolve-Path (Join-Path $PSScriptRoot '..')
$workspaceText = $workspace.Path

function Stop-WorkspaceNodeProcesses {
  $processes = Get-CimInstance Win32_Process |
    Where-Object {
      $_.Name -eq 'node.exe' -and
      $_.CommandLine -and
      ($_.CommandLine -like "*$workspaceText*" -or $_.CommandLine -like '*prisma*')
    }

  foreach ($process in $processes) {
    try {
      Stop-Process -Id $process.ProcessId -Force -ErrorAction Stop
      Write-Host "Stopped process $($process.ProcessId) to release Prisma engine lock."
    } catch {
      Write-Warning "Could not stop process $($process.ProcessId): $($_.Exception.Message)"
    }
  }
}

function Invoke-PrismaGenerate {
  $output = & pnpm.cmd --filter backend exec prisma generate 2>&1
  $exitCode = $LASTEXITCODE

  if ($output) {
    $output | ForEach-Object { Write-Host $_ }
  }

  if ($exitCode -ne 0) {
    throw "Prisma generate exited with code $exitCode."
  }
}

for ($attempt = 1; $attempt -le 3; $attempt++) {
  try {
    Invoke-PrismaGenerate
    Write-Host 'Prisma client generated successfully.'
    exit 0
  } catch {
    if ($attempt -eq 1) {
      Write-Warning 'Prisma generate failed. Attempting to release locked workspace Node/Prisma processes.'
      Stop-WorkspaceNodeProcesses
      Start-Sleep -Seconds 2
    } elseif ($attempt -eq 2) {
      Write-Warning 'Prisma generate still failing. Waiting before final retry.'
      Start-Sleep -Seconds 3
    } else {
      throw
    }
  }
}
