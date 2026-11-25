"""Open the WoW Forever tracker from anywhere on this PC (Start Menu / Desktop shortcut).

  launch.pyw            start server.py hidden if it is not already running, then open the page
  launch.pyw --server   only make sure the server is running (for a sign-in shortcut)
  launch.pyw --stop     stop the hidden server

Run it with pythonw so no console window appears. install-shortcuts.ps1 creates the shortcuts.
The server only listens on 127.0.0.1 and writes its log to server.log in this folder.
"""
import ctypes
import os
import subprocess
import sys
import time
import urllib.request
import webbrowser

ROOT = os.path.dirname(os.path.abspath(__file__))
PORT = 8765
URL = f"http://127.0.0.1:{PORT}/"
LOG = os.path.join(ROOT, "server.log")
TITLE = "WoW Forever Tracker"


def alert(msg):
    ctypes.windll.user32.MessageBoxW(None, msg, TITLE, 0x40)


def running():
    try:
        with urllib.request.urlopen(URL + "api/state", timeout=1.5) as r:
            return r.status == 200
    except Exception:
        return False


def start_server():
    exe = sys.executable
    if os.path.basename(exe).lower() == "python.exe":  # prefer the windowless interpreter
        w = os.path.join(os.path.dirname(exe), "pythonw.exe")
        exe = w if os.path.exists(w) else exe
    flags = 0x00000008 | 0x00000200  # DETACHED_PROCESS | CREATE_NEW_PROCESS_GROUP: outlives this launcher
    subprocess.Popen([exe, os.path.join(ROOT, "server.py"), "--port", str(PORT), "--log", LOG],
                     cwd=ROOT, creationflags=flags, close_fds=True,
                     stdin=subprocess.DEVNULL, stdout=subprocess.DEVNULL, stderr=subprocess.DEVNULL)
    for _ in range(40):
        time.sleep(0.25)
        if running():
            return True
    return False


def open_page():
    # An Edge or Chrome app window looks like a standalone program; fall back to the default browser.
    for exe in (r"C:\Program Files (x86)\Microsoft\Edge\Application\msedge.exe",
                r"C:\Program Files\Microsoft\Edge\Application\msedge.exe",
                r"C:\Program Files\Google\Chrome\Application\chrome.exe"):
        if os.path.exists(exe):
            subprocess.Popen([exe, "--app=" + URL, "--window-size=960,1080"], close_fds=True)
            return
    webbrowser.open(URL)


def stop():
    if not running():
        return alert("The tracker server is not running.")
    try:
        req = urllib.request.Request(URL + "api/shutdown", data=b"{}", method="POST")
        urllib.request.urlopen(req, timeout=3).read()
    except Exception:
        pass
    for _ in range(12):
        time.sleep(0.25)
        if not running():
            break
    else:
        return alert("This server is an older copy without a stop button. Close its console window, "
                     "or sign out and back in. The next launch starts the new one.")
    alert("Tracker server stopped. Your progress is saved in state.json.")


def main():
    args = sys.argv[1:]
    if "--stop" in args:
        return stop()
    if not running() and not start_server():
        return alert(f"The tracker server did not start. See {LOG}.\n"
                     f"Port {PORT} may be in use by another program.")
    if "--server" not in args:
        open_page()


if __name__ == "__main__":
    main()
