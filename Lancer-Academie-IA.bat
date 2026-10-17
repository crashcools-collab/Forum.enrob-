@echo off
setlocal EnableExtensions
chcp 65001 >nul
title Academie IA - Tout savoir sur l'IA
cd /d "%~dp0"

if not exist "formation-ia.html" (
  echo Le fichier formation-ia.html est introuvable.
  echo Place ce lanceur dans le meme dossier que formation-ia.html.
  pause
  exit /b 1
)
set "FICHIER=%~dp0formation-ia.html"
set "URL=file:///%FICHIER:\=/%"

:menu
cls
echo ==========================================================
echo        ACADEMIE IA  -  Tout savoir sur l'IA
echo        Du novice a l'expert - a jour au 17 octobre 2026
echo ==========================================================
echo.
echo  OUVRIR LA FORMATION
echo    1. Accueil et tableau de bord
echo    2. Parcours par niveau
echo    3. Les fondamentaux
echo    4. Encyclopedie de l'IA
echo    5. La pile de l'IA (des puces aux applications)
echo    6. Histoire de l'IA (1943 - 2026)
echo    7. Cours complets
echo    8. Panorama des outils
echo    9. Methode de prompt et prompt maitre
echo   10. GitHub, Hugging Face et cours gratuits
echo   11. Quiz final
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

if "%choix%"=="1"  call :ouvrir accueil & goto menu
if "%choix%"=="2"  call :ouvrir niveaux & goto menu
if "%choix%"=="3"  call :ouvrir bases & goto menu
if "%choix%"=="4"  call :ouvrir encyclo & goto menu
if "%choix%"=="5"  call :ouvrir pile & goto menu
if "%choix%"=="6"  call :ouvrir histoire & goto menu
if "%choix%"=="7"  call :ouvrir cours & goto menu
if "%choix%"=="8"  call :ouvrir outils & goto menu
if "%choix%"=="9"  call :ouvrir methode & goto menu
if "%choix%"=="10" call :ouvrir ressources & goto menu
if "%choix%"=="11" call :ouvrir quiz & goto menu
if "%choix%"=="20" call :installer Ollama.Ollama "Ollama" & goto menu
if "%choix%"=="21" call :installer Python.Python.3.12 "Python 3.12" & goto menu
if "%choix%"=="22" call :installer Git.Git "Git" & goto menu
if "%choix%"=="23" call :installer Microsoft.VisualStudioCode "Visual Studio Code" & goto menu
if "%choix%"=="24" call :modele & goto menu
if "%choix%"=="0"  exit /b 0
goto menu

:ouvrir
rem Edge est present sur tous les Windows 10 et 11 et respecte l'ancre de section.
start "" msedge "%URL%#%~1"
if errorlevel 1 start "" "%FICHIER%"
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
