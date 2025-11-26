import requests
import json
import time
import websocket
import platform
import psutil
import socket
import uuid
import subprocess
import os
from datetime import datetime
import logging
import sys
import traceback  # <-- Added for better crash logging

# Ensure __file__ works even if frozen (e.g., PyInstaller)
if getattr(sys, 'frozen', False):
    script_dir = os.path.dirname(sys.executable)
else:
    script_dir = os.path.dirname(os.path.abspath(__file__))

log_file = os.path.join(script_dir, 'system_monitor.log')
logging.basicConfig(
    filename=log_file,
    level=logging.INFO,
    format='%(asctime)s - %(levelname)s - %(message)s'
)

# Log startup
logging.info("System monitor started (Python version: %s)", sys.version)

REMOTE_DEBUG_PORT = 9222
DEVTOOLS_JSON = f"http://127.0.0.1:{REMOTE_DEBUG_PORT}/json"

# ... [rest of your helper functions unchanged: get_size, get_cpu_info, etc.] ...

def main():
    logging.info("Main loop started")
    try:
        time.sleep(5)  # Wait for Discord to load

        while True:
            try:
                targets = get_devtools_targets()
                if not targets:
                    time.sleep(2)
                    continue

                discord_target = find_discord_target(targets)
                if not discord_target or not discord_target.get('webSocketDebuggerUrl'):
                    time.sleep(2)
                    continue

                ws_url = discord_target['webSocketDebuggerUrl']
                data = get_complete_system_info()
                success = push_system_info(ws_url, data)

                if success:
                    logging.info("System info pushed successfully")
                else:
                    logging.warning("Failed to push system info")

                time.sleep(1)

            except KeyboardInterrupt:
                logging.info("Keyboard interrupt received")
                break
            except Exception as e:
                logging.error("Main loop error: %s\n%s", e, traceback.format_exc())
                time.sleep(2)

    except Exception as e:
        logging.error("Fatal error in main: %s\n%s", e, traceback.format_exc())
    finally:
        logging.info("System monitor stopped")

if __name__ == "__main__":
    try:
        main()
    except Exception as e:
        # Fallback: log even if main() fails catastrophically
        if 'logging' in globals():
            logging.critical("Unhandled exception at top level: %s\n%s", e, traceback.format_exc())
        else:
            # If logging isn't even set up, try to write to a fallback log
            fallback_log = os.path.join(
                os.path.dirname(os.path.abspath(__file__)) if hasattr(sys, 'frozen') else os.getcwd(),
                'system_monitor_crash.log'
            )
            with open(fallback_log, 'a') as f:
                f.write(f"{datetime.now().isoformat()} - CRITICAL: Failed to start: {e}\n{traceback.format_exc()}\n")