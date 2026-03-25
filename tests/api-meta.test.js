import test from "node:test";
import assert from "node:assert/strict";
import { handleMetaRequest } from "../api/meta.js";

test("handleMetaRequest returns service location", async () => {
  const result = await handleMetaRequest({
    headers: { "x-vercel-id": "iad1::abc123" }
  });

  assert.equal(result.statusCode, 200);
  assert.equal(result.body.serviceLocation.regionCode, "iad1");
});
