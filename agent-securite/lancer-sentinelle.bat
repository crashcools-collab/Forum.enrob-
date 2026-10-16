@echo off
cd /d "%~dp0"
python sentinelle.py surveiller --intervalle 300 --popup
