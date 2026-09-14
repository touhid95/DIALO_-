import csv
import importlib

import store as store_mod
from lookup import ContactRecord


def reload_store(tmp_path, monkeypatch):
    monkeypatch.setattr(store_mod, "BASE_DIR", tmp_path)
    monkeypatch.setattr(store_mod, "REQUESTS_FILE", tmp_path / "enrichment_requests.jsonl")
    monkeypatch.setattr(store_mod, "PHONES_CSV", tmp_path / "phones_resolved.csv")
    monkeypatch.setattr(store_mod, "PHONES_JSONL", tmp_path / "phones_resolved.jsonl")
    monkeypatch.setattr(store_mod, "TARGETS_CSV", tmp_path / "targets_filtered.csv")
    return store_mod


def test_write_phones_called_twice_accumulates_both_batches(tmp_path, monkeypatch):
    """
    write_phones() is called once per completed person/request across
    discover(), status, show and poll. It must APPEND across calls (writing
    the header only once) rather than truncate-and-rewrite, or every call
    after the first would silently delete every previously-resolved phone.
    """
    store = reload_store(tmp_path, monkeypatch)

    batch_1 = [{
        "record_id": "p1", "first_name": "Ada", "last_name": "Lovelace",
        "title": "VP Sales", "organization": "Acme",
        "phones": [{"raw_number": "+1 512 555 0100", "sanitized_number": "+15125550100",
                     "type_cd": "mobile", "status_cd": "verified"}],
    }]
    batch_2 = [{
        "record_id": "p2", "first_name": "Grace", "last_name": "Hopper",
        "title": "CTO", "organization": "Acme",
        "phones": [{"raw_number": "+1 512 555 0200", "sanitized_number": "+15125550200",
                     "type_cd": "mobile", "status_cd": "verified"}],
    }]

    store.write_phones(batch_1)
    store.write_phones(batch_2)  # simulates a second person resolving later

    with store.PHONES_CSV.open() as f:
        rows = list(csv.DictReader(f))

    record_ids = {r["record_id"] for r in rows}
    assert record_ids == {"p1", "p2"}
    # exactly one header row, not one per call
    with store.PHONES_CSV.open() as f:
        header_lines = [l for l in f if l.startswith("record_id,")]
    assert len(header_lines) == 1


def test_write_targets_accepts_contact_record_objects(tmp_path, monkeypatch):
    """
    BUG: write_targets() used to call record.get("person_id") etc, but the
    only real caller (cmd_discover -> filter_targets) passes ContactRecord
    dataclass instances, which have no .get() method. This crashed
    `python cli.py discover` with an AttributeError any time there was at
    least one target to enrich -- the tool's core use case.
    """
    store = reload_store(tmp_path, monkeypatch)
    records = [
        ContactRecord(person_id="p1", contact_id="c1", first_name="Ada",
                      last_name="Lovelace", title="VP", organization="Acme",
                      has_direct_phone="Yes"),
        ContactRecord(person_id="p2", contact_id="c2", first_name="Grace",
                      last_name="Hopper", title="CTO", organization="Acme",
                      has_direct_phone="Yes"),
    ]
    store.write_targets(records)  # must not raise
    with store.TARGETS_CSV.open() as f:
        rows = list(csv.DictReader(f))
    ids = {r["person_id"] for r in rows}
    assert ids == {"p1", "p2"}


def test_write_targets_overwrites_per_discover_run(tmp_path, monkeypatch):
    """Each discover() run reflects a fresh Step-1 result, so a full
    overwrite (not accumulation) is the correct, intended behavior here -
    unlike write_phones."""
    store = reload_store(tmp_path, monkeypatch)
    store.write_targets([ContactRecord(person_id="p1", contact_id="c1")])
    store.write_targets([ContactRecord(person_id="p2", contact_id="c2")])
    with store.TARGETS_CSV.open() as f:
        rows = list(csv.DictReader(f))
    assert {r["person_id"] for r in rows} == {"p2"}


def test_append_jsonl_actually_appends(tmp_path, monkeypatch):
    store = reload_store(tmp_path, monkeypatch)
    store.append_jsonl(store.REQUESTS_FILE, {"a": 1})
    store.append_jsonl(store.REQUESTS_FILE, {"a": 2})
    records = store.read_records(store.REQUESTS_FILE)
    assert records == [{"a": 1}, {"a": 2}]
