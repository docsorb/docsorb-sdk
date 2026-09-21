<br />
<p align="center">
  <a href="https://docsorb.com">
    <picture>
      <source media="(prefers-color-scheme: dark)" srcset="./assets/docsorb-wordmark-dark.svg">
      <source media="(prefers-color-scheme: light)" srcset="./assets/docsorb-wordmark-light.svg">
      <img alt="DocsOrb Logo" width="300" src="./assets/docsorb-wordmark-light.svg">
    </picture>
  </a>

  <h1 align="center">DocsOrb SDK</h1>

  <p align="center">
    Publishable clients for DocsOrb Guardrails.
    <br />
    <a href="https://help.docsorb.com/ai/guardrails">Guides</a>
    ·
    <a href="https://help.docsorb.com/api/overview">API Reference</a>
    ·
    <a href="./packages/js">TypeScript</a>
    ·
    <a href="./packages/python">Python</a>
  </p>
</p>

<div align="center">

[![npm](https://img.shields.io/npm/v/@docsorb/sdk?label=%40docsorb%2Fsdk)](https://www.npmjs.com/package/@docsorb/sdk)
[![PyPI](https://img.shields.io/pypi/v/docsorb)](https://pypi.org/project/docsorb)
[![License: MIT](https://img.shields.io/badge/license-MIT-blue.svg)](#license)
[![Node](https://img.shields.io/badge/node-%3E%3D18-brightgreen)](./packages/js/package.json)

</div>

## Libraries

This monorepo is what you publish. The APIs live in `docsorb-business`.

| Library | Description | Status |
| --- | --- | --- |
| **[@docsorb/sdk](./packages/js)** | TypeScript / JavaScript client | v1 |
| **[docsorb](./packages/python)** | Python client | v1 |
| **[@docsorb/react](./packages/react)** | React provider and hooks | Coming later |
| **[@docsorb/vue](./packages/vue)** | Vue plugin and composable | Coming later |
| **[@docsorb/nuxt](./packages/nuxt)** | Nuxt module | Coming later |
| **[@docsorb/ssr](./packages/ssr)** | Next.js helpers | Coming later |

Framework packages wrap `@docsorb/sdk`. They do not add a second HTTP client.

## Quick Start

### Installation

```bash
pnpm add @docsorb/sdk
```

```bash
pip install docsorb
```

### Create a client

Auth is the API key. Company is bound to the key. `createClient` / `create_client` does not hit the network.

`DOCSORB_URL` is `https://sdk.docsorb.com`. The key needs the `shield.evaluate` scope.

```ts
import { createClient } from "@docsorb/sdk";

const docsorb = createClient("https://sdk.docsorb.com", process.env.DOCSORB_API_KEY!, {
  actor: { userId: user.id, email: user.email },
});
```

```python
from docsorb import create_client

docsorb = create_client(
    "https://sdk.docsorb.com",
    os.environ["DOCSORB_API_KEY"],
    options={"actor": {"user_id": user.id, "email": user.email}},
)
```

### Guardrails

```ts
const { data, error } = await docsorb.guardrails.evaluate(userPrompt);
if (error) throw error;
if (data.allowed) {
  await model.complete(userPrompt);
}

const cleaned = await docsorb.guardrails.sanitise(userPrompt);
if (cleaned.data?.allowed) await model.complete(cleaned.data.text);

const anon = await docsorb.guardrails.anonymise(userPrompt);
const reply = await model.complete(anon.data!.text);
return docsorb.guardrails.restore(reply, anon.data);
```

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

`sanitize` / `anonymize` are aliases. `isSafe(prompt)` / `is_safe(prompt)` returns a boolean and fails on transport errors.

### Logging

Pass `actor`, `session`, and `device` to `createClient`, or call `setActor` / `setSession` / `setDevice`. Per-call options override those defaults.

```ts
docsorb.setActor({ userId: user.id, email: user.email });
docsorb.setSession({ id: requestId });
```

### Errors

`{ data, error }` — `error` is transport/auth (`missing_scope`, `subscription_required`, 401). `data.allowed` is the policy verdict.

## Requirements

| Runtime | Supported versions |
| --- | --- |
| Node.js | `>= 18` (Active LTS or Maintenance) |
| Browsers | Modern browsers with native `fetch` |
| Python | `>= 3.10` |

When a runtime reaches end-of-life, support may be dropped in a minor release.

## Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Make your changes and add tests
4. Run tests (`pnpm test` for TypeScript, `pytest` in `packages/python`)
5. Open a pull request

Keep framework packages as thin wrappers over `@docsorb/sdk`. Update package READMEs when the public API changes.

## Testing

```bash
pnpm test
```

```bash
cd packages/python
pytest
```

## Documentation

- **[TypeScript SDK](./packages/js/README.md)** — `createClient`, guardrails, errors
- **[Python SDK](./packages/python/README.md)** — `create_client`, guardrails, errors
- **[Guardrails](https://help.docsorb.com/ai/guardrails)** — how enforcement works
- **[API reference](https://help.docsorb.com/api/overview)** — REST API used by these clients
- **[OpenAPI spec](./spec/openapi.yaml)** — evaluate, sanitise, anonymise

Publish from the package directory (`pnpm publish` in `packages/js`, `python -m build` in `packages/python`). This repo root stays private.

## License

This project is licensed under the MIT License.

## Support

- **Website**: [docsorb.com](https://docsorb.com)
- **Documentation**: [help.docsorb.com](https://help.docsorb.com)
- **Issues**: [GitHub Issues](https://github.com/docsorb/docsorb-sdk/issues)
- **Contact**: [docsorb.com/contact](https://docsorb.com/contact)

---

<div align="center">

**[Website](https://docsorb.com) • [Documentation](https://help.docsorb.com) • [Guardrails](https://help.docsorb.com/ai/guardrails) • [LinkedIn](https://www.linkedin.com/company/docsorb)**

</div>
