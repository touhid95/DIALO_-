"""STEP 3 - CALLBACK MONITORING (the async receiver).

Two independent pull paths replace a fragile single webhook receiver:

  status  GET /api/v1/people/phone_enrichment_status
          Queries a target person id to learn if Apollo's asynchronous phone
          waterfall routing finished fetching a direct dial / mobile number.

  webhook GET /api/v1/webhook_result/show   (optionally ?request_id=...)
          Pulls historical payloads captured by the server webhook pipeline if
          the live callback was missed or the receiver went down.

Both parsers are tolerant to Apollo's abridged / masked responses. Any
recovered phone_numbers are normalized and persisted to phones_resolved.*.
"""

from dataclasses import dataclass, field

from apollo_client import ApolloClient
from config import ApolloConfig
from endpoints import (
    PEOPLE_PHONE_ENRICHMENT_STATUS_ENDPOINT,
    WEBHOOK_RESULT_BY_ID_ENDPOINT,
    WEBHOOK_RESULT_SHOW_ENDPOINT,
)
from store import PHONES_JSONL, append_jsonl, write_phones

COMPLETED_FLAGS = ("success", "completed", "completed_with_phone", "done", "enriched")
PENDING_FLAGS = ("pending", "in_progress", "queued", "processing", "running")


@dataclass
class EnrichmentStatus:
    person_id: str = ""
    state: str = "unknown"
    complete: bool = False
    retry_after_seconds: int = 15
    phone_numbers: list = field(default_factory=list)
    raw: dict = field(default_factory=dict)


def normalize_phones(payload: dict) -> list:
    phones = []
    for person in payload.get("people") or []:
        for phone in person.get("phone_numbers") or []:
            if phone.get("raw_number") or phone.get("sanitized_number"):
                phones.append({
                    "record_id": person.get("id"),
                    "raw_number": phone.get("raw_number"),
                    "sanitized_number": phone.get("sanitized_number"),
                    "type_cd": phone.get("type_cd") or phone.get("type"),
                    "status_cd": phone.get("status_cd") or phone.get("status"),
                })
    for phone in payload.get("phone_numbers") or []:
        if phone.get("raw_number") or phone.get("sanitized_number"):
            phones.append({
                "record_id": payload.get("id") or payload.get("person_id"),
                "raw_number": phone.get("raw_number"),
                "sanitized_number": phone.get("sanitized_number"),
                "type_cd": phone.get("type_cd") or phone.get("type"),
                "status_cd": phone.get("status_cd") or phone.get("status"),
            })
    return phones


def parse_enrichment_status(person_id: str, body) -> EnrichmentStatus:
    state = "unknown"
    for key in ("status", "status_cd", "enrichment_status", "waterfall_status", "state"):
        value = (body or {}).get(key)
        if value:
            state = str(value).lower()
            break
    phone_numbers = normalize_phones(body or {})
    complete = state in COMPLETED_FLAGS or bool(phone_numbers)
    reray = (body or {}).get("retry_after_seconds")
    return EnrichmentStatus(
        person_id=person_id,
        state=state,
        complete=complete,
        retry_after_seconds=int(reray) if reray else 15,
        phone_numbers=phone_numbers,
        raw=body,
    )


def check_phone_enrichment_status(client: ApolloClient, person_id: str):
    code, body = client.get(
        PEOPLE_PHONE_ENRICHMENT_STATUS_ENDPOINT, {"person_id": person_id}
    )
    if code >= 400:
        return EnrichmentStatus(person_id=person_id, state=f"http_{code}", raw=body)
    return parse_enrichment_status(person_id, body)


def fetch_webhook_result_show(client: ApolloClient, request_id: str = ""):
    params = {"request_id": request_id} if request_id else None
    code, body = client.get(WEBHOOK_RESULT_SHOW_ENDPOINT, params)
    return code, body


def fetch_webhook_result(client: ApolloClient, request_id: str):
    return client.get(f"{WEBHOOK_RESULT_BY_ID_ENDPOINT}/{request_id}")


def extract_webhook_payload(body) -> list:
    payload = body.get("webhook_result") if isinstance(body, dict) else None
    if not payload:
        payload = body
    people = payload.get("people") if isinstance(payload, dict) else None
    if isinstance(people, list) and people:
        return people
    if isinstance(body, list):
        people = []
        for item in body:
            people.extend((item.get("webhook_result") or item).get("people") or [])
        return people
    return []


def persist_enrichment_status(status: EnrichmentStatus, source: str):
    entry = {
        "person_id": status.person_id,
        "source": source,
        "state": status.state,
        "complete": status.complete,
        "phones": status.phone_numbers,
        "raw": status.raw,
    }
    append_jsonl(PHONES_JSONL, entry)
    if status.phone_numbers:
        write_phones([entry])
    return entry


def poll_enrichment_statuses(client: ApolloClient, cfg: ApolloConfig, person_ids):
    results = []
    for person_id in person_ids:
        status = check_phone_enrichment_status(client, person_id)
        if status.complete:
            persist_enrichment_status(status, "phone_enrichment_status")
        results.append(status)
    return results