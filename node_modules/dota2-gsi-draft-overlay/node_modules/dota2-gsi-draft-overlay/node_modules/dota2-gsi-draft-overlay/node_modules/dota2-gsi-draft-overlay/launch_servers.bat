@echo off
title Dota 2 GSI Overlay Launcher

echo Launching backend server...
start cmd /k "cd dota2-gsi-server && node server.js"

timeout /t 2

echo Launching frontend (overlay-ui)...
start cmd /k "cd overlay-ui && npm start"

echo All servers launched.
pause
