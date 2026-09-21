# `@docsorb/sdk`

DocsOrb Guardrails for TypeScript and JavaScript.

## Install

```bash
pnpm add @docsorb/sdk
```

## Initializing

Auth happens in `createClient`. No network call is made until you use a tool.

```ts
import { createClient } from "@docsorb/sdk";

const docsorb = createClient(process.env.DOCSORB_URL!, process.env.DOCSORB_API_KEY!, {
  actor: { userId: user.id, email: user.email },
});
```

`DOCSORB_URL` is usually `https://api.docsorb.com`. The key needs the `shield.evaluate` scope.

## Guardrails

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

`sanitize` / `anonymize` are aliases. `isSafe(prompt)` returns a boolean and throws on transport errors.

## Logging

Set actor, session, and device on the client so every call is attributed.

```ts
docsorb.setActor({ userId: user.id, email: user.email });
docsorb.setSession({ id: requestId });
```

Per-call options override those defaults.

## Errors

`{ data, error }` — `error` is auth/network (`missing_scope`, `subscription_required`, 401). `data.allowed` is the policy verdict.
