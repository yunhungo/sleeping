import { checkTarget } from "../lib/check.js";
import { resolveExecutionLocation } from "../lib/execution-location.js";
import { resolveTargetLocation } from "../lib/target-location.js";

function extractTarget(req) {
  const queryTarget = req?.query?.target;
  if (queryTarget) {
    return String(queryTarget);
  }

  const body = req?.body;
  if (!body) {
    return "";
  }

  if (typeof body === "string") {
    try {
      const parsed = JSON.parse(body);
      return String(parsed?.target ?? "");
    } catch {
      return "";
    }
  }

  return String(body?.target ?? "");
}

export async function handleCheckRequest(req, deps = {}) {
  const runCheck = deps.checkTarget ?? checkTarget;
  const runTargetLocation = deps.resolveTargetLocation ?? resolveTargetLocation;
  const serviceLocation = resolveExecutionLocation({
    headers: req?.headers,
    env: deps.env ?? process.env
  });
  const target = extractTarget(req);

  if (!target.trim()) {
    return {
      statusCode: 400,
      body: { error: "Target is required", serviceLocation }
    };
  }

  try {
    const [result, targetLocation] = await Promise.all([
      runCheck(target, deps),
      runTargetLocation(target, deps)
    ]);

    return {
      statusCode: 200,
      body: {
        ...result,
        serviceLocation,
        targetLocation
      }
    };
  } catch (error) {
    return {
      statusCode: 500,
      body: {
        error: error?.message || "Request failed",
        serviceLocation,
        targetLocation: {
          kind: "unknown",
          ip: null,
          displayLabel: "Unknown location"
        }
      }
    };
  }
}

export default async function handler(req, res) {
  const { statusCode, body } = await handleCheckRequest(req);

  res.statusCode = statusCode;
  res.setHeader("Content-Type", "application/json; charset=utf-8");
  res.setHeader("Cache-Control", "no-store");
  res.end(JSON.stringify(body));
}
