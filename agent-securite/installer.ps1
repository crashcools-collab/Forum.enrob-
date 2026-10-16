# Installeur de Sentinelle pour Windows 10/11.
# Lancer via INSTALLER.bat (double-clic). Les droits administrateur sont demandés automatiquement.
#
# Emplacements choisis pour la sécurité :
#   C:\Program Files\Sentinelle   code + environnement Python (modifiable seulement par un administrateur :
#                                 un malware lancé avec ton compte ne peut pas le remplacer pour obtenir
#                                 les droits admin au prochain démarrage)
#   C:\ProgramData\Sentinelle     rapports, référence et journal d'audit (lecture seule pour les utilisateurs,
#                                 pour qu'un malware ne puisse ni effacer ses traces ni se blanchir dans la référence)

$ErrorActionPreference = 'Stop'
$Version = '1.0.0'
$Source = Split-Path -Parent $MyInvocation.MyCommand.Path
$Dest = Join-Path $env:ProgramFiles 'Sentinelle'
$Donnees = Join-Path $env:ProgramData 'Sentinelle'
$NomTache = 'Sentinelle - Surveillance'
$DossierMenu = Join-Path ([Environment]::GetFolderPath('Programs')) 'Sentinelle'
$RaccourciBureau = Join-Path ([Environment]::GetFolderPath('Desktop')) 'Sentinelle.lnk'

function Etape($texte) { Write-Host ''; Write-Host "== $texte" -ForegroundColor Cyan }
function Ok($texte) { Write-Host "   OK   $texte" -ForegroundColor Green }
function Avert($texte) { Write-Host "   (!)  $texte" -ForegroundColor Yellow }
function Echec($texte) {
    Write-Host ''
    Write-Host "ÉCHEC : $texte" -ForegroundColor Red
    Read-Host 'Appuie sur Entrée pour fermer'
    exit 1
}
function Question($texte, $defautOui = $true) {
    $suffixe = if ($defautOui) { '[O/n]' } else { '[o/N]' }
    $r = Read-Host "$texte $suffixe"
    if ([string]::IsNullOrWhiteSpace($r)) { return $defautOui }
    return $r.Trim().ToLower().StartsWith('o')
}

# --- 1. Droits administrateur -------------------------------------------------------------
$identite = [Security.Principal.WindowsPrincipal][Security.Principal.WindowsIdentity]::GetCurrent()
if (-not $identite.IsInRole([Security.Principal.WindowsBuiltInRole]::Administrator)) {
    Write-Host 'Demande des droits administrateur...'
    Start-Process powershell.exe -Verb RunAs -ArgumentList @('-NoProfile', '-ExecutionPolicy', 'Bypass', '-File', "`"$PSCommandPath`"")
    exit
}

Clear-Host
Write-Host "Installation de Sentinelle $Version" -ForegroundColor Cyan
Write-Host "Code    : $Dest"
Write-Host "Données : $Donnees"

foreach ($f in @('sentinelle.py', 'tableau_de_bord.py', 'requirements.txt', 'desinstaller.ps1', 'interface\index.html', 'interface\app.js', 'interface\app.css')) {
    if (-not (Test-Path (Join-Path $Source $f))) { Echec "fichier manquant à côté de l'installeur : $f. Décompresse tout le ZIP avant de lancer INSTALLER.bat." }
}

# --- 2. Python ----------------------------------------------------------------------------
Etape 'Python'

function Version-Python($exe) {
    try {
        $v = & $exe -c "import sys; print('%d.%d' % sys.version_info[:2] if sys.version_info >= (3, 9) else '')" 2>$null
        if ($LASTEXITCODE -eq 0 -and $v) { return "$v".Trim() }
    } catch { }
    return $null
}

function Trouver-Python {
    # Priorité à un Python installé pour tous les utilisateurs (dossier protégé).
    $machine = Get-ChildItem "$env:ProgramFiles\Python3*\python.exe" -ErrorAction SilentlyContinue | Sort-Object FullName -Descending
    foreach ($c in $machine) { if (Version-Python $c.FullName) { return $c.FullName } }
    foreach ($nom in @('py', 'python')) {
        $cmd = Get-Command $nom -ErrorAction SilentlyContinue
        if (-not $cmd -or $cmd.Source -like '*\WindowsApps\*') { continue }  # alias Microsoft Store qui ne contient pas Python
        try {
            $exe = if ($nom -eq 'py') { & $cmd.Source -3 -c 'import sys; print(sys.executable)' 2>$null } else { & $cmd.Source -c 'import sys; print(sys.executable)' 2>$null }
            if ($LASTEXITCODE -eq 0 -and $exe -and (Test-Path "$exe".Trim()) -and (Version-Python "$exe".Trim())) { return "$exe".Trim() }
        } catch { }
    }
    return $null
}

function Installer-Python {
    if (-not (Get-Command winget -ErrorAction SilentlyContinue)) {
        Echec "winget est absent. Installe Python 3.12 depuis https://www.python.org/downloads/ (cocher « Install for all users » et « Add to PATH »), puis relance l'installeur."
    }
    Write-Host '   Installation de Python 3.12 pour tous les utilisateurs (quelques minutes)...'
    winget install -e --id Python.Python.3.12 --scope machine --silent --accept-package-agreements --accept-source-agreements
    $exe = Get-ChildItem "$env:ProgramFiles\Python3*\python.exe" -ErrorAction SilentlyContinue | Sort-Object FullName -Descending | Select-Object -First 1
    if (-not $exe) { Echec "Python ne s'est pas installé correctement. Installe-le depuis python.org puis relance l'installeur." }
    return $exe.FullName
}

$Python = Trouver-Python
if (-not $Python) {
    Avert 'Python 3.9+ introuvable.'
    $Python = Installer-Python
} elseif (-not $Python.StartsWith($env:ProgramFiles, [StringComparison]::OrdinalIgnoreCase)) {
    Avert "Python trouvé dans un dossier modifiable par ton compte : $Python"
    Avert "Sentinelle tourne en administrateur : un malware pourrait modifier ce Python pour obtenir les droits admin."
    if (Question 'Installer un Python protégé pour tous les utilisateurs (recommandé) ?') { $Python = Installer-Python }
}
Ok "Python $(Version-Python $Python) : $Python"

# --- 3. Copie des fichiers ----------------------------------------------------------------
Etape 'Copie des fichiers'
if (Get-ScheduledTask -TaskName $NomTache -ErrorAction SilentlyContinue) {
    Stop-ScheduledTask -TaskName $NomTache -ErrorAction SilentlyContinue
}
# La ligne de commande (et pas seulement l'exécutable) : le python.exe d'un venv relance le Python de base.
Get-CimInstance Win32_Process -ErrorAction SilentlyContinue |
    Where-Object { $_.ProcessId -ne $PID -and $_.CommandLine -and $_.CommandLine.IndexOf($Dest, [StringComparison]::OrdinalIgnoreCase) -ge 0 } |
    ForEach-Object { Stop-Process -Id $_.ProcessId -Force -ErrorAction SilentlyContinue }

$Venv = Join-Path $Dest 'venv'
if (Test-Path $Venv) { Remove-Item $Venv -Recurse -Force }
New-Item -ItemType Directory -Force -Path $Dest | Out-Null
foreach ($f in @('sentinelle.py', 'tableau_de_bord.py', 'requirements.txt', 'desinstaller.ps1', 'README.md')) {
    $chemin = Join-Path $Source $f
    if (Test-Path $chemin) { Copy-Item $chemin -Destination $Dest -Force }
}
Copy-Item (Join-Path $Source 'interface') -Destination $Dest -Recurse -Force
Get-ChildItem $Dest -Recurse -File | Unblock-File
Ok $Dest

# --- 4. Environnement Python isolé --------------------------------------------------------
Etape 'Environnement Python'
& $Python -m venv $Venv
if ($LASTEXITCODE -ne 0) { Echec 'création de l''environnement Python impossible.' }
$PyVenv = Join-Path $Venv 'Scripts\python.exe'
$PyVenvW = Join-Path $Venv 'Scripts\pythonw.exe'
& $PyVenv -m pip install --disable-pip-version-check --quiet -r (Join-Path $Dest 'requirements.txt')
if ($LASTEXITCODE -ne 0) { Echec 'installation de psutil impossible (connexion Internet ?).' }
Ok 'psutil installé'

# --- 5. Dossier de données protégé --------------------------------------------------------
Etape 'Dossier de données'
New-Item -ItemType Directory -Force -Path $Donnees | Out-Null
# Administrateurs et SYSTEM : contrôle total. Utilisateurs : lecture seule.
& icacls $Donnees /inheritance:r /grant:r '*S-1-5-32-544:(OI)(CI)F' '*S-1-5-18:(OI)(CI)F' '*S-1-5-32-545:(OI)(CI)RX' | Out-Null
if ($LASTEXITCODE -ne 0) { Avert 'permissions du dossier de données non appliquées.' } else { Ok "$Donnees (écriture réservée aux administrateurs)" }

[ordered]@{ version = $Version; donnees = $Donnees; python = $Python; installe_le = (Get-Date -Format s) } |
    ConvertTo-Json | Set-Content -Path (Join-Path $Dest 'installe.json') -Encoding UTF8

# --- 6. Lanceurs et raccourcis ------------------------------------------------------------
Etape 'Raccourcis'
$lanceurs = @{
    'tableau-de-bord.cmd' = "@echo off`r`nchcp 65001 >nul`r`ntitle Sentinelle - Tableau de bord`r`n`"%~dp0venv\Scripts\python.exe`" `"%~dp0tableau_de_bord.py`"`r`npause`r`n"
    'scan.cmd'            = "@echo off`r`nchcp 65001 >nul`r`ntitle Sentinelle - Scan`r`n`"%~dp0venv\Scripts\python.exe`" `"%~dp0sentinelle.py`" scan --interactif`r`npause`r`n"
    'desinstaller.cmd'    = "@echo off`r`npowershell.exe -NoProfile -ExecutionPolicy Bypass -File `"%~dp0desinstaller.ps1`"`r`n"
}
foreach ($nom in $lanceurs.Keys) { [IO.File]::WriteAllText((Join-Path $Dest $nom), $lanceurs[$nom], [Text.Encoding]::ASCII) }

function Nouveau-Raccourci($chemin, $cible, $description, $admin) {
    $ws = New-Object -ComObject WScript.Shell
    $lnk = $ws.CreateShortcut($chemin)
    $lnk.TargetPath = $cible
    $lnk.WorkingDirectory = $Dest
    $lnk.Description = $description
    $lnk.IconLocation = "$env:SystemRoot\System32\shell32.dll,47"
    $lnk.Save()
    if ($admin) {
        # Octet 0x15 bit 0x20 du fichier .lnk = « Exécuter en tant qu'administrateur ».
        $octets = [IO.File]::ReadAllBytes($chemin)
        $octets[0x15] = $octets[0x15] -bor 0x20
        [IO.File]::WriteAllBytes($chemin, $octets)
    }
}
New-Item -ItemType Directory -Force -Path $DossierMenu | Out-Null
Nouveau-Raccourci $RaccourciBureau (Join-Path $Dest 'tableau-de-bord.cmd') 'Tableau de bord de sécurité Sentinelle' $true
Nouveau-Raccourci (Join-Path $DossierMenu 'Sentinelle - Tableau de bord.lnk') (Join-Path $Dest 'tableau-de-bord.cmd') 'Tableau de bord de sécurité Sentinelle' $true
Nouveau-Raccourci (Join-Path $DossierMenu 'Sentinelle - Scan rapide.lnk') (Join-Path $Dest 'scan.cmd') 'Scan de sécurité en console' $true
Nouveau-Raccourci (Join-Path $DossierMenu 'Désinstaller Sentinelle.lnk') (Join-Path $Dest 'desinstaller.cmd') 'Désinstaller Sentinelle' $false
Ok 'Bureau + menu Démarrer > Sentinelle'

# --- 7. Surveillance au démarrage ---------------------------------------------------------
Etape 'Surveillance automatique'
Write-Host '   Analyse le PC toutes les 5 minutes en arrière-plan et affiche une fenêtre en cas d''alerte grave.'
if (Question 'Lancer la surveillance à chaque ouverture de session ?') {
    $utilisateur = "$env:USERDOMAIN\$env:USERNAME"
    $action = New-ScheduledTaskAction -Execute $PyVenvW -Argument "`"$Dest\sentinelle.py`" surveiller --intervalle 300 --popup" -WorkingDirectory $Dest
    $declencheur = New-ScheduledTaskTrigger -AtLogOn -User $utilisateur
    $principal = New-ScheduledTaskPrincipal -UserId $utilisateur -LogonType Interactive -RunLevel Highest
    $reglages = New-ScheduledTaskSettingsSet -AllowStartIfOnBatteries -DontStopIfGoingOnBatteries -StartWhenAvailable `
        -MultipleInstances IgnoreNew -ExecutionTimeLimit (New-TimeSpan -Seconds 0)
    Register-ScheduledTask -TaskName $NomTache -Action $action -Trigger $declencheur -Principal $principal -Settings $reglages `
        -Description 'Surveillance de sécurité Sentinelle (règles locales + analyse LM Studio).' -Force | Out-Null
    Start-ScheduledTask -TaskName $NomTache
    Ok "tâche planifiée « $NomTache » créée et démarrée pour $utilisateur"
} else {
    Unregister-ScheduledTask -TaskName $NomTache -Confirm:$false -ErrorAction SilentlyContinue
    Avert 'surveillance automatique non activée (activable plus tard depuis le tableau de bord, tant qu''il est ouvert).'
}

# --- 8. Fin -------------------------------------------------------------------------------
Etape 'Terminé'
Write-Host '   Raccourci « Sentinelle » sur le Bureau : ouvre le tableau de bord.'
Write-Host '   Pense à : LM Studio > Developer > démarrer le serveur, et désactiver « Serve on Local Network ».'
Write-Host '   Première chose à faire dans le tableau de bord : bouton « Référence » (si tu fais confiance à l''état actuel du PC).'
if (Question 'Ouvrir le tableau de bord maintenant ?') {
    Start-Process -FilePath (Join-Path $Dest 'tableau-de-bord.cmd') -WorkingDirectory $Dest
}
Read-Host 'Appuie sur Entrée pour fermer'
