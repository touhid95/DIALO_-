import csv
import responses

import cli_dispatch
import store
from config import ApolloConfig
from endpoints import CONTACTS_SEARCH_ENDPOINT, PEOPLE_MATCH_ENDPOINT


@responses.activate
def test_full_discover_flow_harvests_and_dispatches(tmp_path, monkeypatch):
    for mod in (store, cli_dispatch):
        monkeypatch.setattr(mod, "REQUESTS_FILE", tmp_path / "enrichment_requests.jsonl")
        monkeypatch.setattr(mod, "PHONES_CSV", tmp_path / "phones_resolved.csv")
        monkeypatch.setattr(mod, "PHONES_JSONL", tmp_path / "phones_resolved.jsonl")
        monkeypatch.setattr(mod, "TARGETS_CSV", tmp_path / "targets_filtered.csv")

    contacts = [
        {  # already has a phone -> harvested for free, no dispatch
            "id": "c1", "person_id": "p1", "first_name": "Ada", "last_name": "Lovelace",
            "title": "VP Sales", "organization_name": "Acme Corp", "has_direct_phone": "Yes",
            "account": {"name": "Acme Corp", "primary_domain": "acme.com"},
            "city": "Austin", "state": "TX", "country": "US",
            "phone_numbers": [{"raw_number": "+1 512 555 0100", "sanitized_number": "+15125550100",
                                "type_cd": "mobile", "status_cd": "verified"}],
        },
        {  # needs enrichment -> dispatched via match
            "id": "c2", "person_id": "p2", "first_name": "Grace", "last_name": "Hopper",
            "title": "CTO", "organization_name": "Acme Corp", "has_direct_phone": "Yes",
            "account": {"name": "Acme Corp", "primary_domain": "acme.com"},
            "city": "Austin", "state": "TX", "country": "US",
            "phone_numbers": [],
        },
    ]
    responses.add(responses.POST, CONTACTS_SEARCH_ENDPOINT,
                   json={"contacts": contacts, "pagination": {"total_entries": 2}}, status=200)
    responses.add(responses.POST, PEOPLE_MATCH_ENDPOINT,
                   json={"person": {"match_confidence": "high"}, "request_id": "req_p2"}, status=200)

    cfg = ApolloConfig(
        apollo_api_key="k", webhook_url="https://example.com/webhooks/apollo",
        trigger_mode="match", client_locations=["Austin"],
        q_organization_domains_list=["acme.com"], request_interval_seconds=0,
    )
    rc = cli_dispatch.cmd_discover(cfg)
    assert rc == 0

    # harvested phone went straight to phones_resolved.csv (0 credits)
    with store.PHONES_CSV.open() as f:
        rows = list(csv.DictReader(f))
    assert {r["record_id"] for r in rows} == {"p1"}

    # p2 was dispatched and logged to the request queue
    requests_logged = store.read_records(store.REQUESTS_FILE)
    assert len(requests_logged) == 1
    assert requests_logged[0]["record_id"] == "p2"
    assert requests_logged[0]["request_id"] == "req_p2"

    # p2 (needs enrich) shows up in targets_filtered.csv, p1 does not
    with store.TARGETS_CSV.open() as f:
        target_rows = list(csv.DictReader(f))
    assert {r["person_id"] for r in target_rows} == {"p2"}


@responses.activate
def test_discover_blocks_on_placeholder_webhook_url():
    cfg = ApolloConfig(apollo_api_key="k", webhook_url="https://yourdomain.com/webhooks/apollo")
    rc = cli_dispatch.cmd_discover(cfg)
    assert rc == 2
    assert len(responses.calls) == 0  # never even hits the API


def test_discover_blocks_without_api_key():
    cfg = ApolloConfig(apollo_api_key="")
    rc = cli_dispatch.cmd_discover(cfg)
    assert rc == 2
