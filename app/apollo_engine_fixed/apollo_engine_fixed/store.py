"""Disk persistence for lookup results, enrichment requests and recovered phones.

All outputs live next to this folder:
  enrichment_requests.jsonl - every Step-2 dispatch that produced a request_id
  phones_resolved.csv/jsonl - phones recovered via webhook_result / status pulls
  targets_filtered.csv      - the Step-1 filter result (has_direct_phone==Yes)
"""

import csv
import json
from pathlib import Path

BASE_DIR = Path(__file__).resolve().parent
REQUESTS_FILE = BASE_DIR / "enrichment_requests.jsonl"
PHONES_CSV = BASE_DIR / "phones_resolved.csv"
PHONES_JSONL = BASE_DIR / "phones_resolved.jsonl"
TARGETS_CSV = BASE_DIR / "targets_filtered.csv"

PHONE_HEADERS = ["record_id", "first_name", "last_name", "title", "organization",
                 "raw_number", "sanitized_number", "type_cd", "status_cd"]
TARGET_HEADERS = ["person_id", "contact_id", "first_name", "last_name", "title",
                  "organization", "has_direct_phone"]


def append_jsonl(path: Path, record: dict):
    with path.open("a", encoding="utf-8") as handle:
        handle.write(json.dumps(record) + "\n")


def read_records(path: Path):
    if not path.exists():
        return []
    records = []
    with path.open(encoding="utf-8") as handle:
        for line in handle:
            line = line.strip()
            if line:
                records.append(json.loads(line))
    return records


def write_phones(records):
    """Append resolved phone rows to PHONES_CSV.

    This is called once per completed person/request across discover(),
    status, show and poll - each call only carries the batch that just
    resolved. It must append (writing the header once) rather than
    truncate-and-rewrite, or every call after the first would silently
    delete every previously-resolved phone number.
    """
    file_is_new = not PHONES_CSV.exists() or PHONES_CSV.stat().st_size == 0
    with PHONES_CSV.open("a", newline="", encoding="utf-8") as handle:
        writer = csv.writer(handle)
        if file_is_new:
            writer.writerow(PHONE_HEADERS)
        count = 0
        for record in records:
            for phone in record.get("phones", []):
                writer.writerow([
                    record.get("record_id"), record.get("first_name"),
                    record.get("last_name"), record.get("title"),
                    record.get("organization"), phone.get("raw_number"),
                    phone.get("sanitized_number"), phone.get("type_cd"),
                    phone.get("status_cd"),
                ])
                count += 1
    return count


def write_targets(records):
    """Write the Step-1 filter result (has_direct_phone == Yes, no known phone).

    `records` are ContactRecord dataclass instances from lookup.filter_targets,
    not dicts - use attribute access, not `.get()`.
    """
    with TARGETS_CSV.open("w", newline="", encoding="utf-8") as handle:
        writer = csv.writer(handle)
        writer.writerow(TARGET_HEADERS)
        for record in records:
            writer.writerow([
                record.person_id, record.contact_id,
                record.first_name, record.last_name,
                record.title, record.organization,
                record.has_direct_phone,
            ])