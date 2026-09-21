import type { DocsOrbErrorLike } from "./types.js";

export class DocsOrbError extends Error implements DocsOrbErrorLike {
  status?: number;
  errorCode?: string | null;

  constructor(message: string, options: { status?: number; errorCode?: string | null } = {}) {
    super(message);
    this.name = "DocsOrbError";
    this.status = options.status;
    this.errorCode = options.errorCode ?? null;
  }

  static fromResponse(status: number, body: unknown) {
    const record = body && typeof body === "object" ? (body as Record<string, unknown>) : {};
    const data = record.data && typeof record.data === "object" ? (record.data as Record<string, unknown>) : {};
    const message = String(record.message ?? record.statusMessage ?? `Request failed (${status})`);
    const errorCode = String(data.errorCode ?? record.errorCode ?? "") || null;
    return new DocsOrbError(message, { status, errorCode });
  }

  static fromNetwork(error: unknown) {
    const message = error instanceof Error ? error.message : String(error);
    return new DocsOrbError(message);
  }
}
