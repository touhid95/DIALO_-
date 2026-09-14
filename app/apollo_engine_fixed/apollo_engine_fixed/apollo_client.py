"""Thin HTTP transport for the Apollo.io v1 API.

Uses the `x-api-key` header (mirrored into JSON bodies) to authenticate.
Handles 429 rate-limit backoff with exponential retries and surfaces non-2xx
responses as HttpError with the raw body for debugging.
"""

import time

import requests
import urllib3

from endpoints import HEALTH_ENDPOINT, USER_PROFILE_ENDPOINT, CONTACTS_SEARCH_ENDPOINT

urllib3.disable_warnings(urllib3.exceptions.InsecureRequestWarning)

MAX_RETRIES = 3
DEFAULT_TIMEOUT = 60


class ApolloHttpError(requests.HTTPError):
    def __init__(self, message, status_code, body):
        super().__init__(message)
        self.status_code = status_code
        self.body = body


class ApolloClient:
    def __init__(self, api_key: str, timeout: int = DEFAULT_TIMEOUT):
        self.api_key = api_key
        self.timeout = timeout
        self._session = requests.Session()

    def headers(self):
        return {
            "Cache-Control": "no-cache",
            "Content-Type": "application/json",
            "x-api-key": self.api_key,
        }

    def _mirror_key(self, payload):
        caller_payload = dict(payload or {})
        caller_payload.setdefault("api_key", self.api_key)
        return caller_payload

    def post(self, endpoint, payload=None):
        last_error = None
        for attempt in range(1, MAX_RETRIES + 1):
            response = self._session.post(
                endpoint,
                headers=self.headers(),
                json=self._mirror_key(payload),
                timeout=self.timeout,
            )
            if response.status_code == 429:
                delay = min(60, 2 ** attempt)
                last_error = ApolloHttpError(
                    f"Rate limited (429) at {endpoint}", 429, response.text
                )
                time.sleep(delay)
                continue
            if response.status_code >= 400:
                raise ApolloHttpError(
                    f"{endpoint} returned {response.status_code}: {response.text[:500]}",
                    response.status_code,
                    response.text,
                )
            return response.json()
        raise last_error

    def _parse_body(self, response):
        # Apollo returns JSON bodies (e.g. {"error_code": "result_pending", ...})
        # on error statuses too, not just 2xx. Callers like cmd_poll rely on
        # getting a dict back so they can inspect error_code/retry_after_seconds
        # even on a 404. Fall back to raw text only if the body truly isn't JSON.
        try:
            return response.json()
        except ValueError:
            return response.text

    def get(self, endpoint, params=None):
        last_error = None
        for attempt in range(1, MAX_RETRIES + 1):
            response = self._session.get(
                endpoint,
                headers=self.headers(),
                params=self._mirror_key(params),
                timeout=self.timeout,
            )
            if response.status_code == 429:
                delay = min(60, 2 ** attempt)
                last_error = (response.status_code, self._parse_body(response))
                time.sleep(delay)
                continue
            return response.status_code, self._parse_body(response)
        return last_error

    def health(self):
        # 1. Try users/api_profile (standard Apollo API key profile endpoint)
        status_code, body = self.get(USER_PROFILE_ENDPOINT)
        if status_code == 200:
            user_info = body.get("user", {}) if isinstance(body, dict) else {}
            user_email = user_info.get("email") or "verified"
            return {"auth": "valid", "user": user_email, "endpoint": "/users/api_profile"}

        # 2. Try contacts/search (0 credits, verifies API key functionality)
        try:
            res = self.post(CONTACTS_SEARCH_ENDPOINT, {"per_page": 1})
            if isinstance(res, dict) and ("contacts" in res or "pagination" in res):
                total = res.get("pagination", {}).get("total_entries", len(res.get("contacts", [])))
                return {"auth": "valid", "endpoint": "/contacts/search", "total_contacts": total}
        except Exception:
            pass

        # 3. Fallback to /auth/health
        status_code_h, body_h = self.get(HEALTH_ENDPOINT)
        if status_code_h == 200:
            return body_h

        raise ApolloHttpError(
            f"API key check failed (HTTP {status_code})", status_code, body
        )