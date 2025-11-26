import os
import sys
import time
import json
import shutil
import subprocess
import glob
import datetime
import threading
import atexit
import psutil

try:
    import requests
    import websocket
    import customtkinter as ctk
    from pynput import keyboard
except Exception:
    print("Missing deps.")
    sys.exit(1)



# GUI
APP_NAME = "DarkVision"
WIDTH = 500
HEIGHT = 250
COLOR_BG_DEEP = "#050505"
COLOR_BG_PEAK = "#1a1a1a"
COLOR_NEON_ACCENT = "#FFFFFF"
COLOR_TEXT_WHITE = "#FFFFFF"
FONT_MAIN_BOLD = ("Arial", 26, "bold")
FONT_SMALL = ("Roboto", 11)

# VALUES
LOCALAPPDATA = os.environ.get("LOCALAPPDATA")
SRC_DIR = os.path.join(LOCALAPPDATA, "Discord")
COPY_PREFIX = os.path.join(LOCALAPPDATA, "Discord-inject")
REMOTE_DEBUG_PORT = 9222
DEVTOOLS_JSON = f"http://127.0.0.1:{REMOTE_DEBUG_PORT}/json"
POLL_INTERVAL = 0.2



SPLASH_TRIGGERS = [
    "DiscordSplash.signalReady",
    "DiscordSplash.onStateUpdate",
    "Splash.onStateUpdate",
    "Splash.updateCountdownSeconds"
]



MAIN_TRIGGERS = [
    "[BlockedDomainsStore] Successfully fetched blocked domains"
]



GLOBAL_NORMAL_PAYLOAD = None
GLOBAL_SPLASH_PAYLOAD = None

loader_path = os.path.join(os.path.dirname(__file__), "loader.py")
python_files = ["end.py", "reloader.py", "tchange.py" ]
python_executable = sys.executable




if sys.platform == "win32" and python_executable.lower().endswith("python.exe"):
    python_executable_w = python_executable[:-10] + "pythonw.exe"
    if os.path.exists(python_executable_w):
        python_executable = python_executable_w


def fetch_latest_js():
    owner = "zafazu"
    repo = "My-Discord-Theme"
    path = "JS"
    branch = "main"
    api_url = f"https://api.github.com/repos/{owner}/{repo}/contents/{path}?ref={branch}"
    
    try:
        r = requests.get(api_url, timeout=10)
        if r.status_code != 200:
            print(f"Failed to fetch file list: HTTP {r.status_code}")
            sys.exit(1)
        items = r.json()
    except Exception as e:
        print(f"Error fetching file list: {e}")
        sys.exit(1)
    
    js_entries = [it for it in items if it.get("type") == "file" and it.get("name", "").lower().endswith(".js")]
    
    splash_scripts = []
    normal_scripts = []
    
    for entry in js_entries:
        name = entry.get("name")
        download_url = entry.get("download_url")
        
        if not download_url:
            print(f" Skipping {name} (no download URL)")
            continue
        
        try:
            rr = requests.get(download_url, timeout=10)
            if rr.status_code == 200:
                text = rr.text
                
                if "[SPLASH]" in name.upper():
                    splash_scripts.append(text)
                    print(f"[SPLASH] {name} ({len(text)} chars)")
                else:
                    normal_scripts.append(text)
                    print(f"{name} ({len(text)} chars)")
            else:
                print(f"Failed to download {name}: HTTP {rr.status_code}")
        except Exception as e:
            print(f"Error downloading {name}: {e}")
    
    if not normal_scripts and not splash_scripts:
        print("No JS files could be downloaded")
        sys.exit(1)
    
    normal_js = "\n\n".join(normal_scripts) if normal_scripts else ""
    splash_js = "\n\n".join(splash_scripts) if splash_scripts else ""
    
    print(f"\nNormal JS: {len(normal_js)} characters")
    print(f"Splash JS: {len(splash_js)} characters\n")
    
    return normal_js, splash_js


def build_payload(js_code, flag_name="__silent_inject_done"):
    escaped = js_code.replace('\\', '\\\\').replace('`', '\\`').replace('${', '\\${')
    return f"""
(async () => {{
    try {{
        if (window.{flag_name}) return true;
        window.{flag_name} = true;
        try {{
            (0, eval)(`{escaped}`);
        }} catch(e) {{
            console.error('Injection eval error:', e);
        }}
        window.{flag_name} = true;
        return true;
    }} catch (e) {{
        window.{flag_name} = true;
        return false;
    }}
}})()
"""


def find_existing_copy():
    matches = sorted(glob.glob(COPY_PREFIX + "*"), key=os.path.getmtime, reverse=True)
    return matches[0] if matches else None


def copy_discord_once():
    existing = find_existing_copy()
    if existing:
        print("Found existing copy:", existing)
        return existing
    if not os.path.isdir(SRC_DIR):
        print("Original Discord not found at:", SRC_DIR)
        sys.exit(1)
    ts = datetime.datetime.now().strftime("%Y%m%d-%H%M%S")
    dest = COPY_PREFIX + "-" + ts
    print("Copying Discord to:", dest, "(this may take a while)...")
    try:
        shutil.copytree(SRC_DIR, dest)
    except Exception as e:
        print("Copy failed:", e)
        sys.exit(1)
    return dest


def kill_running_discord():
    try:
        subprocess.Popen(["taskkill", "/F", "/IM", "Discord.exe"], 
                      stdout=subprocess.DEVNULL, stderr=subprocess.DEVNULL)
        subprocess.Popen(["taskkill", "/F", "/IM", "Update.exe"], 
                      stdout=subprocess.DEVNULL, stderr=subprocess.DEVNULL)
        time.sleep(0.3)
    except Exception:
        pass


def find_discord_exe(copy_dir):
    try:
        app_folders = [d for d in os.listdir(copy_dir) 
                      if d.startswith("app-") and os.path.isdir(os.path.join(copy_dir, d))]
    except Exception:
        app_folders = []
    app_folders.sort(reverse=True)
    for app in app_folders:
        cand = os.path.join(copy_dir, app, "Discord.exe")
        if os.path.exists(cand):
            return cand
    for root, dirs, files in os.walk(copy_dir):
        if "Discord.exe" in files:
            return os.path.join(root, "Discord.exe")
    return None


def launch_discord(discord_exe, copy_dir, port=REMOTE_DEBUG_PORT):
    user_data = os.path.join(copy_dir, "userdata")
    os.makedirs(user_data, exist_ok=True)
    args = [
        discord_exe,
        f"--remote-debugging-port={port}",
        "--remote-allow-origins=*",
        "--no-sandbox",
        "--disable-web-security",
        "--ignore-certificate-errors",
        "--disable-site-isolation-trials",                                                      # THIS DOESNT DO SHIT BUT IDC
        "--disable-features=SameSiteByDefaultCookies",
        "--disable-features=BlockInsecurePrivateNetworkRequests",
        "--ignore-certificate-errors-spki-list",
        "--disable-site-isolation-trials",
        f"--user-data-dir={user_data}"
    ]
    print("Launching Discord:", discord_exe)
    try:
        subprocess.Popen(args, stdout=subprocess.DEVNULL, stderr=subprocess.DEVNULL)
    except Exception as e:
        print("Failed to launch Discord:", e)
        sys.exit(1)


def select_renderer_target(targets):
    if not targets:
        return None
    for t in targets:
        url = (t.get("url") or "").lower()
        if url.startswith("https://discord.com/channels") or url.startswith("https://discord.com/app"):
            return t
    for t in targets:
        url = (t.get("url") or "").lower()
        if url.startswith("https://") and "discord" in url:
            return t
    for t in targets:
        if t.get("type", "").lower() == "page":
            return t
    return None


def get_renderer_ws(timeout=20.0):
    deadline = time.time() + timeout
    last = None
    consecutive_failures = 0
    
    while time.time() < deadline:
        try:
            r = requests.get(DEVTOOLS_JSON, timeout=1.5)
            if r.status_code == 200:
                consecutive_failures = 0
                data = r.json()
                t = select_renderer_target(data)
                if t and t.get("webSocketDebuggerUrl"):
                    return t.get("webSocketDebuggerUrl"), t
                last = data
            else:
                consecutive_failures += 1
        except Exception as e:
            consecutive_failures += 1
            last = e
        
        if consecutive_failures > 5:
            time.sleep(POLL_INTERVAL * 1.5)
        else:
            time.sleep(POLL_INTERVAL)
    
    print("Timed out finding renderer. Last:", last)
    return None, None


def attempt_injection_once(ws_url, payload_js, connect_timeout=4.0, wait_context_s=1.0):
    try:
        ws = websocket.create_connection(ws_url, timeout=connect_timeout)
    except Exception:
        return False
    
    ctx_id = None
    try:
        ws.send(json.dumps({"id": 0, "method": "Runtime.enable"}))
        ws.settimeout(0.15)
        end_wait = time.time() + wait_context_s
        
        while time.time() < end_wait:
            try:
                raw = ws.recv()
            except websocket._exceptions.WebSocketTimeoutException:
                continue
            except Exception:
                break
            
            if not raw:
                continue
            
            try:
                obj = json.loads(raw)
            except Exception:
                continue
            
            if obj.get("method") == "Runtime.executionContextCreated":
                params = obj.get("params", {})
                ctx = params.get("context", {})
                cid = ctx.get("id")
                if cid:
                    ctx_id = cid
                    break
        
        eval_params = {"expression": payload_js, "awaitPromise": False, "returnByValue": True}
        if ctx_id:
            eval_params["contextId"] = ctx_id
        
        ws.send(json.dumps({"id": 1, "method": "Runtime.evaluate", "params": eval_params}))
        ws.settimeout(6.0)
        raw = ws.recv()
        
        if not raw:
            return False
        
        j = json.loads(raw)
        if "result" in j and isinstance(j["result"], dict):
            r = j["result"].get("result", {})
            if isinstance(r, dict) and "value" in r:
                return bool(r["value"])
            return False
        if "error" in j:
            return False
        return False
    except Exception:
        return False
    finally:
        try:
            ws.close()
        except:
            pass


def _extract_console_text(obj):
    pieces = []

    params = obj.get("params", {}) if isinstance(obj, dict) else {}

    args = params.get("args", [])
    if isinstance(args, list):
        for a in args:
            if not isinstance(a, dict):
                continue
            for k in ("value", "description", "type"):
                v = a.get(k)
                if isinstance(v, str) and v:
                    pieces.append(v)
            preview = a.get("preview") or {}
            if isinstance(preview, dict):
                desc = preview.get("description")
                if isinstance(desc, str) and desc:
                    pieces.append(desc)

    msg = params.get("message") or {}
    if isinstance(msg, dict):
        for k in ("text", "level", "source", "url"):
            v = msg.get(k)
            if isinstance(v, str) and v:
                pieces.append(v)
        extra = msg.get("arguments") or msg.get("params")
        if isinstance(extra, list):
            for e in extra:
                if isinstance(e, dict):
                    v = e.get("value") or e.get("description")
                    if isinstance(v, str) and v:
                        pieces.append(v)

    entry = params.get("entry") or {}
    if isinstance(entry, dict):
        for k in ("text", "source", "level"):
            v = entry.get(k)
            if isinstance(v, str) and v:
                pieces.append(v)

    if isinstance(obj.get("result"), dict):
        res = obj.get("result")
        for k in ("value", "description", "text"):
            v = res.get(k)
            if isinstance(v, str) and v:
                pieces.append(v)

    return " ".join(pieces).strip()


def _monitor_console_generic(ws_url, payload, triggers, timeout=30.0, kind="MAIN"):
    try:
        ws = websocket.create_connection(ws_url, timeout=4.0)
    except Exception as e:
        print(f"[{kind}] Failed to connect for monitoring: {e}")
        return False

    try:
        ws.send(json.dumps({"id": 0, "method": "Runtime.enable"}))
        ws.send(json.dumps({"id": 1, "method": "Console.enable"}))
        try:
            ws.send(json.dumps({"id": 2, "method": "Log.enable"}))
        except Exception:
            pass

        ws.settimeout(0.5)
        deadline = time.time() + timeout
        print(f"[{kind}] Monitoring console for triggers...")

        while time.time() < deadline:
            try:
                raw = ws.recv()
            except websocket._exceptions.WebSocketTimeoutException:
                continue
            except Exception:
                break

            if not raw:
                continue
            try:
                obj = json.loads(raw)
            except Exception:
                continue

            if obj.get("method") in ("Runtime.consoleAPICalled", "Console.messageAdded", "Log.entryAdded"):
                text = _extract_console_text(obj).lower()
                if not text:
                    continue

                for trigger in triggers:
                    if trigger.lower() in text:
                        print(f"[{kind}] Detected trigger: '{trigger}' - Injecting payload...")
                        success = attempt_injection_once(ws_url, payload, connect_timeout=4.0, wait_context_s=1.0)
                        if success:
                            print(f"[{kind}] Injection successful")
                            return True
                        else:
                            print(f"[{kind}] Injection failed (cuz this code sucks ass)")
                            return False

        print(f"[{kind}] Timeout - (cuz script slept)")
        return False

    except Exception as e:
        print(f"[{kind}] Monitoring error: {e}")
        return False
    finally:
        try:
            ws.close()
        except:
            pass


def monitor_console_for_main(ws_url, main_payload, timeout=30.0):
    return _monitor_console_generic(ws_url, main_payload, MAIN_TRIGGERS, timeout=timeout, kind="MAIN")

def monitor_console_for_splash(ws_url, splash_payload, timeout=20.0):
    return _monitor_console_generic(ws_url, splash_payload, SPLASH_TRIGGERS, timeout=timeout, kind="SPLASH")


def is_discord_running():
    discord_process_names = ["Discord.exe", "DiscordCanary.exe", "DiscordPTB.exe", "discord"]
    for proc in psutil.process_iter(['name']):
        try:
            if proc.info['name'] in discord_process_names:
                return True
        except (psutil.NoSuchProcess, psutil.AccessDenied):
            pass
    return False


def monitor_discord():
    while not is_discord_running():
        time.sleep(2)
    while True:
        if not is_discord_running():
            cleanup()
            sys.exit(0)
        time.sleep(2)


# GUI 
class UpdateWrapper(ctk.CTk):
    def __init__(self):
        super().__init__()
        self._closed = False
        self.title(APP_NAME)
        self.geometry(f"{WIDTH}x{HEIGHT}")
        self.resizable(False, False)
        self.configure(fg_color=COLOR_BG_DEEP)
        
        try:
            self.overrideredirect(True)
            self.attributes('-topmost', True)
        except Exception:
            pass
        
        self.center_window()
        self.grid_columnconfigure(0, weight=1)
        self.grid_rowconfigure(0, weight=1)
        
        # Main frame
        self.main_frame = ctk.CTkFrame(self, fg_color=COLOR_BG_DEEP, corner_radius=0)
        self.main_frame.grid(row=0, column=0, sticky="nsew", padx=0, pady=0)
        self.main_frame.grid_columnconfigure(0, weight=1)
        
        # Title
        self.lbl_title = ctk.CTkLabel(
            self.main_frame,
            text=APP_NAME,
            font=FONT_MAIN_BOLD,
            text_color=COLOR_TEXT_WHITE
        )
        self.lbl_title.grid(row=0, column=0, sticky="w", padx=20, pady=20)
        
        # Percent
        self.lbl_percent = ctk.CTkLabel(
            self.main_frame,
            text="0%",
            font=("Arial", 36, "bold"),
            text_color=COLOR_TEXT_WHITE
        )
        self.lbl_percent.grid(row=1, column=0, pady=10)
        
        # Status
        self.lbl_status = ctk.CTkLabel(
            self.main_frame,
            text="Starting...",
            font=FONT_SMALL,
            text_color="#aaaaaa"
        )
        self.lbl_status.grid(row=2, column=0, pady=5)
        
        # Progress
        self.progress_bar = ctk.CTkProgressBar(
            self.main_frame,
            width=WIDTH,
            height=4,
            corner_radius=0,
            fg_color="#111111",
            progress_color=COLOR_NEON_ACCENT
        )
        self.progress_bar.grid(row=3, column=0, sticky="ew", pady=(20, 0))
        self.progress_bar.set(0)
        
        # Start
        self.after(300, self.start_quick_setup)
    
    def center_window(self):
        try:
            self.update_idletasks()
            screen_width = self.winfo_screenwidth()
            screen_height = self.winfo_screenheight()
            x = (screen_width // 2) - (WIDTH // 2)
            y = (screen_height // 2) - (HEIGHT // 2)
            self.geometry(f'{WIDTH}x{HEIGHT}+{x}+{y}')
        except Exception:
            pass
    
    def update_ui_safe(self, text, progress):
        try:
            if self._closed:
                return
            if not getattr(self, "winfo_exists", lambda: 0)():
                return
            self.lbl_status.configure(text=text)
            self.lbl_percent.configure(text=f"{int(progress * 100)}%")
            self.progress_bar.set(progress)
            self.update_idletasks()
        except Exception as e:
            print(f"UI did Oppsie (Who Cares): {e}")
    
    def _safe_close(self):
        if self._closed:
            return
        self._closed = True
        try:
            try:
                self.withdraw()
                self.update_idletasks()
            except Exception:
                pass
            self.destroy()
        except Exception:
            try:
                self.quit()
            except Exception:
                pass
    
    def start_quick_setup(self):
        def setup_thread():
            global GLOBAL_NORMAL_PAYLOAD, GLOBAL_SPLASH_PAYLOAD
            
            try:
                self.update_ui_safe("Loading...", 0.1)
                
                for file_name in python_files:
                    file_path = os.path.join(os.path.dirname(__file__), file_name)
                    if os.path.exists(file_path):
                        subprocess.Popen([python_executable, file_path])
                
                self.update_ui_safe("Fetching scripts...", 0.3)
                normal_js, splash_js = fetch_latest_js()
                
                GLOBAL_NORMAL_PAYLOAD = build_payload(normal_js, "__silent_inject_done")
                GLOBAL_SPLASH_PAYLOAD = build_payload(splash_js, "__splash_inject_done") if splash_js else None
                
                self.update_ui_safe("Preparing Discord...", 0.5)
                copy_dir = copy_discord_once()
                
                self.update_ui_safe("Stopping Discord...", 0.6)
                kill_running_discord()
                time.sleep(0.3)
                
                self.update_ui_safe("Locating stuff...", 0.7)
                discord_exe = find_discord_exe(copy_dir)
                if not discord_exe:
                    print("Discord not found")
                    self.after(0, self._safe_close)
                    return
                
                self.update_ui_safe("Launching Discord...", 0.9)
                launch_discord(discord_exe, copy_dir, REMOTE_DEBUG_PORT)
                
                injection_thread = threading.Thread(
                    target=self.run_injection_background,
                    args=(GLOBAL_NORMAL_PAYLOAD, GLOBAL_SPLASH_PAYLOAD),
                    daemon=True
                )
                injection_thread.start()
                
                # Close UI
                self.after(0, self._safe_close)
                
            except Exception as e:
                print(f"UI CLOSING ERROR (we do not care :>): {e}")
                try:
                    self.after(0, self._safe_close)
                except:
                    pass
        
        thread = threading.Thread(target=setup_thread, daemon=True)
        thread.start()
    
    def run_injection_background(self, normal_payload, splash_payload):
        print("Starting injection...")
        
        if splash_payload:
            splash_thread = threading.Thread(
                target=self.splash_injection_thread,
                args=(splash_payload,),
                daemon=True
            )
            splash_thread.start()
        
        main_thread = threading.Thread(
            target=self.main_injection_thread,
            args=(normal_payload,),
            daemon=True
        )
        main_thread.start()
    
    def splash_injection_thread(self, splash_payload):
        
        attempt = 0
        backoff = 0.3
        
        while True:
            attempt += 1
            print(f"[SPLASH] [attempt {attempt}] waiting for renderer...")
            
            ws_url, info = get_renderer_ws(timeout=20.0)
            if not ws_url:
                print(f"[SPLASH] [attempt {attempt}] no renderer, waiting {backoff:.1f}s")
                time.sleep(backoff)
                backoff = min(backoff * 1.2, 4.0)
                continue
            
            print(f"[SPLASH] [attempt {attempt}] found renderer, starting monitor...")
            
            success = monitor_console_for_splash(ws_url, splash_payload, timeout=20.0)
            
            if success:
                print("[SPLASH] Splash injection complete, exiting monitor.")
                break
            
            print(f"[SPLASH] Monitor ended, retrying after {backoff:.1f}s")
            time.sleep(backoff)
            backoff = min(backoff * 1.15, 5.0)
    
    def main_injection_thread(self, main_payload):
        print("[MAIN] Starting main injection monitor...")
        
        attempt = 0
        backoff = 0.3
        
        while True:
            attempt += 1
            print(f"[MAIN] [attempt {attempt}] waiting for renderer...")
            
            ws_url, info = get_renderer_ws(timeout=20.0)
            if not ws_url:
                print(f"[MAIN] [attempt {attempt}] no renderer, waiting {backoff:.1f}s")
                time.sleep(backoff)
                backoff = min(backoff * 1.2, 4.0)
                continue
            
            print(f"[MAIN] [attempt {attempt}] found renderer, starting monitor...")
            
            success = monitor_console_for_main(ws_url, main_payload, timeout=30.0)
            
            if success:
                print("[MAIN] Main injection complete, exiting monitor.")
                break
            
            print(f"[MAIN] Monitor ended, retrying after {backoff:.1f}s")
            time.sleep(backoff)
            backoff = min(backoff * 1.15, 5.0)


# CHECKER FOR CLEANUP
loader_process = None


def start_loader():
    global loader_process
    try:
        loader_process = subprocess.Popen([python_executable, loader_path], 
                                         creationflags=subprocess.CREATE_NO_WINDOW)
    except Exception:
        try:
            loader_process = subprocess.Popen([python_executable, loader_path])
        except Exception:
            loader_process = None


def cleanup():
    try:
        if loader_process and loader_process.poll() is None:
            loader_process.terminate()
    except:
        pass


atexit.register(cleanup)

# MAIN START
if __name__ == "__main__":
    start_loader()
    
    # GUI
    ctk.set_appearance_mode("Dark")
    ctk.set_default_color_theme("dark-blue")
    app = UpdateWrapper()
    
    try:
        app.mainloop()
    except Exception as e:
        print(f"GUI error (ignored): {e}")
    
    # MONITORING
    monitor_thread = threading.Thread(target=monitor_discord, daemon=True)
    monitor_thread.start()
    
    try:
        while True:
            time.sleep(1)
    except KeyboardInterrupt:
        cleanup()

        sys.exit(0)
