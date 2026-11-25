# Make the tracker available anywhere on this PC (Windows PowerShell 5.1).
#   .\install-shortcuts.ps1             Start Menu "WoW Forever Tracker" + "Stop WoW Forever Tracker", and a Desktop shortcut
#   .\install-shortcuts.ps1 -AutoStart  also start the hidden server when you sign in (Startup folder)
#   .\install-shortcuts.ps1 -Remove     delete every shortcut this script makes
# The shortcuts run launch.pyw with pythonw, so no console window opens. Re-run after moving this folder.
param([switch]$AutoStart, [switch]$Remove)
$ErrorActionPreference = 'Stop'
$root = Split-Path -Parent $MyInvocation.MyCommand.Path
$launcher = Join-Path $root 'launch.pyw'
$icon = Join-Path $root 'tracker.ico'
$programs = [Environment]::GetFolderPath('Programs')
$desktop = [Environment]::GetFolderPath('Desktop')
$startup = [Environment]::GetFolderPath('Startup')
$links = @(
  @{ Path = Join-Path $programs 'WoW Forever Tracker.lnk';      Args = '';         Desc = 'Open the WoW Forever leveling tracker' },
  @{ Path = Join-Path $programs 'Stop WoW Forever Tracker.lnk'; Args = ' --stop';  Desc = 'Stop the tracker server' },
  @{ Path = Join-Path $desktop  'WoW Forever Tracker.lnk';      Args = '';         Desc = 'Open the WoW Forever leveling tracker' }
)
$auto = @{ Path = Join-Path $startup 'WoW Forever Tracker server.lnk'; Args = ' --server'; Desc = 'Start the tracker server at sign-in' }

if ($Remove) {
  foreach ($l in $links + $auto) { if (Test-Path $l.Path) { Remove-Item $l.Path; "Removed $($l.Path)" } }
  return
}

$pythonw = (Get-Command pythonw -ErrorAction SilentlyContinue).Source
if (-not $pythonw) { throw 'pythonw was not found on PATH. Install Python 3, then run this again.' }
if ($AutoStart) { $links += $auto }

$shell = New-Object -ComObject WScript.Shell
foreach ($l in $links) {
  $s = $shell.CreateShortcut($l.Path)
  $s.TargetPath = $pythonw
  $s.Arguments = '"' + $launcher + '"' + $l.Args
  $s.WorkingDirectory = $root
  $s.Description = $l.Desc
  if (Test-Path $icon) { $s.IconLocation = "$icon,0" }
  $s.Save()
  "Created $($l.Path)"
}
