"""STEP 2 - MATCH & REVEAL PHASE (credit consuming).

The target ids filtered out of Step 1 (has_direct_phone == "Yes", no known
phone_numbers) are pushed into a reveal pipeline. Three dispatch strategies are
supported, selectable via TRIGGER_MODE:

  agent     POST /api/v1/agents/task        - bulk; spins up a background
                                              extraction loop over the ids.
  sequence  POST /api/v1/emailer_campaigns/{sequence_id}/add_contact_ids
                                            - pushes contact ids into an active
                                              tracking sequence that owns the
                                              phone-step lookup triggers.
  match     POST /api/v1/people/match       - direct fallback reveal; sets
                                              reveal_phone_number + waterfall
                                              flags and a webhook_url for the
                                              async result.

Every dispatch that yields a request/task/campaign id is persisted to the
enrichment request log for Step 3 monitoring.
"""

import time

from apollo_client import ApolloClient
from config import ApolloConfig
from endpoints import (
    AGENTS_TASK_ENDPOINT,
    PEOPLE_MATCH_ENDPOINT,
    SEQUENCE_ADD_ENDPOINT,
)
from store import REQUESTS_FILE, append_jsonl


def build_match_payload(cfg: ApolloConfig, record):
    payload = {
        "id": record.person_id,
        "reveal_phone_number": cfg.reveal_phone_number,
        "reveal_personal_emails": cfg.reveal_personal_emails,
        "run_waterfall_phone": cfg.run_waterfall_phone,
        "run_waterfall_email": cfg.run_waterfall_email,
    }
    if cfg.reveal_phone_number or cfg.run_waterfall_phone:
        payload["webhook_url"] = cfg.webhook_url
    return payload


def build_sequence_payload(cfg: ApolloConfig, record):
    return {
        "sequence_id": cfg.sequence_id,
        "emailer_campaign_id": cfg.sequence_id,
        "contact_ids": [record.contact_id],
        "send_email_from_email_account_id": cfg.send_email_from_email_account_id,
    }


def build_agent_payload(cfg: ApolloConfig, records):
    return {
        "agent_id": cfg.agent_id,
        "task_input": {
            "person_ids": [r.person_id for r in records],
            "contact_ids": [r.contact_id for r in records if r.contact_id],
            "reveal_phone_number": cfg.reveal_phone_number,
            "run_waterfall_phone": cfg.run_waterfall_phone,
            "webhook_url": cfg.webhook_url,
        },
    }


def dispatch_match(client: ApolloClient, cfg: ApolloConfig, record):
    data = client.post(PEOPLE_MATCH_ENDPOINT, build_match_payload(cfg, record))
    matched = data.get("person") or {}
    return {
        "strategy": "match",
        "record_id": record.person_id,
        "contact_id": record.contact_id,
        "first_name": record.first_name,
        "last_name": record.last_name,
        "title": record.title,
        "organization": record.organization,
        "match_confidence": matched.get("match_confidence"),
        "request_id": data.get("request_id"),
    }


def dispatch_sequence(client: ApolloClient, cfg: ApolloConfig, record):
    endpoint = f"{SEQUENCE_ADD_ENDPOINT}/{cfg.sequence_id}/add_contact_ids"
    data = client.post(endpoint, build_sequence_payload(cfg, record))
    campaign = data.get("emailer_campaign") or {}
    return {
        "strategy": "sequence",
        "record_id": record.person_id,
        "contact_id": record.contact_id,
        "first_name": record.first_name,
        "last_name": record.last_name,
        "title": record.title,
        "organization": record.organization,
        "request_id": data.get("request_id"),
        "campaign_id": campaign.get("id"),
    }


def dispatch_agent(client: ApolloClient, cfg: ApolloConfig, records):
    if not records:
        return []
    data = client.post(AGENTS_TASK_ENDPOINT, build_agent_payload(cfg, records))
    task_id = data.get("task_id") or data.get("id") or data.get("request_id")
    entries = []
    for record in records:
        entries.append({
            "strategy": "agent",
            "record_id": record.person_id,
            "contact_id": record.contact_id,
            "first_name": record.first_name,
            "last_name": record.last_name,
            "title": record.title,
            "organization": record.organization,
            "request_id": task_id,
            "task_id": task_id,
        })
    return entries


def trigger_one(client: ApolloClient, cfg: ApolloConfig, record):
    mode = cfg.trigger_mode
    if mode == "match":
        return dispatch_match(client, cfg, record)
    if mode == "sequence":
        return dispatch_sequence(client, cfg, record)
    if mode == "agent":
        return dispatch_agent(client, cfg, [record])[0]
    raise ValueError(f"unknown trigger mode: {mode}")


def trigger_batch(client: ApolloClient, cfg: ApolloConfig, records):
    if cfg.trigger_mode == "agent":
        entries = dispatch_agent(client, cfg, records)
        return entries
    entries = []
    for record in records:
        entries.append(trigger_one(client, cfg, record))
        time.sleep(cfg.request_interval_seconds)
    return entries


def persist_dispatch(entry):
    append_jsonl(REQUESTS_FILE, entry)