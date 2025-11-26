@echo off
pushd "%~dp0"
start "" pythonw "%~dp0inject.py"
timeout /t 5 /nobreak >nul
start "You can close this" cmd /k python "%~dp0print.py"
popd
exit
