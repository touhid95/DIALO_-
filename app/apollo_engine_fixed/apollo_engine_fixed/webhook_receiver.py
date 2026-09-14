"""Apollo enrichment webhook receiver (stdlib only - no Flask dependency).

Apollo POSTs async phone-enrichment results here once the waterfall finishes.
The receiver supports the documented notification payload where each `person`
carries `phone_numbers`, plus a `request_id` and `credits_consumed`.

Fallback guarantees:
  - a missed callback can be pulled via GET /webhook_result/{request_id};
  - historical payloads can be pulled via GET /webhook_result/show;
  - waterfall completion can be checked via GET /people/phone_enrichment_status.
"""

import json
import os
import threading
from datetime import datetime, timezone
from http.server import BaseHTTPRequestHandler, ThreadingHTTPServer

from config import ApolloConfig, load_config
from store import PHONES_JSONL, append_jsonl

LOCK = threading.Lock()


def utcnow():
    return datetime.now(timezone.utc).isoformat()


def is_authorized(handler, secret: str) -> bool:
    if not secret:
        return True
    supplied = (
        handler.headers.get("x-apollo-signature", "")
        or handler.headers.get("x-webhook-secret", "")
    )
    return supplied == secret


def handle_payload(payload: dict) -> dict:
    rows = []
    for person in payload.get("people") or []:
        rows.append({
            "person_id": person.get("id"),
            "person_status": person.get("status"),
            "request_id": payload.get("request_id"),
            "phones": person.get("phone_numbers", []),
            "raw": person,
        })
    for row in rows:
        append_jsonl(PHONES_JSONL, {
            "person_id": row["person_id"],
            "source": "webhook_receiver",
            "state": "completed",
            "complete": True,
            "request_id": payload.get("request_id"),
            "credits_consumed": payload.get("credits_consumed"),
            "phones": row["phones"],
            "raw": payload,
        })
    return {
        "status": "success",
        "records": len(rows),
        "credits_consumed": payload.get("credits_consumed"),
        "arrived_at": utcnow(),
    }


class ApolloWebhookHandler(BaseHTTPRequestHandler):
    cfg = None

    def do_POST(self):
        if self.path != "/webhooks/apollo":
            self.send_response(404)
            self.end_headers()
            return
        length = int(self.headers.get("Content-Length", 0))
        raw = self.rfile.read(length) if length else b"{}"
        try:
            payload = json.loads(raw or b"{}")
        except json.JSONDecodeError:
            payload = {}

        if not is_authorized(self, self.cfg.webhook_secret):
            self._reply(401, {"status": "rejected"})
            print("[!] Webhook rejected: secret mismatch.")
            return

        with LOCK:
            result = handle_payload(payload)
        print(f"[+] Webhook received: {result['records']} record(s), "
              f"credits={result['credits_consumed']} -> {PHONES_JSONL.name}")
        self._reply(200, result)

    def _reply(self, status_code, body):
        data = json.dumps(body).encode("utf-8")
        self.send_response(status_code)
        self.send_header("Content-Type", "application/json")
        self.send_header("Content-Length", str(len(data)))
        self.end_headers()
        self.wfile.write(data)

    def log_message(self, fmt, *args):
        print(f"[webhook] {fmt % args}")


def run_server(cfg: ApolloConfig, host="0.0.0.0", port: int = 5000):
    ApolloWebhookHandler.cfg = cfg
    server = ThreadingHTTPServer((host, port), ApolloWebhookHandler)
    print(f"[*] Webhook receiver on http://{host}:{port}/webhooks/apollo")
    print(f"[*] Payloads -> {PHONES_JSONL.name} | auth shadow: "
          f"'x-apollo-signature' ({'enabled' if cfg.webhook_secret else 'disabled'})")
    try:
        server.serve_forever()
    except KeyboardInterrupt:
        server.shutdown()


if __name__ == "__main__":
    run_server(load_config(), port=int(os.getenv("WEBHOOK_PORT", "5000")))