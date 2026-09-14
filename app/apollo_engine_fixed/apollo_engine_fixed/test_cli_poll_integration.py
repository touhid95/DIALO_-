import json
import responses

import cli_dispatch
from config import ApolloConfig
from endpoints import WEBHOOK_RESULT_BY_ID_ENDPOINT


def make_cfg(tmp_path):
    return ApolloConfig(
        apollo_api_key="k",
        poll_interval_seconds=1,
        poll_max_wait_seconds=5,
    )


@responses.activate
def test_poll_should_wait_through_pending_then_resolve(tmp_path, monkeypatch):
    """
    Synthetic scenario: Apollo returns a 404 'result_pending' JSON body twice,
    then a 200 with the resolved phone number. cmd_poll's own logic explicitly
    checks `isinstance(body, dict) and body.get("error_code") == "result_pending"`
    to know it should sleep and retry -- so it SHOULD survive the two pending
    responses and pick up the final resolved result.
    """
    # point storage at tmp_path
    import store
    monkeypatch.setattr(store, "REQUESTS_FILE", tmp_path / "enrichment_requests.jsonl")
    monkeypatch.setattr(store, "PHONES_CSV", tmp_path / "phones_resolved.csv")
    monkeypatch.setattr(store, "PHONES_JSONL", tmp_path / "phones_resolved.jsonl")
    monkeypatch.setattr(cli_dispatch, "REQUESTS_FILE", store.REQUESTS_FILE)
    monkeypatch.setattr(cli_dispatch, "PHONES_CSV", store.PHONES_CSV)
    monkeypatch.setattr(cli_dispatch, "PHONES_JSONL", store.PHONES_JSONL)

    store.append_jsonl(store.REQUESTS_FILE, {
        "strategy": "match", "record_id": "p1", "request_id": "req_1",
        "first_name": "Ada", "last_name": "Lovelace",
    })

    url = f"{WEBHOOK_RESULT_BY_ID_ENDPOINT}/req_1"
    responses.add(responses.GET, url,
                   json={"error_code": "result_pending", "retry_after_seconds": 0}, status=404)
    responses.add(responses.GET, url,
                   json={"error_code": "result_pending", "retry_after_seconds": 0}, status=404)
    responses.add(responses.GET, url, json={
        "webhook_result": {"people": [{"id": "p1", "phone_numbers": [
            {"raw_number": "+1 512 555 0100", "sanitized_number": "+15125550100",
             "type_cd": "mobile", "status_cd": "verified"}
        ]}]}
    }, status=200)

    cfg = make_cfg(tmp_path)
    monkeypatch.setattr(cli_dispatch.time, "sleep", lambda s: None)
    rc = cli_dispatch.cmd_poll(cfg)
    assert rc == 0

    # The bug: because client.get() returns raw text (not a dict) on 4xx,
    # `isinstance(body, dict)` is always False for the pending checks, so
    # cmd_poll gives up on the FIRST pending response instead of retrying.
    assert len(responses.calls) == 3, (
        f"expected all 3 responses to be consumed (2 pending + 1 resolved), "
        f"but only {len(responses.calls)} GET(s) were made -- cmd_poll bailed early"
    )
    assert store.PHONES_CSV.exists(), "phone should have been resolved and written to CSV"
