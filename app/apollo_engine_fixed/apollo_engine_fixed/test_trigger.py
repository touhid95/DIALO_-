import responses

from apollo_client import ApolloClient
from config import ApolloConfig
from endpoints import PEOPLE_MATCH_ENDPOINT, SEQUENCE_ADD_ENDPOINT, AGENTS_TASK_ENDPOINT
from lookup import ContactRecord
from trigger import trigger_batch, build_match_payload, build_sequence_payload, build_agent_payload


def record(pid="p1", cid="c1"):
    return ContactRecord(person_id=pid, contact_id=cid, first_name="Ada",
                          last_name="Lovelace", title="VP", organization="Acme")


@responses.activate
def test_trigger_batch_match_mode_dispatches_each_record(monkeypatch):
    cfg = ApolloConfig(apollo_api_key="k", trigger_mode="match",
                        webhook_url="https://example.com/webhooks/apollo",
                        request_interval_seconds=0)
    responses.add(responses.POST, PEOPLE_MATCH_ENDPOINT,
                   json={"person": {"match_confidence": "high"}, "request_id": "req_1"}, status=200)
    responses.add(responses.POST, PEOPLE_MATCH_ENDPOINT,
                   json={"person": {"match_confidence": "high"}, "request_id": "req_2"}, status=200)
    client = ApolloClient(cfg.apollo_api_key)
    records = [record("p1", "c1"), record("p2", "c2")]
    entries = trigger_batch(client, cfg, records)
    assert [e["request_id"] for e in entries] == ["req_1", "req_2"]
    assert all(e["strategy"] == "match" for e in entries)


@responses.activate
def test_trigger_batch_sequence_mode(monkeypatch):
    cfg = ApolloConfig(apollo_api_key="k", trigger_mode="sequence",
                        sequence_id="seq_9", send_email_from_email_account_id="acct_1",
                        request_interval_seconds=0)
    endpoint = f"{SEQUENCE_ADD_ENDPOINT}/seq_9/add_contact_ids"
    responses.add(responses.POST, endpoint,
                   json={"emailer_campaign": {"id": "camp_1"}, "request_id": "req_seq_1"}, status=200)
    client = ApolloClient(cfg.apollo_api_key)
    entries = trigger_batch(client, cfg, [record()])
    assert entries[0]["campaign_id"] == "camp_1"
    assert entries[0]["strategy"] == "sequence"


@responses.activate
def test_trigger_batch_agent_mode_single_call_for_all_records():
    cfg = ApolloConfig(apollo_api_key="k", trigger_mode="agent", agent_id="agent_1")
    responses.add(responses.POST, AGENTS_TASK_ENDPOINT, json={"task_id": "task_1"}, status=200)
    client = ApolloClient(cfg.apollo_api_key)
    records = [record("p1", "c1"), record("p2", "c2"), record("p3", "c3")]
    entries = trigger_batch(client, cfg, records)
    assert len(entries) == 3
    assert all(e["task_id"] == "task_1" for e in entries)
    assert len(responses.calls) == 1  # bulk single dispatch, not one call per record


def test_build_match_payload_only_sets_webhook_when_reveal_enabled():
    cfg = ApolloConfig(apollo_api_key="k", webhook_url="https://x", reveal_phone_number=False, run_waterfall_phone=False)
    payload = build_match_payload(cfg, record())
    assert "webhook_url" not in payload

    cfg2 = ApolloConfig(apollo_api_key="k", webhook_url="https://x", reveal_phone_number=True)
    payload2 = build_match_payload(cfg2, record())
    assert payload2["webhook_url"] == "https://x"


def test_build_agent_payload_filters_falsy_contact_ids():
    cfg = ApolloConfig(apollo_api_key="k", agent_id="a1", webhook_url="https://x")
    records = [record("p1", "c1"), ContactRecord(person_id="p2", contact_id="")]
    payload = build_agent_payload(cfg, records)
    assert payload["task_input"]["contact_ids"] == ["c1"]
    assert payload["task_input"]["person_ids"] == ["p1", "p2"]
