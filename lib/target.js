const DEFAULT_PROTOCOL = "https:";

function toTrimmedString(value) {
  return String(value ?? "").trim();
}

export function normalizeTarget(input) {
  const trimmed = toTrimmedString(input);
  if (!trimmed) {
    throw new Error("Target is required");
  }

  const withProtocol = /^[a-zA-Z][a-zA-Z\d+\-.]*:\/\//.test(trimmed)
    ? trimmed
    : `${DEFAULT_PROTOCOL}//${trimmed}`;

  const url = new URL(withProtocol);

  if (!["http:", "https:"].includes(url.protocol)) {
    throw new Error("Only http and https targets are supported");
  }

  return url.href;
}

export function classifyFetchError(error) {
  const code = error?.code ?? error?.cause?.code;
  const name = error?.name;
  const message = `${error?.message || ""} ${error?.cause?.message || ""}`.toLowerCase();

  if (name === "AbortError") {
    return "timeout";
  }

  if (
    code === "ENOTFOUND" ||
    code === "EAI_AGAIN" ||
    code === "EAI_FAIL" ||
    code === "ENODATA"
  ) {
    return "dns";
  }

  if (
    code === "ERR_TLS_CERT_ALTNAME_INVALID" ||
    code === "DEPTH_ZERO_SELF_SIGNED_CERT" ||
    code === "CERT_HAS_EXPIRED" ||
    code === "UNABLE_TO_GET_ISSUER_CERT_LOCALLY" ||
    code === "UNABLE_TO_VERIFY_LEAF_SIGNATURE" ||
    code === "SELF_SIGNED_CERT_IN_CHAIN" ||
    message.includes("certificate") ||
    message.includes("issuer")
  ) {
    return "tls";
  }

  if (
    code === "ECONNREFUSED" ||
    code === "ECONNRESET" ||
    code === "ETIMEDOUT" ||
    code === "EHOSTUNREACH" ||
    code === "ENETUNREACH"
  ) {
    return "network";
  }

  return "unknown";
}
