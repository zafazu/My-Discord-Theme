@echo off
pushd "%~dp0"
start "" pythonw "%~dp0inject.py"
popd
exit

