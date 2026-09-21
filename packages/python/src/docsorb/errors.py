from __future__ import annotations


class DocsOrbError(Exception):
    def __init__(self, message: str, status: int | None = None, error_code: str | None = None):
        super().__init__(message)
        self.message = message
        self.status = status
        self.error_code = error_code

    @classmethod
    def from_response(cls, status: int, body: object) -> "DocsOrbError":
        record = body if isinstance(body, dict) else {}
        data = record.get("data") if isinstance(record.get("data"), dict) else {}
        message = str(record.get("message") or record.get("statusMessage") or f"Request failed ({status})")
        error_code = data.get("errorCode") or record.get("errorCode") or None
        return cls(message, status=status, error_code=error_code)

    @classmethod
    def from_network(cls, error: Exception) -> "DocsOrbError":
        return cls(str(error))
