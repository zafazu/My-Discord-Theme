import os
import time
import signal
import psutil
import sys
from pathlib import Path

time.sleep(10) 


def find_process_by_name(name):
    for proc in psutil.process_iter(['pid', 'name']):
        try:
            if name.lower() in proc.info['name'].lower():
                return True
        except (psutil.NoSuchProcess, psutil.AccessDenied):
            pass
    return False

def kill_other_python_processes():
    current_pid = os.getpid()
    for proc in psutil.process_iter(['pid', 'name', 'cmdline']):
        try:
            if 'python' in proc.info['name'].lower():
                if current_pid != proc.info['pid']:
                    proc.terminate()
                    proc.wait(timeout=2) 
        except (psutil.NoSuchProcess, psutil.AccessDenied, psutil.TimeoutExpired):
            continue

def run_as_daemon():
    if os.name == 'nt':  # Windows
        import ctypes
        ctypes.windll.user32.ShowWindow(
            ctypes.windll.kernel32.GetConsoleWindow(), 0
        )

if __name__ == "__main__":
    if os.name == 'nt':
        run_as_daemon()
    
    while True:
        if not find_process_by_name("Discord"):
            kill_other_python_processes()
            os.kill(os.getpid(), signal.SIGTERM)  
        time.sleep(3) 