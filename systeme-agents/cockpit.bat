@echo off
rem Lance le cockpit : double-cliquez sur ce fichier.
cd /d "%~dp0"
if not exist ".venv\Scripts\python.exe" (
  echo Environnement .venv introuvable : suivez l installation du README.
  pause
  exit /b 1
)
rem Installe ou met a jour les dependances si l une manque (apres un git pull par exemple).
".venv\Scripts\python.exe" -c "import rich, langgraph, openai, psycopg" >nul 2>&1 || (
  echo Installation des dependances...
  ".venv\Scripts\python.exe" -m pip install -q -e . || (pause ^& exit /b 1)
)
docker compose up -d >nul 2>&1 || echo Docker ne repond pas : lancez Docker Desktop puis relancez ce fichier.
".venv\Scripts\python.exe" -m agents %*
pause
