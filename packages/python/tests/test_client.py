import json

import httpx
import pytest

from docsorb import DocsOrbError, create_client


def _handler(request: httpx.Request) -> httpx.Response:
    if request.url.path.endswith("/guardrails/evaluate"):
        body = json.loads(request.content.decode())
        if request.headers.get("authorization") != "Bearer do_live_test":
            return httpx.Response(401, json={"message": "Unauthorized", "data": {"errorCode": "unauthorized"}})
        if body.get("content") == "blocked":
            return httpx.Response(
                200,
                json={
                    "allowed": False,
                    "outcome": "blocked",
                    "matches": [],
                    "interventionPoint": "user_input",
                    "evaluatedAt": "2026-01-01T00:00:00.000Z",
                },
            )
        return httpx.Response(
            200,
            json={
                "allowed": True,
                "outcome": "allowed",
                "matches": [],
                "interventionPoint": "user_input",
                "evaluatedAt": "2026-01-01T00:00:00.000Z",
                "actorEcho": body.get("actorMetadata"),
            },
        )
    return httpx.Response(404, json={"message": "Not found"})


def _client(**options):
    transport = httpx.MockTransport(_handler)
    return create_client(
        "https://api.docsorb.com",
        "do_live_test",
        options=options,
        http=httpx.Client(transport=transport),
    )


def test_create_client_requires_url_and_key():
    with pytest.raises(DocsOrbError):
        create_client("", "do_live_test")
    with pytest.raises(DocsOrbError):
        create_client("https://api.docsorb.com", "")


def test_evaluate_sends_actor_metadata():
    docsorb = _client(actor={"user_id": "u1"})
    result = docsorb.guardrails.evaluate("hello")
    assert result.error is None
    assert result.data["allowed"] is True
    assert result.data["actorEcho"] == {"user_id": "u1"}


def test_per_call_actor_overrides_client():
    docsorb = _client(actor={"user_id": "u1"})
    result = docsorb.guardrails.evaluate("hello", {"actor": {"user_id": "u2"}})
    assert result.data["actorEcho"] == {"user_id": "u2"}


def test_is_safe_and_restore():
    docsorb = _client()
    assert docsorb.guardrails.is_safe("hello") is True
    assert docsorb.guardrails.is_safe("blocked") is False
    assert (
        docsorb.guardrails.restore(
            "Hi [EMAIL_1]",
            {"mapping": [{"token": "[EMAIL_1]", "type": "EMAIL", "original": "jane@acme.com"}]},
        )
        == "Hi jane@acme.com"
    )
