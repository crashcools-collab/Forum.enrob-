@echo off
setlocal EnableExtensions
chcp 65001 >nul
title Atlas de l'Univers - le ciel et l'univers en 3D
cd /d "%~dp0"
set "ATLAS=%~dp0atlas-univers"

if not exist "%ATLAS%\index.html" (
  echo Le dossier atlas-univers est introuvable.
  echo Place ce lanceur a cote du dossier atlas-univers.
  pause
  exit /b 1
)

:menu
cls
echo.
echo        .        *            .       *         .
echo    *        ATLAS DE L'UNIVERS          .    *
echo        Le vrai ciel, le systeme solaire et l'univers en 3D
echo    .      avec Stella, la fee des etoiles        *
echo        *         .         *        .       .
echo  ==============================================================
echo.
echo   EXPLORER
echo    1. Ciel en direct (planetarium, ta ville, l'heure exacte)
echo    2. Ce soir : que voir cette nuit ?
echo    3. FORMATION : l'Odyssee cosmique (14 chapitres + diplome)
echo    4. Systeme solaire en 3D
echo    5. Univers en 3D (etoiles voisines, Voie lactee, galaxies)
echo    6. Photos et videos de la NASA (internet necessaire)
echo.
echo   COMPRENDRE ET JOUER
echo    7. Decouvertes a couper le souffle
echo    8. Demonstrations interactives
echo    9. Encyclopedie et schemas
echo   10. Quiz
echo   11. Defis d'observation et badges
echo   12. Outils et calendrier (eclipses, etoiles filantes...)
echo.
echo   13. Visite guidee avec Stella
echo   14. Ouvrir l'atlas la ou je m'etais arrete
echo.
echo    0. Quitter
echo.
echo   Tout fonctionne sans internet, sauf l'onglet NASA.
echo.
set "choix="
set /p "choix=Ton choix : "

if "%choix%"=="1"  call :ouvrir ciel & goto menu
if "%choix%"=="2"  call :ouvrir cesoir & goto menu
if "%choix%"=="3"  call :ouvrir formation & goto menu
if "%choix%"=="4"  call :ouvrir systeme & goto menu
if "%choix%"=="5"  call :ouvrir cosmos & goto menu
if "%choix%"=="6"  call :ouvrir medias & goto menu
if "%choix%"=="7"  call :ouvrir decouvertes & goto menu
if "%choix%"=="8"  call :ouvrir demos & goto menu
if "%choix%"=="9"  call :ouvrir encyclo & goto menu
if "%choix%"=="10" call :ouvrir quiz & goto menu
if "%choix%"=="11" call :ouvrir defis & goto menu
if "%choix%"=="12" call :ouvrir outils & goto menu
if "%choix%"=="13" call :ouvrir visite & goto menu
if "%choix%"=="14" start "" "%ATLAS%\index.html" & goto menu
if "%choix%"=="0"  exit /b 0
goto menu

:ouvrir
rem Windows perd la partie "#onglet" d'une adresse de fichier : on passe par une petite page de renvoi.
set "RENVOI=%ATLAS%\ouvrir.html"
> "%RENVOI%" echo ^<!doctype html^>^<meta charset="utf-8"^>^<meta http-equiv="refresh" content="0;url=index.html#%~1"^>^<title^>Atlas de l'Univers^</title^>
if exist "%RENVOI%" (
  start "" "%RENVOI%"
) else (
  start "" "%ATLAS%\index.html"
)
exit /b 0
