# Apollo API Testing - Alternative Extraction Engine

A strict two-step Apollo.io enrichment framework that keeps working when the
primary people-search and people/match endpoints are unavailable or restricted
under the current API key scope.

## Framework

```
STEP 1  LOOKUP  POST /api/v1/contacts/search        (0 credits)
                queries the team's contacts database scope with keyword /
                stage / label filters; location & domain filtering runs
                client-side. Entries with has_direct_phone == "Yes" are
                isolated; already-known phone_numbers are harvested for free.
STEP 2  REVEAL  push filtered target ids into a reveal pipeline:
                  sequence -> POST /api/v1/emailer_campaigns/{id}/add_contact_ids
                  agent    -> POST /api/v1/agents/task
                  match    -> POST /api/v1/people/match        (fallback)
STEP 3  MONITOR  GET  /api/v1/people/phone_enrichment_status  (waterfall checks)
                  GET  /api/v1/webhook_result/show            (historical pull)
                  GET  /api/v1/webhook_result/{request_id}    (per-id poll)
                  POST /webhooks/apollo                       (local receiver)
```

## Setup

```powershell
python -m venv .venv
.\.venv\Scripts\Activate.ps1
pip install -r requirements.txt
Copy-Item .env.example .env   # then fill in APOLLO_API_KEY
```

## Usage

```powershell
python cli.py health                       # verify the API key
python cli.py discover                     # STEP 1 lookup + STEP 2 dispatch
python cli.py status <person_id> [...]     # STEP 3 waterfall status checks
python cli.py show [request_id]            # STEP 3 pull webhook_result/show
python cli.py poll                         # STEP 3 poll saved request ids
python cli.py webhook                      # run the stdlib webhook receiver
python cli.py agent <person_id> [...]      # bulk agents/task dispatch
```

## Trigger strategies

Set `TRIGGER_MODE` in `.env`:

- **`sequence`** - `POST /emailer_campaigns/{sequence_id}/add_contact_ids`;
  needs `SEQUENCE_ID` and `SEND_FROM_EMAIL_ACCOUNT_ID`. Pushes the filtered
  contact ids into an active tracking sequence that owns the phone-step lookup.
- **`agent`** - `POST /agents/task`; needs `AGENT_ID`. Spins up a background
  extraction loop over the target ids.
- **`match`** - `POST /people/match` (default). Direct reveal fallback that
  sets `reveal_phone_number`, waterfall flags and `webhook_url`.

## Output files

- `enrichment_requests.jsonl` - every Step-2 dispatch (request/task ids).
- `targets_filtered.csv` - Step-1 filter result (has_direct_phone == Yes).
- `phones_resolved.csv` / `phones_resolved.jsonl` - recovered phone_numbers.

## Tests

```powershell
pytest -q
```

HTTP calls are mocked; no live Apollo credentials are required.