import psutil
import keyboard
import subprocess
import os
import time

bat_file = "start.bat"

def kill_process_by_name(name):
    for proc in psutil.process_iter(['pid', 'name']):
        try:
            if proc.info['name'] and name.lower() in proc.info['name'].lower():
                proc.terminate()
        except (psutil.NoSuchProcess, psutil.AccessDenied):
            continue

def kill_all_python_scripts(exclude_pid=None):
    for proc in psutil.process_iter(['pid', 'name', 'cmdline']):
        try:
            if "python" in proc.info['name'].lower():
                if exclude_pid and proc.info['pid'] == exclude_pid:
                    continue
                proc.terminate()
        except (psutil.NoSuchProcess, psutil.AccessDenied):
            continue

def main():
    while True:
        if keyboard.is_pressed("ctrl+r"):
            kill_process_by_name("Discord")
            time.sleep(0.5)

            current_pid = os.getpid()
            kill_all_python_scripts(exclude_pid=current_pid)
            time.sleep(0.5)

            subprocess.Popen(
                [os.path.join(os.getcwd(), bat_file)],
                creationflags=subprocess.CREATE_NO_WINDOW
            )

            psutil.Process(current_pid).terminate()
            break
        time.sleep(0.1)

if __name__ == "__main__":
    main()
