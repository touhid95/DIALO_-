import json

import store
from webhook_receiver import handle_payload, is_authorized


class FakeHandler:
    def __init__(self, headers):
        self.headers = headers


def test_handle_payload_writes_jsonl(tmp_path, monkeypatch):
    monkeypatch.setattr(store, "PHONES_JSONL", tmp_path / "phones_resolved.jsonl")
    import webhook_receiver
    monkeypatch.setattr(webhook_receiver, "PHONES_JSONL", store.PHONES_JSONL)

    payload = {
        "request_id": "req_1",
        "credits_consumed": 2,
        "people": [
            {"id": "p1", "status": "success", "phone_numbers": [
                {"raw_number": "+1 555", "sanitized_number": "+1555"}
            ]},
        ],
    }
    result = handle_payload(payload)
    assert result["records"] == 1
    assert result["credits_consumed"] == 2

    records = store.read_records(store.PHONES_JSONL)
    assert len(records) == 1
    assert records[0]["person_id"] == "p1"
    assert records[0]["source"] == "webhook_receiver"


def test_handle_payload_empty_people_list():
    result = handle_payload({"request_id": "r", "people": []})
    assert result["records"] == 0


def test_is_authorized_no_secret_configured_allows_all():
    handler = FakeHandler({})
    assert is_authorized(handler, "") is True


def test_is_authorized_checks_signature_header():
    handler = FakeHandler({"x-apollo-signature": "s3cr3t"})
    assert is_authorized(handler, "s3cr3t") is True
    assert is_authorized(handler, "wrong") is False


def test_is_authorized_checks_fallback_header():
    handler = FakeHandler({"x-webhook-secret": "s3cr3t"})
    assert is_authorized(handler, "s3cr3t") is True


def test_is_authorized_rejects_missing_header_when_secret_required():
    handler = FakeHandler({})
    assert is_authorized(handler, "s3cr3t") is False
