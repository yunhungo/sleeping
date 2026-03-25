import test from "node:test";
import assert from "node:assert/strict";
import { resolveTargetLocation } from "../lib/target-location.js";

test("resolveTargetLocation labels direct ip addresses", async () => {
  const result = await resolveTargetLocation("https://8.8.8.8", {
    fetchImpl: async () => ({
      ok: true,
      json: async () => ({
        ip: "8.8.8.8",
        city: "Mountain View",
        region: "California",
        country_name: "United States"
      })
    })
  });

  assert.equal(result.ip, "8.8.8.8");
  assert.equal(result.displayLabel, "Mountain View, California, United States");
});

test("resolveTargetLocation resolves hostnames through dns and geolocation", async () => {
  const result = await resolveTargetLocation("https://example.com", {
    dnsLookup: async () => ({ address: "93.184.216.34" }),
    fetchImpl: async () => ({
      ok: true,
      json: async () => ({
        ip: "93.184.216.34",
        city: "Los Angeles",
        region: "California",
        country_name: "United States"
      })
    })
  });

  assert.equal(result.ip, "93.184.216.34");
  assert.equal(result.displayLabel, "Los Angeles, California, United States");
});

test("resolveTargetLocation falls back to local addresses", async () => {
  const result = await resolveTargetLocation("http://localhost:3000", {});

  assert.equal(result.kind, "local");
  assert.equal(result.displayLabel, "Local / Private");
});
