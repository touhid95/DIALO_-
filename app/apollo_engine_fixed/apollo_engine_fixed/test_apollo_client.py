import responses
import pytest

from apollo_client import ApolloClient, ApolloHttpError
from endpoints import HEALTH_ENDPOINT, CONTACTS_SEARCH_ENDPOINT


@responses.activate
def test_post_success():
    responses.add(responses.POST, CONTACTS_SEARCH_ENDPOINT, json={"contacts": []}, status=200)
    client = ApolloClient("k")
    result = client.post(CONTACTS_SEARCH_ENDPOINT, {"q_keywords": "vp sales"})
    assert result == {"contacts": []}


@responses.activate
def test_post_retries_on_429_then_succeeds():
    responses.add(responses.POST, CONTACTS_SEARCH_ENDPOINT, status=429)
    responses.add(responses.POST, CONTACTS_SEARCH_ENDPOINT, json={"contacts": [{"id": "1"}]}, status=200)
    client = ApolloClient("k")
    # patch sleep so the test doesn't actually wait 2^n seconds
    import apollo_client
    orig_sleep = apollo_client.time.sleep
    apollo_client.time.sleep = lambda s: None
    try:
        result = client.post(CONTACTS_SEARCH_ENDPOINT, {})
    finally:
        apollo_client.time.sleep = orig_sleep
    assert result["contacts"][0]["id"] == "1"


@responses.activate
def test_post_exhausts_retries_raises():
    for _ in range(3):
        responses.add(responses.POST, CONTACTS_SEARCH_ENDPOINT, status=429)
    client = ApolloClient("k")
    import apollo_client
    apollo_client.time.sleep = lambda s: None
    with pytest.raises(ApolloHttpError) as exc:
        client.post(CONTACTS_SEARCH_ENDPOINT, {})
    assert exc.value.status_code == 429


@responses.activate
def test_post_4xx_raises_immediately():
    responses.add(responses.POST, CONTACTS_SEARCH_ENDPOINT, json={"error": "bad scope"}, status=403)
    client = ApolloClient("k")
    with pytest.raises(ApolloHttpError) as exc:
        client.post(CONTACTS_SEARCH_ENDPOINT, {})
    assert exc.value.status_code == 403


@responses.activate
def test_get_returns_status_and_body():
    responses.add(responses.GET, HEALTH_ENDPOINT, json={"auth": "valid"}, status=200)
    client = ApolloClient("k")
    code, body = client.get(HEALTH_ENDPOINT)
    assert code == 200
    assert body["auth"] == "valid"


@responses.activate
def test_get_retries_on_429_like_post():
    responses.add(responses.GET, HEALTH_ENDPOINT, status=429, body="slow down")
    responses.add(responses.GET, HEALTH_ENDPOINT, json={"auth": "valid"}, status=200)
    client = ApolloClient("k")
    import apollo_client
    apollo_client.time.sleep = lambda s: None
    code, body = client.get(HEALTH_ENDPOINT)
    assert code == 200
    assert body["auth"] == "valid"
    assert len(responses.calls) == 2


@responses.activate
def test_get_parses_json_body_on_error_status():
    """cmd_poll depends on get() returning a parsed dict even on 4xx so it can
    check body.get('error_code') == 'result_pending' and keep polling."""
    responses.add(responses.GET, HEALTH_ENDPOINT,
                   json={"error_code": "result_pending", "retry_after_seconds": 5}, status=404)
    client = ApolloClient("k")
    code, body = client.get(HEALTH_ENDPOINT)
    assert code == 404
    assert isinstance(body, dict)
    assert body["error_code"] == "result_pending"


@responses.activate
def test_get_falls_back_to_text_for_non_json_error_body():
    responses.add(responses.GET, HEALTH_ENDPOINT, status=500, body="internal server error")
    client = ApolloClient("k")
    code, body = client.get(HEALTH_ENDPOINT)
    assert code == 500
    assert body == "internal server error"


@responses.activate
def test_health_raises_on_bad_key():
    responses.add(responses.GET, HEALTH_ENDPOINT, json={"error": "invalid key"}, status=401)
    client = ApolloClient("bad-key")
    with pytest.raises(ApolloHttpError):
        client.health()


@responses.activate
def test_api_key_mirrored_into_body_and_header():
    def check(request):
        assert request.headers["x-api-key"] == "secret123"
        import json
        body = json.loads(request.body)
        assert body["api_key"] == "secret123"
        return 200, {}, json.dumps({"ok": True})
    responses.add_callback(responses.POST, CONTACTS_SEARCH_ENDPOINT, callback=check)
    client = ApolloClient("secret123")
    client.post(CONTACTS_SEARCH_ENDPOINT, {"q_keywords": "x"})
