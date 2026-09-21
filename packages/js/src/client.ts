import { DocsOrbError } from "./errors.js";
import { GuardrailsClient } from "./guardrails.js";
import type {
  DocsOrbClientOptions,
  DocsOrbResponse,
  GuardrailCallOptions,
  Metadata,
} from "./types.js";

export class DocsOrbClient {
  readonly guardrails: GuardrailsClient;

  #baseUrl: string;
  #apiKey: string;
  #fetch: typeof fetch;
  #headers: Record<string, string>;
  #actor: Metadata;
  #device: Metadata;
  #session: Metadata;
  #request: Metadata;
  #guardrailsDefaults: NonNullable<DocsOrbClientOptions["guardrails"]>;

  constructor(docsorbUrl: string, docsorbKey: string, options: DocsOrbClientOptions = {}) {
    this.#baseUrl = normalizeBaseUrl(docsorbUrl);
    this.#apiKey = docsorbKey;
    this.#fetch = options.global?.fetch ?? fetch;
    this.#headers = { ...(options.global?.headers ?? {}) };
    this.#actor = { ...(options.actor ?? {}) };
    this.#device = { ...(options.device ?? {}) };
    this.#session = { ...(options.session ?? {}) };
    this.#request = { ...(options.request ?? {}) };
    this.#guardrailsDefaults = { ...(options.guardrails ?? {}) };
    this.guardrails = new GuardrailsClient(this);
  }

  setActor(actor: Metadata) {
    this.#actor = { ...this.#actor, ...actor };
  }

  setSession(session: Metadata) {
    this.#session = { ...this.#session, ...session };
  }

  setDevice(device: Metadata) {
    this.#device = { ...this.#device, ...device };
  }

  guardrailsDefaults() {
    return this.#guardrailsDefaults;
  }

  async request<T>(path: string, body: Record<string, unknown>): Promise<DocsOrbResponse<T>> {
    try {
      const response = await this.#fetch(`${this.#baseUrl}${path}`, {
        method: "POST",
        headers: {
          authorization: `Bearer ${this.#apiKey}`,
          "content-type": "application/json",
          ...this.#headers,
        },
        body: JSON.stringify(body),
      });
      const payload = await readJson(response);
      if (!response.ok) {
        return { data: null, error: DocsOrbError.fromResponse(response.status, payload) };
      }
      return { data: payload as T, error: null };
    } catch (error) {
      return { data: null, error: DocsOrbError.fromNetwork(error) };
    }
  }

  mergeMetadata(call: GuardrailCallOptions = {}) {
    return {
      actorMetadata: { ...this.#actor, ...(call.actor ?? {}) },
      deviceMetadata: { ...this.#device, ...(call.device ?? {}) },
      sessionMetadata: { ...this.#session, ...(call.session ?? {}) },
      requestMetadata: { ...this.#request, ...(call.request ?? {}) },
    };
  }
}

export function createClient(
  docsorbUrl: string,
  docsorbKey: string,
  options?: DocsOrbClientOptions,
) {
  if (!String(docsorbUrl || "").trim()) {
    throw new DocsOrbError("docsorbUrl is required.");
  }
  if (!String(docsorbKey || "").trim()) {
    throw new DocsOrbError("docsorbKey is required.");
  }
  return new DocsOrbClient(docsorbUrl, docsorbKey, options);
}

function normalizeBaseUrl(url: string) {
  const trimmed = url.trim().replace(/\/+$/, "");
  if (trimmed.endsWith("/api/v1")) return trimmed;
  return `${trimmed}/api/v1`;
}

async function readJson(response: Response) {
  const text = await response.text();
  if (!text) return {};
  try {
    return JSON.parse(text);
  } catch {
    return { message: text };
  }
}
