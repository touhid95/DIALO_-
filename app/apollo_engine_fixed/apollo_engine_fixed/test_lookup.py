import responses

from apollo_client import ApolloClient
from config import ApolloConfig
from endpoints import CONTACTS_SEARCH_ENDPOINT
from lookup import (
    search_contacts, filter_targets, normalize_contact,
    contact_matches_client_filters, has_direct_phone_yes, run_lookup,
)

SYNTHETIC_CONTACTS = [
    {
        "id": "c1", "person_id": "p1", "first_name": "Ada", "last_name": "Lovelace",
        "title": "VP Sales", "organization_name": "Acme Corp",
        "has_direct_phone": "Yes",
        "account": {"name": "Acme Corp", "primary_domain": "acme.com"},
        "city": "Austin", "state": "TX", "country": "US",
        "phone_numbers": [],
    },
    {
        "id": "c2", "person_id": "p2", "first_name": "Grace", "last_name": "Hopper",
        "title": "CTO", "organization_name": "Acme Corp",
        "has_direct_phone": "Yes",
        "account": {"name": "Acme Corp", "primary_domain": "acme.com"},
        "city": "Austin", "state": "TX", "country": "US",
        "phone_numbers": [{"raw_number": "+1 512 555 0100", "sanitized_number": "+15125550100",
                            "type_cd": "mobile", "status_cd": "verified"}],
    },
    {
        "id": "c3", "person_id": "p3", "first_name": "No", "last_name": "Phone",
        "title": "IC", "organization_name": "Other Inc",
        "has_direct_phone": "No",
        "account": {"name": "Other Inc", "primary_domain": "other.com"},
        "city": "Reno", "state": "NV", "country": "US",
        "phone_numbers": [],
    },
    {
        "id": "c4", "person_id": "p4", "first_name": "Maybe", "last_name": "Guy",
        "title": "Dir", "organization_name": "Acme Corp",
        "has_direct_phone": "Maybe (some outdated data)",
        "account": {"name": "Acme Corp", "primary_domain": "acme.com"},
        "city": "Austin", "state": "TX", "country": "US",
        "phone_numbers": [],
    },
    {
        "id": "c5", "person_id": "p5", "first_name": "Wrong", "last_name": "Org",
        "title": "VP", "organization_name": "Globex",
        "has_direct_phone": "Yes",
        "account": {"name": "Globex", "primary_domain": "globex.com"},
        "city": "Austin", "state": "TX", "country": "US",
        "phone_numbers": [],
    },
]


def base_cfg(**overrides):
    cfg = ApolloConfig(apollo_api_key="k")
    for key, value in overrides.items():
        setattr(cfg, key, value)
    return cfg


@responses.activate
def test_search_contacts_client_side_filters_org_and_location():
    responses.add(
        responses.POST, CONTACTS_SEARCH_ENDPOINT,
        json={"contacts": SYNTHETIC_CONTACTS, "pagination": {"total_entries": 5}},
        status=200,
    )
    cfg = base_cfg(
        client_locations=["Austin"],
        q_organization_domains_list=["acme.com"],
    )
    client = ApolloClient(cfg.apollo_api_key)
    records, total = search_contacts(client, cfg)
    ids = {r.person_id for r in records}
    # p5 is Austin but wrong org (Globex) -> excluded
    # p3 is Acme?? no wait p3 is "Other Inc" in Reno -> excluded on both counts
    assert ids == {"p1", "p2", "p4"}


def test_filter_targets_excludes_known_phones_and_respects_maybe_flag():
    records = [normalize_contact(c) for c in SYNTHETIC_CONTACTS]
    cfg = base_cfg(filter_has_direct_phone=True, include_maybe_phone=False)
    targets = filter_targets(records, cfg)
    target_ids = {r.person_id for r in targets}
    # p1: Yes + no known phone -> target
    # p2: Yes but already has known phone -> excluded (harvested for free instead)
    # p3: No -> excluded
    # p4: Maybe, include_maybe_phone False -> excluded
    # p5: Yes + no known phone -> target
    assert target_ids == {"p1", "p5"}


def test_filter_targets_includes_maybe_when_enabled():
    records = [normalize_contact(c) for c in SYNTHETIC_CONTACTS]
    cfg = base_cfg(filter_has_direct_phone=True, include_maybe_phone=True)
    targets = filter_targets(records, cfg)
    target_ids = {r.person_id for r in targets}
    assert "p4" in target_ids


def test_has_direct_phone_yes_handles_non_string_and_maybe():
    assert has_direct_phone_yes({"has_direct_phone": "Yes"}) is True
    assert has_direct_phone_yes({"has_direct_phone": None}) is False
    assert has_direct_phone_yes({}) is False
    assert has_direct_phone_yes({"has_direct_phone": "Maybe (outdated)"}, include_maybe=True) is True
    assert has_direct_phone_yes({"has_direct_phone": "Maybe (outdated)"}, include_maybe=False) is False


def test_run_lookup_paginates(monkeypatch):
    cfg = base_cfg(page=1, max_pages=3, per_page=2)
    calls = []

    def fake_search(client, cfg_):
        calls.append(cfg_.page)
        return [normalize_contact(SYNTHETIC_CONTACTS[0])], 5

    import lookup
    monkeypatch.setattr(lookup, "search_contacts", fake_search)
    client = object()
    records, total = run_lookup(client, cfg)
    assert calls == [1, 2, 3]
    assert len(records) == 3
