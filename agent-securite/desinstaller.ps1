# Désinstalleur de Sentinelle. Lancé depuis le menu Démarrer > Sentinelle > Désinstaller Sentinelle.
$ErrorActionPreference = 'Stop'
$Dest = Join-Path $env:ProgramFiles 'Sentinelle'
$Donnees = Join-Path $env:ProgramData 'Sentinelle'
$NomTache = 'Sentinelle - Surveillance'

function Question($texte, $defautOui = $true) {
    $suffixe = if ($defautOui) { '[O/n]' } else { '[o/N]' }
    $r = Read-Host "$texte $suffixe"
    if ([string]::IsNullOrWhiteSpace($r)) { return $defautOui }
    return $r.Trim().ToLower().StartsWith('o')
}

$identite = [Security.Principal.WindowsPrincipal][Security.Principal.WindowsIdentity]::GetCurrent()
if (-not $identite.IsInRole([Security.Principal.WindowsBuiltInRole]::Administrator)) {
    Start-Process powershell.exe -Verb RunAs -ArgumentList @('-NoProfile', '-ExecutionPolicy', 'Bypass', '-File', "`"$PSCommandPath`"")
    exit
}

Write-Host 'Désinstallation de Sentinelle' -ForegroundColor Cyan
if (-not (Question 'Confirmer la désinstallation ?')) { exit }

Stop-ScheduledTask -TaskName $NomTache -ErrorAction SilentlyContinue
Unregister-ScheduledTask -TaskName $NomTache -Confirm:$false -ErrorAction SilentlyContinue
# La ligne de commande (et pas seulement l'exécutable) : le python.exe d'un venv relance le Python de base.
Get-CimInstance Win32_Process -ErrorAction SilentlyContinue |
    Where-Object { $_.ProcessId -ne $PID -and $_.CommandLine -and $_.CommandLine.IndexOf($Dest, [StringComparison]::OrdinalIgnoreCase) -ge 0 } |
    ForEach-Object { Stop-Process -Id $_.ProcessId -Force -ErrorAction SilentlyContinue }
Write-Host '   OK   surveillance arrêtée' -ForegroundColor Green

Remove-Item (Join-Path ([Environment]::GetFolderPath('Desktop')) 'Sentinelle.lnk') -Force -ErrorAction SilentlyContinue
Remove-Item (Join-Path ([Environment]::GetFolderPath('Programs')) 'Sentinelle') -Recurse -Force -ErrorAction SilentlyContinue
Write-Host '   OK   raccourcis supprimés' -ForegroundColor Green

Set-Location $env:TEMP
Start-Sleep -Seconds 1
Remove-Item $Dest -Recurse -Force -ErrorAction SilentlyContinue
if (Test-Path $Dest) { Write-Host "   (!)  $Dest n'a pas pu être entièrement supprimé (fichier en cours d'utilisation ?)." -ForegroundColor Yellow }
else { Write-Host '   OK   programme supprimé' -ForegroundColor Green }

$regles = @(Get-NetFirewallRule -DisplayName 'Sentinelle-bloque-*' -ErrorAction SilentlyContinue)
if ($regles.Count -gt 0) {
    Write-Host ''
    Write-Host "$($regles.Count) règle(s) de pare-feu créée(s) par Sentinelle : $(($regles.DisplayName) -join ', ')"
    if (Question 'Les supprimer ? (les garder conserve la protection)' $false) {
        $regles | Remove-NetFirewallRule
        Write-Host '   OK   règles supprimées' -ForegroundColor Green
    }
}

if (Test-Path $Donnees) {
    if (Question "Supprimer aussi les rapports et le journal d'audit ($Donnees) ?" $false) {
        Remove-Item $Donnees -Recurse -Force
        Write-Host '   OK   données supprimées' -ForegroundColor Green
    }
}

Write-Host ''
Write-Host 'Sentinelle est désinstallé. Python reste installé (il peut servir à d''autres programmes).'
Read-Host 'Appuie sur Entrée pour fermer'
