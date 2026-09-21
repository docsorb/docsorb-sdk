/** Shared request/response types for language SDKs. Source of truth: openapi.yaml */

export type InterventionPoint = "user_input" | "tool_call" | "tool_response" | "output";

export type GuardrailContentRequest = {
  content: string;
  interventionPoint?: InterventionPoint;
  aiToolId?: string;
  locale?: string;
  actorMetadata?: Record<string, unknown>;
  deviceMetadata?: Record<string, unknown>;
  sessionMetadata?: Record<string, unknown>;
  requestMetadata?: Record<string, unknown>;
};
