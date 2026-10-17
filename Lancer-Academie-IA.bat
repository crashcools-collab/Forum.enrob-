@echo off
setlocal EnableExtensions
chcp 65001 >nul
title Academie IA - Tout savoir sur l'IA
cd /d "%~dp0"
set "SITE=%~dp0academie-ia"

if not exist "%SITE%\index.html" (
  echo Le dossier academie-ia est introuvable.
  echo Place ce lanceur a cote du dossier academie-ia.
  pause
  exit /b 1
)

:menu
cls
echo ==========================================================
echo        ACADEMIE IA  -  Tout savoir sur l'IA
echo        Du novice a l'expert - a jour au 17 octobre 2026
echo ==========================================================
echo.
echo  OUVRIR LA FORMATION
echo    1. Accueil et tableau de bord      10. Atelier interactif
echo    2. Parcours par niveau             11. Bibliotheque de prompts
echo    3. Les fondamentaux                12. GitHub, Hugging Face, cours
echo    4. Encyclopedie de l'IA            13. Quiz final
echo    5. La pile de l'IA                 14. Glossaire
echo    6. Histoire de l'IA (1943-2026)    15. Securite et regles
echo    7. Cours complets                  16. Recherche
echo    8. Panorama des outils
echo    9. Methode de prompt et prompt maitre
echo.
echo  INSTALLER LES OUTILS POUR PRATIQUER
echo   20. Ollama   (faire tourner une IA sur ton PC)
echo   21. Python   (le langage de l'IA)
echo   22. Git      (versionner, utiliser GitHub)
echo   23. VS Code  (editeur de code)
echo   24. Lancer un modele local avec Ollama
echo.
echo    0. Quitter
echo.
set "choix="
set /p "choix=Ton choix : "

if "%choix%"=="1"  call :ouvrir index & goto menu
if "%choix%"=="2"  call :ouvrir niveaux & goto menu
if "%choix%"=="3"  call :ouvrir fondamentaux & goto menu
if "%choix%"=="4"  call :ouvrir encyclopedie & goto menu
if "%choix%"=="5"  call :ouvrir pile & goto menu
if "%choix%"=="6"  call :ouvrir histoire & goto menu
if "%choix%"=="7"  call :ouvrir cours & goto menu
if "%choix%"=="8"  call :ouvrir outils & goto menu
if "%choix%"=="9"  call :ouvrir methode & goto menu
if "%choix%"=="10" call :ouvrir atelier & goto menu
if "%choix%"=="11" call :ouvrir bibliotheque & goto menu
if "%choix%"=="12" call :ouvrir ressources & goto menu
if "%choix%"=="13" call :ouvrir quiz & goto menu
if "%choix%"=="14" call :ouvrir glossaire & goto menu
if "%choix%"=="15" call :ouvrir securite & goto menu
if "%choix%"=="16" call :ouvrir recherche & goto menu
if "%choix%"=="20" call :installer Ollama.Ollama "Ollama" & goto menu
if "%choix%"=="21" call :installer Python.Python.3.12 "Python 3.12" & goto menu
if "%choix%"=="22" call :installer Git.Git "Git" & goto menu
if "%choix%"=="23" call :installer Microsoft.VisualStudioCode "Visual Studio Code" & goto menu
if "%choix%"=="24" call :modele & goto menu
if "%choix%"=="0"  exit /b 0
goto menu

:ouvrir
start "" "%SITE%\%~1.html"
exit /b 0

:installer
where winget >nul 2>nul
if errorlevel 1 (
  echo.
  echo winget est introuvable. Installe "App Installer" depuis le Microsoft Store,
  echo ou telecharge %~2 depuis son site officiel.
  pause
  exit /b 0
)
echo.
echo Installation de %~2 avec winget...
winget install --id %~1 -e --accept-package-agreements --accept-source-agreements
echo.
echo Termine. Si %~2 n'est pas reconnu, ferme puis relance ce lanceur.
pause
exit /b 0

:modele
where ollama >nul 2>nul
if errorlevel 1 (
  echo.
  echo Ollama n'est pas installe ou pas encore reconnu.
  echo Choisis 20 pour l'installer, puis relance ce lanceur.
  pause
  exit /b 0
)
set "m=mistral"
echo.
echo Exemples : mistral, qwen3, gemma3, llama3.2, gpt-oss
set /p "m=Modele a lancer (Entree = mistral) : "
echo Telechargement au premier lancement, puis discussion. Tape /bye pour quitter.
ollama run %m%
pause
exit /b 0
