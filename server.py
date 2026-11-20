"""Local server for the WoW Forever tracker.

Serves this folder at http://127.0.0.1:8765 and saves the page's state to state.json.
  GET  /api/state            -> {"character": {...}, "progress": {...}}
  POST /api/state/<doc>      -> merge a JSON patch into that doc; "" or null removes a key
Run:  python server.py   (optional: --port 8765)
Only binds to 127.0.0.1, so nothing outside this PC can reach it.
"""
import argparse
import json
import os
import tempfile
import threading
from http.server import SimpleHTTPRequestHandler, ThreadingHTTPServer

ROOT = os.path.dirname(os.path.abspath(__file__))
STATE = os.path.join(ROOT, "state.json")
DOCS = ("character", "progress")
LOCK = threading.Lock()


def load():
    try:
        with open(STATE, encoding="utf-8") as f:
            data = json.load(f)
    except FileNotFoundError:
        data = {}
    for d in DOCS:
        data.setdefault(d, {})
    return data


def save(data):
    # Write to a temp file then replace, so a crash never leaves a half-written state.json.
    fd, tmp = tempfile.mkstemp(dir=ROOT, prefix=".state-", suffix=".json")
    with os.fdopen(fd, "w", encoding="utf-8") as f:
        json.dump(data, f, indent=2, ensure_ascii=False)
        f.write("\n")
    os.replace(tmp, STATE)


class Handler(SimpleHTTPRequestHandler):
    def __init__(self, *a, **kw):
        super().__init__(*a, directory=ROOT, **kw)

    def end_headers(self):
        self.send_header("Cache-Control", "no-store")
        super().end_headers()

    def _json(self, code, obj):
        body = json.dumps(obj).encode("utf-8")
        self.send_response(code)
        self.send_header("Content-Type", "application/json")
        self.send_header("Content-Length", str(len(body)))
        self.end_headers()
        self.wfile.write(body)

    def do_GET(self):
        if self.path == "/api/state":
            with LOCK:
                return self._json(200, load())
        if "/." in self.path:  # hide the temp files save() writes
            return self._json(404, {"error": "not found"})
        return super().do_GET()

    def do_POST(self):
        parts = self.path.strip("/").split("/")
        if len(parts) != 3 or parts[:2] != ["api", "state"] or parts[2] not in DOCS:
            return self._json(404, {"error": "unknown endpoint"})
        try:
            n = int(self.headers.get("Content-Length") or 0)
            patch = json.loads(self.rfile.read(n) or b"{}")
            if not isinstance(patch, dict):
                raise ValueError("patch must be an object")
        except Exception as e:  # bad JSON from the page
            return self._json(400, {"error": str(e)})
        with LOCK:
            data = load()
            doc = data[parts[2]]
            for k, v in patch.items():
                if v in ("", None):
                    doc.pop(k, None)
                else:
                    doc[k] = v
            save(data)
        return self._json(200, {"ok": True})

    def log_message(self, fmt, *args):
        if self.command == "POST" or (args and str(args[1]).startswith(("4", "5"))):
            super().log_message(fmt, *args)


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("--port", type=int, default=8765)
    port = ap.parse_args().port
    srv = ThreadingHTTPServer(("127.0.0.1", port), Handler)
    print(f"Tracker: http://127.0.0.1:{port}/  (saving to {STATE})", flush=True)
    try:
        srv.serve_forever()
    except KeyboardInterrupt:
        pass


if __name__ == "__main__":
    main()
