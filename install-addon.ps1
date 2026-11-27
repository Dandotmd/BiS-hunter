# Copies addon\ForeverTracker into the WoW Forever AddOns folder. Run again after any addon change.
#   .\install-addon.ps1
#   .\install-addon.ps1 -Wow "F:\World of Warcraft\_forever_"
#   .\install-addon.ps1 -Remove        # delete the installed copy (saved data is kept)
param(
    [string]$Wow = "F:\World of Warcraft\_forever_",
    [switch]$Remove
)
$ErrorActionPreference = "Stop"
$src = Join-Path $PSScriptRoot "addon\ForeverTracker"
$addons = Join-Path $Wow "Interface\AddOns"
$dst = Join-Path $addons "ForeverTracker"

if (-not (Test-Path $addons)) { throw "AddOns folder not found: $addons" }

if ($Remove) {
    if (Test-Path $dst) { Remove-Item -Recurse -Force $dst; Write-Host "Removed $dst" }
    else { Write-Host "Not installed: $dst" }
    return
}

New-Item -ItemType Directory -Force $dst | Out-Null
Copy-Item -Path (Join-Path $src "*") -Destination $dst -Recurse -Force
Write-Host "Installed ForeverTracker to $dst"
Get-ChildItem $dst | ForEach-Object { Write-Host ("  " + $_.Name + "  " + $_.Length + " bytes") }
Write-Host "In game: /reload (or restart WoW if it was running before the first install), then /ft."
