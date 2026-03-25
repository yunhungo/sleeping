const REGION_LABELS = {
  iad1: "Washington, D.C., USA",
  cle1: "Cleveland, USA",
  pdx1: "Portland, USA",
  sfo1: "San Francisco, USA",
  dub1: "Dublin, Ireland",
  lhr1: "London, UK",
  cdg1: "Paris, France",
  fra1: "Frankfurt, Germany",
  bru1: "Brussels, Belgium",
  arn1: "Stockholm, Sweden",
  gru1: "São Paulo, Brazil",
  hnd1: "Tokyo, Japan",
  kix1: "Osaka, Japan",
  icn1: "Seoul, South Korea",
  bom1: "Mumbai, India",
  hkg1: "Hong Kong, China",
  syd1: "Sydney, Australia",
  sin1: "Singapore",
  cpt1: "Cape Town, South Africa"
};

function normalizeHeaderName(name) {
  return String(name || "").toLowerCase();
}

function getHeader(headers, key) {
  if (!headers) {
    return "";
  }

  const normalizedKey = normalizeHeaderName(key);

  if (typeof headers.get === "function") {
    return headers.get(key) || headers.get(normalizedKey) || "";
  }

  return headers[key] || headers[normalizedKey] || "";
}

function extractRegionCodeFromVercelId(vercelId) {
  const value = String(vercelId || "").trim();
  if (!value) {
    return null;
  }

  const segments = value.split("::").filter(Boolean);
  const regionLike = [...segments].reverse().find((segment) => /^[a-z]{3}\d$/i.test(segment));
  return regionLike || segments[0] || null;
}

export function resolveExecutionLocation({ headers = {}, env = process.env } = {}) {
  const headerRegion = extractRegionCodeFromVercelId(getHeader(headers, "x-vercel-id"));
  const regionCode = headerRegion || env?.VERCEL_REGION || null;

  if (!regionCode) {
    return {
      regionCode: null,
      locationLabel: "Local / Unknown",
      displayLabel: "Local / Unknown"
    };
  }

  const locationLabel = REGION_LABELS[regionCode] || "Unknown region";

  return {
    regionCode,
    locationLabel,
    displayLabel: `${regionCode} · ${locationLabel}`
  };
}
