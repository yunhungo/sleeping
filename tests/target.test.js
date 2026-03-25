import test from "node:test";
import assert from "node:assert/strict";
import { classifyFetchError, normalizeTarget } from "../lib/target.js";

test("normalizeTarget adds https when the scheme is missing", () => {
  assert.equal(normalizeTarget("example.com"), "https://example.com/");
});

test("classifyFetchError recognizes timeout errors", () => {
  const error = new Error("The operation was aborted");
  error.name = "AbortError";

  assert.equal(classifyFetchError(error), "timeout");
});

test("classifyFetchError recognizes tls errors from fetch causes", () => {
  const error = new TypeError("fetch failed");
  error.cause = new Error("unable to get local issuer certificate");
  error.cause.code = "UNABLE_TO_GET_ISSUER_CERT_LOCALLY";

  assert.equal(classifyFetchError(error), "tls");
});
