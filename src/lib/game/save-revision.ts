/** Monotonic per-save revision used as an optimistic concurrency guard.
 * A reset must advance this value so older browser tabs cannot restore old progress.
 */
export function nextSaveRevision(previous: string | null): string {
  const prior = previous === null ? NaN : Date.parse(previous);
  return new Date(Math.max(Date.now(), Number.isFinite(prior) ? prior + 1 : 0)).toISOString();
}
