import { describe, expect, it, vi } from "vitest";
import { createClient, DocsOrbError } from "../src/index.js";

function jsonResponse(status: number, body: unknown) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { "content-type": "application/json" },
  });
}

describe("createClient", () => {
  it("rejects a missing url or key", () => {
    expect(() => createClient("", "do_live_x")).toThrow(DocsOrbError);
    expect(() => createClient("https://sdk.docsorb.com", "")).toThrow(DocsOrbError);
  });

  it("sends client actor metadata on evaluate", async () => {
    const fetchMock = vi.fn().mockResolvedValue(
      jsonResponse(200, { allowed: true, outcome: "allowed", matches: [], interventionPoint: "user_input", evaluatedAt: "2026-01-01T00:00:00.000Z" }),
    );

    const docsorb = createClient("https://sdk.docsorb.com", "do_live_test", {
      actor: { userId: "u1", email: "jane@acme.com" },
      session: { id: "s1" },
      global: { fetch: fetchMock },
    });

    const { data, error } = await docsorb.guardrails.evaluate("hello");
    expect(error).toBeNull();
    expect(data?.allowed).toBe(true);

    expect(fetchMock).toHaveBeenCalledTimes(1);
    const [url, init] = fetchMock.mock.calls[0]!;
    expect(url).toBe("https://sdk.docsorb.com/api/v1/guardrails/evaluate");
    expect((init as RequestInit).headers).toMatchObject({
      authorization: "Bearer do_live_test",
    });
    const body = JSON.parse(String((init as RequestInit).body));
    expect(body.actorMetadata).toEqual({ userId: "u1", email: "jane@acme.com" });
    expect(body.sessionMetadata).toEqual({ id: "s1" });
    expect(body.interventionPoint).toBe("user_input");
  });

  it("lets a per-call actor override the client default", async () => {
    const fetchMock = vi.fn().mockResolvedValue(
      jsonResponse(200, { allowed: true, outcome: "allowed", matches: [], interventionPoint: "user_input", evaluatedAt: "2026-01-01T00:00:00.000Z" }),
    );
    const docsorb = createClient("https://sdk.docsorb.com", "do_live_test", {
      actor: { userId: "u1" },
      global: { fetch: fetchMock },
    });

    await docsorb.guardrails.evaluate("hello", { actor: { userId: "u2" } });
    const body = JSON.parse(String((fetchMock.mock.calls[0]![1] as RequestInit).body));
    expect(body.actorMetadata).toEqual({ userId: "u2" });
  });

  it("returns { data: null, error } on 401", async () => {
    const fetchMock = vi.fn().mockResolvedValue(
      jsonResponse(401, { message: "Unauthorized", data: { errorCode: "unauthorized" } }),
    );
    const docsorb = createClient("https://sdk.docsorb.com", "do_live_test", {
      global: { fetch: fetchMock },
    });

    const { data, error } = await docsorb.guardrails.evaluate("hello");
    expect(data).toBeNull();
    expect(error?.status).toBe(401);
    expect(error?.errorCode).toBe("unauthorized");
  });

  it("isSafe throws on transport errors and returns allowed", async () => {
    const fetchMock = vi
      .fn()
      .mockResolvedValueOnce(jsonResponse(403, { message: "Missing scope", data: { errorCode: "missing_scope" } }))
      .mockResolvedValueOnce(
        jsonResponse(200, { allowed: false, outcome: "blocked", matches: [], interventionPoint: "user_input", evaluatedAt: "2026-01-01T00:00:00.000Z" }),
      );

    const docsorb = createClient("https://sdk.docsorb.com", "do_live_test", {
      global: { fetch: fetchMock },
    });

    await expect(docsorb.guardrails.isSafe("x")).rejects.toBeInstanceOf(DocsOrbError);
    await expect(docsorb.guardrails.isSafe("x")).resolves.toBe(false);
  });

  it("restores anonymised text from the mapping", () => {
    const docsorb = createClient("https://sdk.docsorb.com", "do_live_test");
    expect(
      docsorb.guardrails.restore("Hi [EMAIL_1]", {
        mapping: [{ token: "[EMAIL_1]", type: "EMAIL", original: "jane@acme.com" }],
      }),
    ).toBe("Hi jane@acme.com");
  });
});
