import test from "node:test";
import assert from "node:assert/strict";
import { checkTarget } from "../lib/check.js";

test("checkTarget returns a reachable result for a successful response", async () => {
  const result = await checkTarget("example.com", {
    fetchImpl: async () => ({
      ok: true,
      status: 200,
      url: "https://example.com/",
      headers: new Headers({ "content-type": "text/html" })
    }),
    now: () => 10
  });

  assert.equal(result.ok, true);
  assert.equal(result.reachable, true);
  assert.equal(result.statusCode, 200);
  assert.equal(result.finalUrl, "https://example.com/");
  assert.equal(result.elapsedMs, 0);
});
