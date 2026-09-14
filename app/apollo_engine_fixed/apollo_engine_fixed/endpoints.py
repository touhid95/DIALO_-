"""Apollo.io API v1 endpoint catalogue.

The alternative extraction engine is built on the documented + scope-agnostic
endpoints:

  STEP 1  LOOKUP       POST /api/v1/contacts/search          (0 credits - Free Tier Supported)
  STEP 2  TRIGGER      POST /api/v1/agents/task               (bulk loop)
                       POST /api/v1/emailer_campaigns/{sequence_id}/add_contact_ids
                       POST /api/v1/people/match              (fallback - Paid Plans only)
  STEP 3  MONITOR      GET  /api/v1/people/phone_enrichment_status
                       GET  /api/v1/webhook_result/show       (historical pull)
                       GET  /api/v1/webhook_result/{request_id}
                       POST /webhooks/apollo                  (local receiver)

NOTE: On Apollo Free Tier accounts:
  - api/v1/people/show and api/v1/people/{id} are NOT accessible.
  - api/v1/people/match is NOT included.
  - api/v1/contacts/search IS fully supported (0 credits).
"""

BASE_URL = "https://api.apollo.io/api/v1"

CONTACTS_SEARCH_ENDPOINT = f"{BASE_URL}/contacts/search"
CONTACTS_SHOW_ENDPOINT = f"{BASE_URL}/contacts"
PEOPLE_MATCH_ENDPOINT = f"{BASE_URL}/people/match"
PEOPLE_PHONE_ENRICHMENT_STATUS_ENDPOINT = f"{BASE_URL}/people/phone_enrichment_status"
WEBHOOK_RESULT_SHOW_ENDPOINT = f"{BASE_URL}/webhook_result/show"
WEBHOOK_RESULT_BY_ID_ENDPOINT = f"{BASE_URL}/webhook_result"
AGENTS_TASK_ENDPOINT = f"{BASE_URL}/agents/task"
SEQUENCE_ADD_ENDPOINT = f"{BASE_URL}/emailer_campaigns"
HEALTH_ENDPOINT = f"{BASE_URL}/auth/health"
USER_PROFILE_ENDPOINT = f"{BASE_URL}/users/api_profile"