import type { AnonymiseMappingEntry } from "./types.js";

export function restoreAnonymisedText(
  text: string,
  mapping: Array<Pick<AnonymiseMappingEntry, "token" | "original">> | undefined,
) {
  const entries = [...(mapping ?? [])]
    .filter((entry) => entry.token && entry.original)
    .sort((left, right) => right.token.length - left.token.length);

  let restored = text;
  for (const entry of entries) {
    restored = restored.split(entry.token).join(entry.original);
  }
  return restored;
}
