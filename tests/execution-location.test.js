import test from "node:test";
import assert from "node:assert/strict";
import { resolveExecutionLocation } from "../lib/execution-location.js";

test("resolveExecutionLocation uses VERCEL_REGION when available", () => {
  const result = resolveExecutionLocation({
    env: { VERCEL_REGION: "fra1" }
  });

  assert.equal(result.regionCode, "fra1");
  assert.equal(result.locationLabel, "Frankfurt, Germany");
  assert.equal(result.displayLabel, "fra1 · Frankfurt, Germany");
});

test("resolveExecutionLocation parses x-vercel-id when present", () => {
  const result = resolveExecutionLocation({
    headers: { "x-vercel-id": "sfo1::abc123" }
  });

  assert.equal(result.regionCode, "sfo1");
  assert.equal(result.locationLabel, "San Francisco, USA");
});

test("resolveExecutionLocation falls back to local unknown when missing", () => {
  const result = resolveExecutionLocation();

  assert.equal(result.regionCode, null);
  assert.equal(result.locationLabel, "Local / Unknown");
  assert.equal(result.displayLabel, "Local / Unknown");
});
