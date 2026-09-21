# DocsOrb SDK

Publishable clients for DocsOrb Guardrails. The APIs live in `docsorb-business`. This repo is what you publish.

## Install

```bash
pnpm add @docsorb/sdk
pip install docsorb
```

## Initializing

```ts
import { createClient } from "@docsorb/sdk";

const docsorb = createClient(process.env.DOCSORB_URL!, process.env.DOCSORB_API_KEY!);
```

```python
from docsorb import create_client

docsorb = create_client(os.environ["DOCSORB_URL"], os.environ["DOCSORB_API_KEY"])
```

Auth is the API key. Company is bound to the key. `createClient` / `create_client` does not hit the network.

## Guardrails

```ts
const { data, error } = await docsorb.guardrails.evaluate(prompt);
await docsorb.guardrails.sanitise(prompt);
const anon = await docsorb.guardrails.anonymise(prompt);
docsorb.guardrails.restore(reply, anon.data);
```

## Logging

Pass `actor`, `session`, and `device` to `createClient`, or call `setActor` / `setSession` / `setDevice`.

## Errors

`{ data, error }` — `error` is transport/auth. `data.allowed` is policy.

## Packages

| Package | Registry | Status |
| --- | --- | --- |
| `@docsorb/sdk` | npm | v1 |
| `docsorb` | PyPI | v1 |
| `@docsorb/react` | npm | later |
| `@docsorb/vue` | npm | later |
| `@docsorb/nuxt` | npm | later |
| `@docsorb/ssr` | npm | later |

Framework packages will wrap `@docsorb/sdk`. They will not add a second HTTP client.

Publish from the package directory (`pnpm publish` in `packages/js`, `python -m build` in `packages/python`). This repo root stays private.
