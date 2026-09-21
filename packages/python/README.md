# `docsorb`

DocsOrb Guardrails for Python.

## Install

```bash
pip install docsorb
```

## Initializing

Auth happens in `create_client`. No network call is made until you use a tool.

```python
from docsorb import create_client

docsorb = create_client(
    os.environ["DOCSORB_URL"],
    os.environ["DOCSORB_API_KEY"],
    options={"actor": {"user_id": user.id, "email": user.email}},
)
```

`DOCSORB_URL` is usually `https://api.docsorb.com`. The key needs the `shield.evaluate` scope.

## Guardrails

```python
result = docsorb.guardrails.evaluate(user_prompt)
if result.error:
    raise result.error
if result.data["allowed"]:
    model.complete(user_prompt)

cleaned = docsorb.guardrails.sanitise(user_prompt)
if cleaned.data and cleaned.data["allowed"]:
    model.complete(cleaned.data["text"])

anon = docsorb.guardrails.anonymise(user_prompt)
reply = model.complete(anon.data["text"])
return docsorb.guardrails.restore(reply, anon.data)
```

`sanitize` / `anonymize` are aliases. `is_safe(prompt)` returns a boolean and raises on transport errors.

## Logging

```python
docsorb.set_actor({"user_id": user.id, "email": user.email})
docsorb.set_session({"id": request_id})
```

Per-call options override those defaults.

## Errors

`result.error` is auth/network. `result.data["allowed"]` is the policy verdict.
