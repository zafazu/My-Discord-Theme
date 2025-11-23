#!/usr/bin/env python3
"""
dv_settings_table_with_transparency.py

Extends the sniffer + settings table to actually change window transparency
for top-level windows whose title contains "Discord" (Windows only).
"""

import json
import re
import time
import threading
import requests
import sys
import ctypes

try:
    import websocket
    from websocket import create_connection
    try:
        from websocket._exceptions import WebSocketTimeoutException, WebSocketConnectionClosedException
    except Exception:
        WebSocketTimeoutException = Exception
        WebSocketConnectionClosedException = Exception
except Exception:
    print("Install dependency: pip install websocket-client")
    sys.exit(1)

# Config
REMOTE_DEBUG_PORT = 9222
DEVTOOLS_JSON = f"http://127.0.0.1:{REMOTE_DEBUG_PORT}/json"
TARGET_MARK = "[DV_SETTINGS]"
POLL_INTERVAL = 1.0
VERBOSE = False

# Globals
SETTINGS = {}
HANDLERS = {}
_lock = threading.Lock()

# Parsing helpers (same as before)
PAIR_RE = re.compile(r'([A-Za-z0-9_.-]+)\s*=\s*(".*?"|\'.*?\'|[^,;}\n]+)', re.DOTALL)
JSON_OBJ_RE = re.compile(r'(\{[\s\S]*\})')

def _coerce_value(s: str):
    s = s.strip()
    if not s:
        return ""
    if (s[0] == s[-1]) and s[0] in ('"', "'"):
        return s[1:-1]
    low = s.lower()
    if low == "true": return True
    if low == "false": return False
    try:
        return int(s)
    except Exception:
        pass
    try:
        return float(s)
    except Exception:
        pass
    return s

def try_parse_json_from_text(text: str):
    if not text:
        return None
    m = JSON_OBJ_RE.search(text)
    if not m:
        return None
    candidate = m.group(1)
    try1 = candidate.replace("'", '"')
    try2 = re.sub(r'([{,]\s*)([A-Za-z0-9_.$-]+)\s*:', r'\1"\2":', try1)
    for c in (candidate, try1, try2):
        try:
            obj = json.loads(c)
            return obj
        except Exception:
            continue
    return None

def parse_key_value_pairs(payload: str):
    if not payload:
        return None
    found = PAIR_RE.findall(payload)
    if not found:
        m = re.search(r'([A-Za-z0-9_.-]+)\s*=\s*(.+)', payload)
        if m:
            k, v = m.group(1), m.group(2)
            return {k: _coerce_value(v)}
        return None
    out = {}
    for k, v in found:
        out[k] = _coerce_value(v)
    return out

def extract_settings_from_text(text: str):
    if not text or TARGET_MARK.lower() not in text.lower():
        return None
    j = try_parse_json_from_text(text)
    if isinstance(j, dict):
        if "DV_CHANGE" in j and isinstance(j["DV_CHANGE"], dict):
            return j["DV_CHANGE"]
        return j
    after = re.split(re.escape(TARGET_MARK), text, flags=re.IGNORECASE, maxsplit=1)
    payload = after[1] if len(after) > 1 else text
    kv = parse_key_value_pairs(payload)
    return kv

# Handlers registry
def register_handler(key, func, namespace=None):
    if namespace:
        HANDLERS[(namespace, key)] = func
    else:
        HANDLERS[key] = func

def _get_handler_for_key(key, namespace=None):
    if namespace and (namespace, key) in HANDLERS:
        return HANDLERS[(namespace, key)]
    return HANDLERS.get(key, None)

def pretty_print_settings(s: dict):
    print("=== SETTINGS TABLE ===")
    print(json.dumps(s, indent=2, sort_keys=True))
    print("======================")

def apply_parsed_settings(parsed: dict):
    global SETTINGS
    if not parsed:
        return False
    with _lock:
        changes = []
        for k, v in parsed.items():
            if isinstance(v, dict):
                dst = SETTINGS.setdefault(k, {})
                if not isinstance(dst, dict):
                    SETTINGS[k] = dst = {}
                for subk, subv in v.items():
                    old = dst.get(subk)
                    if old != subv:
                        dst[subk] = subv
                        changes.append(((k, subk), old, subv))
            else:
                old = SETTINGS.get(k)
                if old != v:
                    SETTINGS[k] = v
                    changes.append(((None, k), old, v))
        if not changes:
            return False
        pretty_print_settings(SETTINGS)
        for (ns, key), old, new in changes:
            handler = None
            if ns:
                handler = _get_handler_for_key(key, namespace=ns)
            if not handler:
                handler = _get_handler_for_key(key)
            dotted = f"{ns}.{key}" if ns else key
            if not handler:
                handler = _get_handler_for_key(dotted)
            try:
                if handler:
                    handler(new, old, (ns, key))
                else:
                    if VERBOSE:
                        print(f"No handler for {dotted}, change {old!r} -> {new!r}")
            except Exception as e:
                print(f"Handler error for {dotted}: {e}")
        return True

# ------------------ Windows window-opacity functions ------------------
IS_WINDOWS = sys.platform.startswith("win")

if IS_WINDOWS:
    user32 = ctypes.windll.user32
    gdi32 = ctypes.windll.gdi32
    SetWindowLong = user32.SetWindowLongW
    GetWindowLong = user32.GetWindowLongW
    SetLayeredWindowAttributes = user32.SetLayeredWindowAttributes
    EnumWindows = user32.EnumWindows
    GetWindowText = user32.GetWindowTextW
    GetWindowTextLength = user32.GetWindowTextLengthW
    IsWindowVisible = user32.IsWindowVisible
    GWL_EXSTYLE = -20
    WS_EX_LAYERED = 0x80000
    LWA_ALPHA = 0x2

    def _enum_windows_callback(hwnd, lparam):
        buf_len = GetWindowTextLength(hwnd) + 1
        if buf_len <= 1:
            return True  # continue
        buf = ctypes.create_unicode_buffer(buf_len)
        GetWindowText(hwnd, buf, buf_len)
        title = buf.value or ""
        if not title:
            return True
        if not IsWindowVisible(hwnd):
            return True
        # case-sensitive search for 'Discord' in title
        if "Discord" in title:
            lst = ctypes.cast(lparam, ctypes.POINTER(ctypes.py_object)).contents.value
            lst.append((hwnd, title))
        return True

    EnumWindowsProc = ctypes.WINFUNCTYPE(ctypes.c_bool, ctypes.c_void_p, ctypes.c_void_p)

    def find_discord_windows():
        found = []
        cb = EnumWindowsProc(_enum_windows_callback)
        p = ctypes.py_object(found)
        user32.EnumWindows(cb, ctypes.byref(p))
        return found

    def set_window_opacity_hwnd(hwnd, percent):
        """Set layered alpha for a HWND. percent is 0-100 (0 = transparent, 100 = opaque)."""
        try:
            if percent < 0: percent = 0
            if percent > 100: percent = 100
            alpha = int(percent * 255 / 100)  # 0..255
            ex = GetWindowLong(hwnd, GWL_EXSTYLE)
            if not (ex & WS_EX_LAYERED):
                SetWindowLong(hwnd, GWL_EXSTYLE, ex | WS_EX_LAYERED)
            res = SetLayeredWindowAttributes(hwnd, 0, alpha, LWA_ALPHA)
            if res == 0:
                # failure (0 means FALSE). retrieve last error
                err = ctypes.GetLastError()
                if VERBOSE:
                    print(f"SetLayeredWindowAttributes failed (err={err}) for hwnd={hwnd}")
                return False
            return True
        except Exception as e:
            if VERBOSE:
                print("set_window_opacity_hwnd error:", e)
            return False

    def apply_window_transparency(percent):
        wins = find_discord_windows()
        if not wins:
            print("No Discord windows found to apply transparency.")
            return False
        ok_any = False
        for hwnd, title in wins:
            success = set_window_opacity_hwnd(hwnd, percent)
            print(f"Applied opacity {percent}% to hwnd={hwnd} title=\"{title}\" -> {success}")
            ok_any = ok_any or success
        return ok_any
else:
    # Stubs for non-windows platforms
    def find_discord_windows():
        return []

    def apply_window_transparency(percent):
        print("Window transparency handler is Windows-only. Ignored on this OS.")
        return False

# ------------------ sniffer: get renderer ws and monitor console ------------------
def get_renderer_ws():
    try:
        r = requests.get(DEVTOOLS_JSON, timeout=3)
        r.raise_for_status()
        targets = r.json()
    except Exception:
        return None
    for t in targets:
        url = (t.get("url") or "").lower()
        if url.startswith("https://discord.com/app") or url.startswith("https://discord.com/channels"):
            return t.get("webSocketDebuggerUrl")
    for t in targets:
        url = (t.get("url") or "").lower()
        if "discord" in url and url.startswith("https://"):
            return t.get("webSocketDebuggerUrl")
    for t in targets:
        url = (t.get("url") or "").lower()
        if url.startswith("devtools://"):
            continue
        if t.get("type", "").lower() == "page" and t.get("webSocketDebuggerUrl"):
            return t.get("webSocketDebuggerUrl")
    for t in targets:
        if t.get("webSocketDebuggerUrl") and not (t.get("url") or "").startswith("devtools://"):
            return t.get("webSocketDebuggerUrl")
    if targets:
        return targets[0].get("webSocketDebuggerUrl")
    return None

def extract_console_text(obj):
    pieces = []
    params = obj.get("params") or {}
    args = params.get("args") or []
    if isinstance(args, list):
        for a in args:
            if isinstance(a, dict):
                # Skip metadata fields like "type"
                for k in ("value", "description"):
                    v = a.get(k)
                    if isinstance(v, str) and v:
                        pieces.append(v)
                preview = a.get("preview") or {}
                if isinstance(preview, dict):
                    d = preview.get("description")
                    if isinstance(d, str) and d:
                        pieces.append(d)
    msg = params.get("message") or {}
    if isinstance(msg, dict):
        # Skip metadata fields like "level", "source"
        for k in ("text", "url"):
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
        # Skip metadata fields
        for k in ("text",):
            v = entry.get(k)
            if isinstance(v, str) and v:
                pieces.append(v)
    res = obj.get("result") or {}
    if isinstance(res, dict):
        for k in ("value","description","text"):
            v = res.get(k)
            if isinstance(v, str) and v:
                pieces.append(v)
    top = obj.get("message")
    if isinstance(top, str) and top:
        pieces.append(top)
    return " ".join(pieces).strip()

def monitor_ws(ws_url, timeout=60.0):
    try:
        ws = create_connection(ws_url, timeout=6.0)
    except Exception as e:
        if VERBOSE:
            print("connect failed:", e)
        return False
    try:
        try:
            ws.send(json.dumps({"id":1,"method":"Runtime.enable"}))
            ws.send(json.dumps({"id":2,"method":"Console.enable"}))
            ws.send(json.dumps({"id":3,"method":"Log.enable"}))
        except Exception:
            pass
        ws.settimeout(1.0)
        start = time.time()
        deadline = start + timeout if timeout else None
        while True:
            if deadline and time.time() > deadline:
                return False
            try:
                raw = ws.recv()
            except WebSocketTimeoutException:
                continue
            except WebSocketConnectionClosedException:
                return False
            except Exception:
                return False
            if not raw:
                continue
            try:
                obj = json.loads(raw)
            except Exception:
                continue
            method = obj.get("method","")
            if method not in ("Runtime.consoleAPICalled", "Console.messageAdded", "Log.entryAdded"):
                continue
            text = extract_console_text(obj)
            if not text:
                continue
            if VERBOSE:
                print("console:", text[:400])
            parsed = extract_settings_from_text(text)
            if not parsed:
                continue
            applied = apply_parsed_settings(parsed)
            if applied:
                if VERBOSE:
                    print("Applied parsed settings.")
    finally:
        try:
            ws.close()
        except:
            pass
    return False

def main_loop():
    while True:
        ws_url = get_renderer_ws()
        if not ws_url:
            if VERBOSE:
                print("no renderer found, retrying...")
            time.sleep(POLL_INTERVAL)
            continue
        if VERBOSE:
            print("monitoring:", ws_url)
        monitor_ws(ws_url, timeout=45.0)
        time.sleep(POLL_INTERVAL)

# ------------------ transparency handler and registration ------------------
def handler_window_transparency(new, old, keypath):
    # new expected as int 0..100
    try:
        percent = int(new)
    except Exception:
        print("windowTransparency handler: value not int:", new)
        return
    print(f"[HANDLER] Setting Discord window transparency to {percent}%")
    ok = apply_window_transparency(percent)
    if not ok:
        print("[HANDLER] Warning: could not apply transparency (no windows or error)")

# register handler for both plain key and dotted namespace
register_handler("windowTransparency", handler_window_transparency)
register_handler("DV_CHANGE.windowTransparency", handler_window_transparency)

# ------------------ entrypoint ------------------
if __name__ == "__main__":
    if len(sys.argv) > 1 and sys.argv[1] in ("-v","--verbose"):
        VERBOSE = True
    try:
        main_loop()
    except KeyboardInterrupt:
        print("exiting.")
        sys.exit(0)
