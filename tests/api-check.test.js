import test from "node:test";
import assert from "node:assert/strict";
import { handleCheckRequest } from "../api/check.js";

test("handleCheckRequest returns 400 when target is missing", async () => {
  const result = await handleCheckRequest({
    method: "GET",
    query: {},
    body: {}
  });

  assert.equal(result.statusCode, 400);
  assert.equal(result.body.error, "Target is required");
});

test("handleCheckRequest forwards the target to the checker", async () => {
  let seenTarget = "";

  const result = await handleCheckRequest(
    {
      method: "GET",
      query: { target: "example.com" },
      body: {}
    },
    {
      checkTarget: async (target) => {
        seenTarget = target;
        return { ok: true };
      }
    }
  );

  assert.equal(seenTarget, "example.com");
  assert.equal(result.statusCode, 200);
  assert.deepEqual(result.body, { ok: true });
});
