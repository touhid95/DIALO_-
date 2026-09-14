import responses

from apollo_client import ApolloClient
from endpoints import (
    PEOPLE_PHONE_ENRICHMENT_STATUS_ENDPOINT,
    WEBHOOK_RESULT_SHOW_ENDPOINT,
    WEBHOOK_RESULT_BY_ID_ENDPOINT,
)
from monitor import (
    parse_enrichment_status, check_phone_enrichment_status,
    extract_webhook_payload, normalize_phones, fetch_webhook_result_show,
    fetch_webhook_result,
)


def test_parse_enrichment_status_completed_with_phones():
    body = {
        "status": "completed_with_phone",
        "people": [{"id": "p1", "phone_numbers": [
            {"raw_number": "+1 555", "sanitized_number": "+1555", "type_cd": "mobile", "status_cd": "verified"}
        ]}],
    }
    status = parse_enrichment_status("p1", body)
    assert status.complete is True
    assert status.state == "completed_with_phone"
    assert len(status.phone_numbers) == 1


def test_parse_enrichment_status_pending():
    body = {"status": "processing", "retry_after_seconds": 30}
    status = parse_enrichment_status("p1", body)
    assert status.complete is False
    assert status.retry_after_seconds == 30


def test_parse_enrichment_status_missing_status_key_but_has_phones():
    """Apollo sometimes omits an explicit status but the phones are already there."""
    body = {"phone_numbers": [{"raw_number": "+1 555", "sanitized_number": "+1555"}]}
    status = parse_enrichment_status("p1", body)
    assert status.complete is True
    assert status.state == "unknown"


@responses.activate
def test_check_phone_enrichment_status_http_error():
    responses.add(responses.GET, PEOPLE_PHONE_ENRICHMENT_STATUS_ENDPOINT,
                   json={"error": "not found"}, status=404)
    client = ApolloClient("k")
    status = check_phone_enrichment_status(client, "p404")
    assert status.state == "http_404"
    assert status.complete is False


def test_extract_webhook_payload_nested_webhook_result():
    body = {"webhook_result": {"people": [{"id": "p1", "phone_numbers": []}]}}
    people = extract_webhook_payload(body)
    assert len(people) == 1
    assert people[0]["id"] == "p1"


def test_extract_webhook_payload_flat_people_no_wrapper():
    body = {"people": [{"id": "p2"}]}
    people = extract_webhook_payload(body)
    assert people[0]["id"] == "p2"


def test_extract_webhook_payload_list_of_wrapped_results():
    body = [
        {"webhook_result": {"people": [{"id": "p1"}]}},
        {"webhook_result": {"people": [{"id": "p2"}]}},
    ]
    people = extract_webhook_payload(body)
    ids = {p["id"] for p in people}
    assert ids == {"p1", "p2"}


def test_extract_webhook_payload_empty_or_pending():
    assert extract_webhook_payload({}) == []
    assert extract_webhook_payload({"error_code": "result_pending"}) == []


def test_normalize_phones_dedupes_nothing_but_skips_blank_numbers():
    payload = {"people": [
        {"id": "p1", "phone_numbers": [
            {"raw_number": "", "sanitized_number": ""},  # should be skipped
            {"raw_number": "+1 555", "sanitized_number": "+1555"},
        ]},
    ]}
    phones = normalize_phones(payload)
    assert len(phones) == 1
    assert phones[0]["record_id"] == "p1"


@responses.activate
def test_fetch_webhook_result_show_with_and_without_request_id():
    responses.add(responses.GET, WEBHOOK_RESULT_SHOW_ENDPOINT, json={"webhook_result": {"people": []}}, status=200)
    client = ApolloClient("k")
    code, body = fetch_webhook_result_show(client, "")
    assert code == 200
    responses.add(responses.GET, WEBHOOK_RESULT_SHOW_ENDPOINT, json={"webhook_result": {"people": [{"id": "px"}]}}, status=200)
    code, body = fetch_webhook_result_show(client, "req_123")
    assert code == 200
    assert extract_webhook_payload(body)[0]["id"] == "px"


@responses.activate
def test_fetch_webhook_result_by_id_pending():
    responses.add(responses.GET, f"{WEBHOOK_RESULT_BY_ID_ENDPOINT}/req_1",
                   json={"error_code": "result_pending", "retry_after_seconds": 5}, status=404)
    client = ApolloClient("k")
    code, body = fetch_webhook_result(client, "req_1")
    assert code == 404
    assert body["error_code"] == "result_pending"
