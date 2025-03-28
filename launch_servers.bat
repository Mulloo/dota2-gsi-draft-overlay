@echo off
cd /d "%~dp0"
color 0A
cls
title Dota 2 GSI Overlay Launcher

echo [INFO] Launching backend server...
start cmd /k "cd dota2-gsi-server && node server.js"

timeout /t 2

echo [INFO] Launching frontend (overlay-ui)...
start cmd /k "cd overlay-ui && npm start"

echo [SUCCESS] All servers launched.
pause
