@echo off
chcp 65001 >nul
title Academie IA
cd /d "%~dp0"
if not exist "formation-ia.html" (
  echo Le fichier formation-ia.html est introuvable.
  echo Place ce lanceur dans le meme dossier que formation-ia.html.
  pause
  exit /b 1
)
start "" "%~dp0formation-ia.html"
