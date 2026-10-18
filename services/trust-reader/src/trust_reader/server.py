"""HTTP server for the trust reader.

Loopback binds without a token. Any other host requires TRUST_READER_TOKEN.
TRUST_READER_REQUIRE_OCR=1 refuses to start unless tesseract and pdftotext exist.
"""

from __future__ import annotations

import json
import os
import shutil
from http.server import BaseHTTPRequestHandler, ThreadingHTTPServer

from trust_reader import CONTRACT_VERSION, READER_NAME
from trust_reader.read import read_base64


def ocr_tools() -> dict[str, bool]:
    return {
        "tesseract": shutil.which("tesseract") is not None,
        "pdftotext": shutil.which("pdftotext") is not None,
    }


def assert_runtime() -> None:
    host = os.environ.get("TRUST_READER_HOST", "127.0.0.1")
    token = os.environ.get("TRUST_READER_TOKEN", "").strip()
    loopback = host in {"127.0.0.1", "localhost", "::1"}
    if not loopback and not token:
        raise SystemExit("TRUST_READER_TOKEN is required when the reader is not bound to loopback")
    if os.environ.get("TRUST_READER_REQUIRE_OCR", "0") == "1":
        tools = ocr_tools()
        if not tools["tesseract"] or not tools["pdftotext"]:
            raise SystemExit("tesseract and pdftotext must be present in this runtime")


class TrustReaderHandler(BaseHTTPRequestHandler):
    def do_GET(self) -> None:  # noqa: N802
        if self.path.split("?", 1)[0] != "/health":
            self._send(404, {"error": "not_found"})
            return
        self._send(200, {
            "ok": True,
            "reader": READER_NAME,
            "contractVersion": CONTRACT_VERSION,
            "ocr": ocr_tools(),
        })

    def _authorized(self) -> bool:
        expected = os.environ.get("TRUST_READER_TOKEN", "").strip()
        if not expected:
            return True
        return self.headers.get("Authorization", "") == f"Bearer {expected}"

    def do_POST(self) -> None:  # noqa: N802
        if self.path.split("?", 1)[0] != "/v1/read":
            self._send(404, {"error": "not_found"})
            return
        if not self._authorized():
            self._send(401, {"error": "unauthorized"})
            return
        length = int(self.headers.get("Content-Length") or "0")
        if length <= 0 or length > 30 * 1024 * 1024:
            self._send(400, {"error": "invalid_body"})
            return
        try:
            payload = json.loads(self.rfile.read(length).decode("utf-8"))
        except (UnicodeDecodeError, json.JSONDecodeError):
            self._send(400, {"error": "invalid_body"})
            return
        if not isinstance(payload, dict):
            self._send(400, {"error": "invalid_body"})
            return
        self._send(200, read_base64(payload))

    def log_message(self, format: str, *args: object) -> None:
        return

    def _send(self, status: int, body: dict) -> None:
        encoded = json.dumps(body).encode("utf-8")
        self.send_response(status)
        self.send_header("Content-Type", "application/json")
        self.send_header("Content-Length", str(len(encoded)))
        self.end_headers()
        self.wfile.write(encoded)


def serve(host: str | None = None, port: int | None = None) -> None:
    if host is None and port is None:
        assert_runtime()
    bind_host = host or os.environ.get("TRUST_READER_HOST", "127.0.0.1")
    bind_port = port if port is not None else int(os.environ.get("TRUST_READER_PORT", "4078"))
    server = ThreadingHTTPServer((bind_host, bind_port), TrustReaderHandler)
    print(f"trust reader listening on http://{bind_host}:{bind_port}", flush=True)
    server.serve_forever()
