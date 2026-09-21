export type InterventionPoint = "user_input" | "tool_call" | "tool_response" | "output";

export type Metadata = Record<string, unknown>;

export type DocsOrbClientOptions = {
  actor?: Metadata;
  device?: Metadata;
  session?: Metadata;
  request?: Metadata;
  global?: {
    headers?: Record<string, string>;
    fetch?: typeof fetch;
  };
  guardrails?: {
    defaultInterventionPoint?: InterventionPoint;
    locale?: string;
    aiToolId?: string;
  };
};

export type GuardrailCallOptions = {
  interventionPoint?: InterventionPoint;
  locale?: string;
  aiToolId?: string;
  actor?: Metadata;
  device?: Metadata;
  session?: Metadata;
  request?: Metadata;
};

export type EvaluationMatch = {
  guardrailId?: string;
  guardrailTitle?: string;
  controlId?: string;
  controlTitle?: string;
  riskType?: string;
  interventionPoint?: InterventionPoint | string;
  action?: string;
  reason?: string;
  detail?: string;
  layer?: string;
  latencyMs?: number;
};

export type EvaluateResult = {
  allowed: boolean;
  outcome: string;
  actionTaken?: string;
  interventionPoint: string;
  matches: EvaluationMatch[];
  evaluatedAt: string;
  eventId?: string | null;
  userMessage?: string | null;
};

export type RewriteReplacement = {
  type: string;
  replacement: string;
  start: number;
  end: number;
};

export type AnonymiseMappingEntry = {
  token: string;
  type: string;
  original: string;
};

export type RewriteResult = EvaluateResult & {
  text: string;
  changed: boolean;
  replacements: RewriteReplacement[];
  mapping?: AnonymiseMappingEntry[];
};

export type DocsOrbResponse<T> = {
  data: T | null;
  error: DocsOrbErrorLike | null;
};

export type DocsOrbErrorLike = {
  message: string;
  status?: number;
  errorCode?: string | null;
};
