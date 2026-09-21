export { createClient, DocsOrbClient } from "./client.js";
export { DocsOrbError } from "./errors.js";
export { GuardrailsClient } from "./guardrails.js";
export { restoreAnonymisedText } from "./restore.js";
export type {
  AnonymiseMappingEntry,
  DocsOrbClientOptions,
  DocsOrbErrorLike,
  DocsOrbResponse,
  EvaluateResult,
  EvaluationMatch,
  GuardrailCallOptions,
  InterventionPoint,
  Metadata,
  RewriteReplacement,
  RewriteResult,
} from "./types.js";
