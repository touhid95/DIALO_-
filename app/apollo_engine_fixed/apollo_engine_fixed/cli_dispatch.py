"""Command dispatch for the Apollo extraction engine CLI.

The real logic lives in modules; this keeps cli.py a thin wrapper so the
subcommands are easy to test.
"""

import sys
import time

from apollo_client import ApolloClient, ApolloHttpError
from config import load_config
from lookup import run_lookup, filter_targets
from monitor import (
    check_phone_enrichment_status,
    extract_webhook_payload,
    fetch_webhook_result,
    fetch_webhook_result_show,
    persist_enrichment_status,
)
from store import (
    PHONES_CSV,
    PHONES_JSONL,
    REQUESTS_FILE,
    TARGETS_CSV,
    read_records,
    write_phones,
    write_targets,
    append_jsonl,
)
from trigger import trigger_batch


def print_record(record):
    name = f"{record.get('first_name') or ''} {record.get('last_name') or ''}".strip()
    print(f"  - {name or record.get('record_id')} "
          f"({record.get('title')} @ {record.get('organization')}) "
          f"[{record.get('strategy')}] request_id={record.get('request_id')}")


def cmd_health(cfg):
    client = ApolloClient(cfg.apollo_api_key)
    try:
        body = client.health()
        endpoint = body.get("endpoint", "/auth/health") if isinstance(body, dict) else "/auth/health"
        auth = body.get("auth", "valid") if isinstance(body, dict) else "valid"
        extra = f" | total_contacts: {body.get('total_contacts')}" if isinstance(body, dict) and "total_contacts" in body else ""
        print(f"[*] {endpoint} -> HTTP 200 ({auth}{extra})")
    except ApolloHttpError as exc:
        print(f"[!] API key rejected: {exc}")
        return 1
    return 0


def cmd_discover(cfg):
    if not cfg.apollo_api_key:
        print("[!] APOLLO_API_KEY is not set. Add it to .env (copy from .env.example).")
        return 2

    client = ApolloClient(cfg.apollo_api_key)
    print(f"[*] STEP 1 - contacts/search lookup | keywords={cfg.q_keywords or 'none'} "
          f"| mode={cfg.trigger_mode}")

    records, total = run_lookup(client, cfg)
    harvested = [r for r in records if r.known_phones]
    targets = filter_targets(records, cfg)
    write_targets(targets)
    print(f"[*] {len(records)} client-matched record(s) | {len(harvested)} with known "
          f"phones (0 credits) | {len(targets)} routed to enrich -> {TARGETS_CSV.name}")

    if harvested:
        write_phones([
            {
                "record_id": r.person_id, "first_name": r.first_name,
                "last_name": r.last_name, "title": r.title,
                "organization": r.organization, "phones": r.known_phones,
            }
            for r in harvested
        ])
        print(f"[*] {len(harvested)} harvested -> {PHONES_CSV.name}")

    if not targets:
        print("[*] No target ids to enrich under the configured filters.")
        return 0

    if cfg.trigger_mode == "none":
        print("[*] TRIGGER_MODE is 'none' - skipping Step 2 reveal (Free Plan safe).")
        return 0

    if cfg.webhook_url and cfg.webhook_url == "https://yourdomain.com/webhooks/apollo":
        print("[!] WEBHOOK_URL is still the placeholder - set a real public URL for async reveal.")
        print("[*] Step 1 lookup completed; skipping Step 2 reveal dispatch.")
        return 0

    print(f"[*] STEP 2 - pushing {len(targets)} target id(s) via {cfg.trigger_mode}")
    if cfg.dry_run:
        print("[*] DRY_RUN - dispatch skipped.")
        return 0
    try:
        entries = trigger_batch(client, cfg, targets)
    except ApolloHttpError as exc:
        if exc.status_code == 403 and "Free plan" in str(exc.body):
            print("[!] Notice: Apollo Free plan does not include /people/match or /people/show.")
            print("[*] STEP 1 targets preserved in targets_filtered.csv (0 credits used).")
            return 0
        print(f"[!] STEP 2 dispatch failed: {exc}")
        return 1
    for entry in entries:
        append_jsonl(REQUESTS_FILE, entry)
        print_record(entry)
    print(f"[*] queued -> {REQUESTS_FILE.name}")
    print(f"[*] STEP 3 - monitor with: python cli.py status|show|poll")
    return 0


def cmd_status(cfg, person_ids):
    if not person_ids:
        print("Usage: python cli.py status <person_id> [person_id ...]")
        return 2
    client = ApolloClient(cfg.apollo_api_key)
    print(f"[*] STEP 3 - phone_enrichment_status for {len(person_ids)} id(s)")
    for person_id in person_ids:
        status = check_phone_enrichment_status(client, person_id)
        persist_enrichment_status(status, "phone_enrichment_status")
        if status.complete:
            print(f"[+] {person_id}: {status.state} | {len(status.phone_numbers)} phone(s)")
        else:
            print(f"[.] {person_id}: {status.state} | retry in {status.retry_after_seconds}s")
    return 0


def cmd_show(cfg, request_id):
    client = ApolloClient(cfg.apollo_api_key)
    print(f"[*] STEP 3 - webhook_result/show (request_id={request_id or 'all'})")
    code, body = fetch_webhook_result_show(client, request_id)
    if code >= 400:
        print(f"[!] HTTP {code}: {str(body)[:300]}")
        return 1
    people = extract_webhook_payload(body)
    if not people:
        print(f"[.] no payloads / still pending (HTTP {code})")
        return 0
    entries = []
    for person in people:
        entry = {
            "person_id": person.get("id"),
            "source": "webhook_result/show",
            "state": "completed",
            "complete": True,
            "phones": [
                {
                    "raw_number": phone.get("raw_number"),
                    "sanitized_number": phone.get("sanitized_number"),
                    "type_cd": phone.get("type_cd"),
                    "status_cd": phone.get("status_cd"),
                }
                for phone in (person.get("phone_numbers") or [])
            ],
        }
        entries.append(entry)
    for entry in entries:
        append_jsonl(PHONES_JSONL, entry)
    count = write_phones(entries)
    print(f"[+] {len(entries)} record(s), {count} phone(s) -> {PHONES_CSV.name}")
    return 0


def cmd_poll(cfg):
    client = ApolloClient(cfg.apollo_api_key)
    pending = [r for r in read_records(REQUESTS_FILE) if r.get("request_id")]
    if not pending:
        print("[*] No request_ids in the log.")
        return 2
    print(f"[*] STEP 3 - polling {len(pending)} webhook_result id(s)")
    for record in pending:
        request_id = record["request_id"]
        started = time.time()
        while time.time() - started < cfg.poll_max_wait_seconds:
            code, body = fetch_webhook_result(client, request_id)
            if code == 200 and isinstance(body, dict) and body.get("webhook_result"):
                entry = record.copy()
                entry["complete"] = True
                entry["state"] = "completed"
                entry["phones"] = []
                payload = body.get("webhook_result") or {}
                for person in extract_webhook_payload(body):
                    for phone in person.get("phone_numbers") or []:
                        entry["phones"].append({
                            "record_id": person.get("id"),
                            "raw_number": phone.get("raw_number"),
                            "sanitized_number": phone.get("sanitized_number"),
                            "type_cd": phone.get("type_cd"),
                            "status_cd": phone.get("status_cd"),
                        })
                append_jsonl(PHONES_JSONL, entry)
                count = write_phones([entry])
                print(f"[+] {request_id}: resolved ({count} phone(s)) -> {PHONES_CSV.name}")
                break
            if code == 404 and isinstance(body, dict) and body.get("error_code") == "result_pending":
                wait = body.get("retry_after_seconds") or cfg.poll_interval_seconds
                print(f"[.] {request_id}: processing, retry in {wait}s")
                time.sleep(wait)
                continue
            print(f"[!] {request_id}: HTTP {code} {str(body)[:200]}")
            break
        else:
            print(f"[!] {request_id}: timed out after {cfg.poll_max_wait_seconds}s")
    return 0


def cmd_webhook(cfg):
    from webhook_receiver import run_server
    run_server(cfg)
    return 0


def cmd_agent(cfg, person_ids):
    from lookup import ContactRecord
    client = ApolloClient(cfg.apollo_api_key)
    if cfg.dry_run:
        print("[*] DRY_RUN - agent dispatch skipped.")
        return 0
    records = [ContactRecord(person_id=pid) for pid in person_ids]
    entries = trigger_batch(client, cfg, records)
    for entry in entries:
        append_jsonl(REQUESTS_FILE, entry)
        print_record(entry)
    print(f"[*] agent task queued -> {REQUESTS_FILE.name}")
    return 0


def run():
    cfg = load_config()
    args = sys.argv[1:]
    if not args:
        print(__doc__ or "Apollo extraction engine")
        return 2
    command = args[0]
    if command == "health":
        return cmd_health(cfg)
    if command == "discover":
        return cmd_discover(cfg)
    if command == "status":
        return cmd_status(cfg, args[1:])
    if command == "show":
        return cmd_show(cfg, args[1] if len(args) > 1 else "")
    if command == "poll":
        return cmd_poll(cfg)
    if command == "webhook":
        return cmd_webhook(cfg)
    if command == "agent":
        return cmd_agent(cfg, args[1:])
    print(f"[!] unknown command: {command}")
    return 2