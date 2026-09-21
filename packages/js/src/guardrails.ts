import { DocsOrbError } from "./errors.js";
import { restoreAnonymisedText } from "./restore.js";
import type { DocsOrbClient } from "./client.js";
import type {
  EvaluateResult,
  GuardrailCallOptions,
  RewriteResult,
} from "./types.js";

export class GuardrailsClient {
  #client: DocsOrbClient;

  constructor(client: DocsOrbClient) {
    this.#client = client;
  }

  evaluate(content: string, options?: GuardrailCallOptions) {
    return this.#client.request<EvaluateResult>(
      "/guardrails/evaluate",
      this.#body(content, options),
    );
  }

  sanitise(content: string, options?: GuardrailCallOptions) {
    return this.#client.request<RewriteResult>(
      "/guardrails/sanitise",
      this.#body(content, options),
    );
  }

  sanitize(content: string, options?: GuardrailCallOptions) {
    return this.sanitise(content, options);
  }

  anonymise(content: string, options?: GuardrailCallOptions) {
    return this.#client.request<RewriteResult>(
      "/guardrails/anonymise",
      this.#body(content, options),
    );
  }

  anonymize(content: string, options?: GuardrailCallOptions) {
    return this.anonymise(content, options);
  }

  restore(text: string, result: Pick<RewriteResult, "mapping"> | RewriteResult["mapping"]) {
    const mapping = Array.isArray(result) ? result : result?.mapping;
    return restoreAnonymisedText(text, mapping);
  }

  async isSafe(content: string, options?: GuardrailCallOptions) {
    const { data, error } = await this.evaluate(content, options);
    if (error) throw error instanceof DocsOrbError ? error : new DocsOrbError(error.message, error);
    return Boolean(data?.allowed);
  }

  #body(content: string, options: GuardrailCallOptions = {}) {
    const defaults = this.#client.guardrailsDefaults();
    return {
      content,
      interventionPoint: options.interventionPoint ?? defaults.defaultInterventionPoint ?? "user_input",
      locale: options.locale ?? defaults.locale,
      aiToolId: options.aiToolId ?? defaults.aiToolId,
      ...this.#client.mergeMetadata(options),
    };
  }
}
