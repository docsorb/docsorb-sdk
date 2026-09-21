from __future__ import annotations

from typing import Any

import httpx

from .errors import DocsOrbError
from .guardrails import GuardrailsClient


class DocsOrbResponse(dict):
    @property
    def data(self) -> Any:
        return self.get("data")

    @property
    def error(self) -> DocsOrbError | None:
        return self.get("error")


class Client:
    def __init__(
        self,
        docsorb_url: str,
        docsorb_key: str,
        options: dict[str, Any] | None = None,
        http: httpx.Client | None = None,
    ):
        options = options or {}
        self._base_url = _normalize_base_url(docsorb_url)
        self._api_key = docsorb_key
        self._headers = dict(options.get("global", {}).get("headers") or {})
        self._actor = dict(options.get("actor") or {})
        self._device = dict(options.get("device") or {})
        self._session = dict(options.get("session") or {})
        self._request = dict(options.get("request") or {})
        self._guardrails_defaults = dict(options.get("guardrails") or {})
        self._http = http or httpx.Client()
        self.guardrails = GuardrailsClient(self)

    def set_actor(self, actor: dict[str, Any]) -> None:
        self._actor = {**self._actor, **actor}

    def set_session(self, session: dict[str, Any]) -> None:
        self._session = {**self._session, **session}

    def set_device(self, device: dict[str, Any]) -> None:
        self._device = {**self._device, **device}

    def request(self, path: str, body: dict[str, Any]) -> DocsOrbResponse:
        try:
            response = self._http.post(
                f"{self._base_url}{path}",
                headers={
                    "authorization": f"Bearer {self._api_key}",
                    "content-type": "application/json",
                    **self._headers,
                },
                json=body,
            )
            payload: Any
            try:
                payload = response.json()
            except Exception:
                payload = {"message": response.text}
            if response.status_code >= 400:
                return DocsOrbResponse(data=None, error=DocsOrbError.from_response(response.status_code, payload))
            return DocsOrbResponse(data=payload, error=None)
        except Exception as error:
            return DocsOrbResponse(data=None, error=DocsOrbError.from_network(error))

    def merge_metadata(self, call: dict[str, Any] | None = None) -> dict[str, Any]:
        call = call or {}
        return {
            "actorMetadata": {**self._actor, **(call.get("actor") or {})},
            "deviceMetadata": {**self._device, **(call.get("device") or {})},
            "sessionMetadata": {**self._session, **(call.get("session") or {})},
            "requestMetadata": {**self._request, **(call.get("request") or {})},
        }


def create_client(
    docsorb_url: str,
    docsorb_key: str,
    options: dict[str, Any] | None = None,
    http: httpx.Client | None = None,
) -> Client:
    if not str(docsorb_url or "").strip():
        raise DocsOrbError("docsorb_url is required.")
    if not str(docsorb_key or "").strip():
        raise DocsOrbError("docsorb_key is required.")
    return Client(docsorb_url, docsorb_key, options=options, http=http)


def _normalize_base_url(url: str) -> str:
    trimmed = url.strip().rstrip("/")
    if trimmed.endswith("/api/v1"):
        return trimmed
    return f"{trimmed}/api/v1"
