"""STEP 1 - LOOKUP PHASE (0 credits).

POST /api/v1/contacts/search queries the team's contacts database scope.

Server-side filters accepted by this endpoint: q_keywords, contact_stage_ids,
contact_label_ids, sorting and pagination. Location and domain restrictions are
not accepted here, so they run client-side via contact_matches_client_filters.

The returned `contacts` array is parsed and entries are isolated where
has_direct_phone == "Yes" (strict routing per the framework). Records that already
carry phone_numbers are harvested directly (0 credits); the rest are routed to
Step 2 using the nested contact id / person_id.
"""

from dataclasses import dataclass, field

from apollo_client import ApolloClient
from config import ApolloConfig
from endpoints import CONTACTS_SEARCH_ENDPOINT

HAS_PHONE_YES = "Yes"
HAS_PHONE_MAYBE = "Maybe"


@dataclass
class ContactRecord:
    person_id: str = ""
    contact_id: str = ""
    first_name: str = ""
    last_name: str = ""
    title: str = ""
    organization: str = ""
    has_direct_phone: str = ""
    known_phones: list = field(default_factory=list)
    needs_enrich: bool = False


def build_contacts_payload(cfg: ApolloConfig):
    return {
        key: value
        for key, value in {
            "q_keywords": cfg.q_keywords,
            "contact_stage_ids": cfg.contact_stage_ids,
            "contact_label_ids": cfg.contact_label_ids,
            "page": cfg.page,
            "per_page": cfg.per_page,
        }.items()
        if value
    }


def contact_matches_client_filters(contact: dict, cfg: ApolloConfig) -> bool:
    account = contact.get("account") or {}
    org = contact.get("organization") or {}
    org_name = (
        contact.get("organization_name") or org.get("name") or account.get("name") or ""
    ).lower()
    org_domain = (
        account.get("primary_domain") or org.get("primary_domain") or ""
    ).lower()
    city = (contact.get("city") or "").lower()
    state = (contact.get("state") or "").lower()
    country = (contact.get("country") or "").lower()
    location_text = f"{city} {state} {country}"

    if cfg.client_locations:
        if not any(token.lower() in location_text for token in cfg.client_locations):
            return False

    destination = " ".join((org_name, org_domain))
    if cfg.q_organization_domains_list:
        domains = [d.lower() for d in cfg.q_organization_domains_list]
        base_domains = [d.replace("www.", "").split(".")[0] for d in domains]
        if not any(d in destination for d in domains + base_domains):
            return False
    return True


def has_direct_phone_yes(contact: dict, include_maybe: bool = False) -> bool:
    flag = contact.get("has_direct_phone")
    if not isinstance(flag, str):
        return False
    if flag == HAS_PHONE_YES:
        return True
    return include_maybe and flag.startswith(HAS_PHONE_MAYBE)


def normalize_contact(contact: dict) -> ContactRecord:
    person_id = contact.get("person_id") or contact.get("id")
    known_phones = [
        {
            "raw_number": phone.get("raw_number"),
            "sanitized_number": phone.get("sanitized_number"),
            "type_cd": phone.get("type_cd") or phone.get("type"),
            "status_cd": phone.get("status_cd") or phone.get("status"),
        }
        for phone in (contact.get("phone_numbers") or [])
    ]
    return ContactRecord(
        person_id=person_id,
        contact_id=contact.get("id"),
        first_name=contact.get("first_name"),
        last_name=contact.get("last_name"),
        title=contact.get("title"),
        organization=contact.get("organization_name"),
        has_direct_phone=contact.get("has_direct_phone"),
        known_phones=known_phones,
        needs_enrich=bool(person_id and not known_phones),
    )


def search_contacts(client: ApolloClient, cfg: ApolloConfig):
    payload = build_contacts_payload(cfg)
    data = client.post(CONTACTS_SEARCH_ENDPOINT, payload)
    contacts = data.get("contacts", [])
    pagination = data.get("pagination") or {}
    filtered = [c for c in contacts if contact_matches_client_filters(c, cfg)]
    records = [normalize_contact(c) for c in filtered]
    return records, pagination.get("total_entries", len(records))


def filter_targets(records, cfg: ApolloConfig):
    targets = []
    for record in records:
        if record.known_phones or not filter_by_phone_flag(record, cfg):
            continue
        targets.append(record)
    return targets


def filter_by_phone_flag(record: ContactRecord, cfg: ApolloConfig) -> bool:
    if not cfg.filter_has_direct_phone:
        return True
    if record.has_direct_phone == HAS_PHONE_YES:
        return True
    return cfg.include_maybe_phone and (record.has_direct_phone or "").startswith(HAS_PHONE_MAYBE)


def run_lookup(client: ApolloClient, cfg: ApolloConfig):
    all_records = []
    for page in range(cfg.page, cfg.page + cfg.max_pages):
        cfg.page = page
        records, total = search_contacts(client, cfg)
        all_records.extend(records)
    return all_records, total