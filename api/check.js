import { checkTarget } from "../lib/check.js";

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
  const target = extractTarget(req);

  if (!target.trim()) {
    return {
      statusCode: 400,
      body: { error: "Target is required" }
    };
  }

  try {
    const result = await runCheck(target, deps);

    return {
      statusCode: 200,
      body: result
    };
  } catch (error) {
    return {
      statusCode: 500,
      body: {
        error: error?.message || "Request failed"
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
