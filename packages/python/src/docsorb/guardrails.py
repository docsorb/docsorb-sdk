from __future__ import annotations

from typing import Any, TYPE_CHECKING

from .errors import DocsOrbError

if TYPE_CHECKING:
    from .client import Client, DocsOrbResponse


def restore_anonymised_text(text: str, mapping: list[dict[str, Any]] | None) -> str:
    entries = [entry for entry in (mapping or []) if entry.get("token") and entry.get("original")]
    entries.sort(key=lambda entry: len(str(entry["token"])), reverse=True)
    restored = text
    for entry in entries:
        restored = restored.replace(str(entry["token"]), str(entry["original"]))
    return restored


class GuardrailsClient:
    def __init__(self, client: "Client"):
        self._client = client

    def evaluate(self, content: str, options: dict[str, Any] | None = None) -> "DocsOrbResponse":
        return self._client.request("/guardrails/evaluate", self._body(content, options))

    def sanitise(self, content: str, options: dict[str, Any] | None = None) -> "DocsOrbResponse":
        return self._client.request("/guardrails/sanitise", self._body(content, options))

    def sanitize(self, content: str, options: dict[str, Any] | None = None) -> "DocsOrbResponse":
        return self.sanitise(content, options)

    def anonymise(self, content: str, options: dict[str, Any] | None = None) -> "DocsOrbResponse":
        return self._client.request("/guardrails/anonymise", self._body(content, options))

    def anonymize(self, content: str, options: dict[str, Any] | None = None) -> "DocsOrbResponse":
        return self.anonymise(content, options)

    def restore(self, text: str, result: Any) -> str:
        mapping = result if isinstance(result, list) else (result or {}).get("mapping")
        if isinstance(result, dict) and result.get("data"):
            mapping = result["data"].get("mapping")
        return restore_anonymised_text(text, mapping)

    def is_safe(self, content: str, options: dict[str, Any] | None = None) -> bool:
        response = self.evaluate(content, options)
        if response.error:
            raise response.error
        data = response.data or {}
        return bool(data.get("allowed"))

    def _body(self, content: str, options: dict[str, Any] | None = None) -> dict[str, Any]:
        options = options or {}
        defaults = self._client._guardrails_defaults
        return {
            "content": content,
            "interventionPoint": options.get("intervention_point")
            or options.get("interventionPoint")
            or defaults.get("defaultInterventionPoint")
            or "user_input",
            "locale": options.get("locale", defaults.get("locale")),
            "aiToolId": options.get("ai_tool_id") or options.get("aiToolId") or defaults.get("aiToolId"),
            **self._client.merge_metadata(options),
        }
