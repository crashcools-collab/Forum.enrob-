@echo off
rem Sentinelle en mode leger : lecture seule, sans droits administrateur, sans PowerShell.
chcp 65001 >nul
title Sentinelle (mode leger)
cd /d "%~dp0"
where py >nul 2>nul
if errorlevel 1 (
  echo Python est introuvable.
  echo Installe-le depuis https://www.python.org/downloads/ puis relance ce fichier.
  pause
  exit /b 1
)
py -3 -c "import psutil" >nul 2>nul || py -3 -m pip install --user --disable-pip-version-check -q psutil
py -3 tableau_de_bord.py --leger
pause
