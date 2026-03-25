import { resolveExecutionLocation } from "../lib/execution-location.js";

export async function handleMetaRequest(req, deps = {}) {
  const serviceLocation = resolveExecutionLocation({
    headers: req?.headers,
    env: deps.env ?? process.env
  });

  return {
    statusCode: 200,
    body: { serviceLocation }
  };
}

export default async function handler(req, res) {
  const { statusCode, body } = await handleMetaRequest(req);

  res.statusCode = statusCode;
  res.setHeader("Content-Type", "application/json; charset=utf-8");
  res.setHeader("Cache-Control", "no-store");
  res.end(JSON.stringify(body));
}
