import { classifyFetchError, normalizeTarget } from "./target.js";

function createTimeoutSignal(timeoutMs) {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeoutMs);
  return { controller, timer };
}

export async function checkTarget(input, options = {}) {
  const {
    fetchImpl = fetch,
    now = Date.now,
    timeoutMs = 8000
  } = options;

  const target = normalizeTarget(input);
  const startedAt = now();
  const { controller, timer } = createTimeoutSignal(timeoutMs);

  try {
    const response = await fetchImpl(target, {
      method: "GET",
      redirect: "follow",
      signal: controller.signal
    });

    const endedAt = now();

    return {
      ok: response.ok,
      reachable: true,
      target,
      finalUrl: response.url || target,
      statusCode: response.status,
      elapsedMs: Math.max(0, endedAt - startedAt),
      error: null,
      errorType: null
    };
  } catch (error) {
    const endedAt = now();

    return {
      ok: false,
      reachable: false,
      target,
      finalUrl: null,
      statusCode: null,
      elapsedMs: Math.max(0, endedAt - startedAt),
      error: error?.message || "Request failed",
      errorType: classifyFetchError(error)
    };
  } finally {
    clearTimeout(timer);
  }
}
