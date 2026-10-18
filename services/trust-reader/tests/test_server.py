import base64
import io
import json
import threading
import unittest
import urllib.error
import urllib.request
from http.server import ThreadingHTTPServer

from PIL import Image

from trust_reader.server import TrustReaderHandler


def png_bytes() -> bytes:
    image = Image.new("RGB", (16, 16), (10, 20, 30))
    buffer = io.BytesIO()
    image.save(buffer, format="PNG")
    return buffer.getvalue()


class ServerTests(unittest.TestCase):
    def setUp(self):
        self.server = ThreadingHTTPServer(("127.0.0.1", 0), TrustReaderHandler)
        self.thread = threading.Thread(target=self.server.serve_forever, daemon=True)
        self.thread.start()
        self.base = f"http://127.0.0.1:{self.server.server_address[1]}"

    def tearDown(self):
        self.server.shutdown()
        self.server.server_close()

    def test_health(self):
        with urllib.request.urlopen(self.base + "/health") as response:
            body = json.loads(response.read().decode("utf-8"))
        self.assertTrue(body["ok"])
        self.assertEqual(body["reader"], "realest-trust-reader")
        self.assertIn("ocr", body)
        self.assertIn("tesseract", body["ocr"])
        self.assertIn("pdftotext", body["ocr"])

    def test_read_returns_facts_and_keeps_premium_slots_off(self):
        payload = json.dumps({
            "kind": "image",
            "mimeType": "image/png",
            "contentBase64": base64.b64encode(png_bytes()).decode("ascii"),
        }).encode("utf-8")
        request = urllib.request.Request(
            self.base + "/v1/read",
            data=payload,
            headers={"Content-Type": "application/json"},
        )
        with urllib.request.urlopen(request) as response:
            body = json.loads(response.read().decode("utf-8"))
        self.assertEqual(body["kind"], "image")
        self.assertNotIn("status", body)
        self.assertNotIn("decision", body)
        self.assertTrue(all(slot["affectsDecision"] is False for slot in body["expansions"]))
        self.assertTrue(all(slot["status"] == "unavailable" for slot in body["expansions"]))
        self.assertIsNotNone(body["image"]["dHashHex"])

    def test_read_requires_the_token_when_one_is_configured(self):
        import os
        os.environ["TRUST_READER_TOKEN"] = "prod-token"
        self.addCleanup(os.environ.pop, "TRUST_READER_TOKEN", None)
        payload = json.dumps({
            "kind": "image",
            "mimeType": "image/png",
            "contentBase64": base64.b64encode(png_bytes()).decode("ascii"),
        }).encode("utf-8")
        open_request = urllib.request.Request(self.base + "/v1/read", data=payload, headers={"Content-Type": "application/json"})
        with self.assertRaises(urllib.error.HTTPError) as caught:
            urllib.request.urlopen(open_request)
        self.assertEqual(caught.exception.code, 401)
        authed = urllib.request.Request(
            self.base + "/v1/read",
            data=payload,
            headers={"Content-Type": "application/json", "Authorization": "Bearer prod-token"},
        )
        with urllib.request.urlopen(authed) as response:
            body = json.loads(response.read().decode("utf-8"))
        self.assertEqual(body["kind"], "image")


if __name__ == "__main__":
    unittest.main()
