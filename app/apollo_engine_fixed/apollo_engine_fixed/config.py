"""Configuration for the alternative Apollo extraction engine.

TRIGGER_MODE selects how Step 2 dispatches the filtered contact/person ids:

  match     POST /api/v1/people/match            - direct reveal (fallback path,
                                                   requires people_match scope)
  sequence  POST /api/v1/emailer_campaigns/{id}/add_contact_ids
                                                - push ids into an active tracking
                                                  sequence that owns the phone step
  agent     POST /api/v1/agents/task             - spin up a background extraction
                                                   loop for the target ids

MONITOR_PRIORITY decides which Step-3 receiver is tried first:

  status    GET /api/v1/people/phone_enrichment_status  (waterfall callback flags)
  webhook   GET /api/v1/webhook_result/show + local receiver  (historical payloads)
"""

import os
from dataclasses import dataclass, field
from pathlib import Path

from dotenv import load_dotenv

BASE_DIR = Path(__file__).resolve().parent

VALID_TRIGGER_MODES = ("match", "sequence", "agent", "none")
VALID_MONITOR_PRIORITIES = ("status", "webhook")


@dataclass
class ApolloConfig:
    apollo_api_key: str = ""
    webhook_url: str = ""

    q_keywords: str = ""
    contact_stage_ids: list = field(default_factory=list)
    contact_label_ids: list = field(default_factory=list)
    client_locations: list = field(default_factory=list)
    q_organization_domains_list: list = field(default_factory=list)

    filter_has_direct_phone: bool = True
    include_maybe_phone: bool = False

    trigger_mode: str = "match"
    monitor_priority: str = "status"

    reveal_phone_number: bool = True
    run_waterfall_phone: bool = True
    reveal_personal_emails: bool = False
    run_waterfall_email: bool = False

    page: int = 1
    per_page: int = 25
    max_pages: int = 1

    poll_interval_seconds: int = 15
    poll_max_wait_seconds: int = 1800
    request_interval_seconds: float = 1.0

    sequence_id: str = ""
    send_email_from_email_account_id: str = ""
    agent_id: str = ""

    webhook_secret: str = ""
    dry_run: bool = False


def _bool_env(name, default="false"):
    value = os.getenv(name, default or "").strip().lower()
    if value in ("", "0", "false", "no", "off"):
        return False
    return True


def _list_env(name, default=""):
    raw = os.getenv(name, default)
    return [item.strip() for item in raw.split(",") if item.strip()]


def load_config() -> ApolloConfig:
    # First check .env.local in parent app directory, then override with local .env if present
    load_dotenv(BASE_DIR.parent.parent / ".env.local")
    load_dotenv(BASE_DIR / ".env")

    trigger_mode = os.getenv("TRIGGER_MODE", "match").strip().lower()
    monitor_priority = os.getenv("MONITOR_PRIORITY", "status").strip().lower()
    if trigger_mode not in VALID_TRIGGER_MODES:
        trigger_mode = "match"
    if monitor_priority not in VALID_MONITOR_PRIORITIES:
        monitor_priority = "status"

    return ApolloConfig(
        apollo_api_key=os.getenv("APOLLO_API_KEY", "").strip(),
        webhook_url=os.getenv("WEBHOOK_URL", "").strip(),
        q_keywords=os.getenv("KEYWORDS", "").strip(),
        contact_stage_ids=_list_env("CONTACT_STAGE_IDS"),
        contact_label_ids=_list_env("CONTACT_LABEL_IDS"),
        client_locations=_list_env("CLIENT_LOCATIONS"),
        q_organization_domains_list=_list_env("ORGANIZATION_DOMAINS"),
        filter_has_direct_phone=_bool_env("FILTER_HAS_DIRECT_PHONE", "true"),
        include_maybe_phone=_bool_env("INCLUDE_MAYBE_PHONE"),
        trigger_mode=trigger_mode,
        monitor_priority=monitor_priority,
        reveal_phone_number=_bool_env("REVEAL_PHONE_NUMBER", "true"),
        run_waterfall_phone=_bool_env("RUN_WATERFALL_PHONE", "true"),
        reveal_personal_emails=_bool_env("REVEAL_PERSONAL_EMAILS"),
        run_waterfall_email=_bool_env("RUN_WATERFALL_EMAIL"),
        page=int(os.getenv("PAGE", "1")),
        per_page=int(os.getenv("PER_PAGE", "25")),
        max_pages=int(os.getenv("MAX_PAGES", "1")),
        poll_interval_seconds=int(os.getenv("POLL_INTERVAL_SECONDS", "15")),
        poll_max_wait_seconds=int(os.getenv("POLL_MAX_WAIT_SECONDS", "1800")),
        request_interval_seconds=float(os.getenv("APOLLO_REQUEST_INTERVAL", "1.0")),
        sequence_id=os.getenv("SEQUENCE_ID", "").strip(),
        send_email_from_email_account_id=os.getenv("SEND_FROM_EMAIL_ACCOUNT_ID", "").strip(),
        agent_id=os.getenv("AGENT_ID", "").strip(),
        webhook_secret=os.getenv("WEBHOOK_SECRET", "").strip(),
        dry_run=_bool_env("DRY_RUN"),
    )