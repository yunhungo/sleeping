import net from "node:net";
import { lookup as dnsLookup } from "node:dns/promises";
import { normalizeTarget } from "./target.js";

function createTimeoutSignal(timeoutMs) {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeoutMs);
  return { controller, timer };
}

function isLocalHostname(hostname) {
  const value = String(hostname || "").toLowerCase();
  return (
    value === "localhost" ||
    value === "::1" ||
    value.endsWith(".localhost")
  );
}

function isPrivateIpv4(ip) {
  const [a, b] = ip.split(".").map((part) => Number(part));
  if ([a, b].some((part) => Number.isNaN(part))) {
    return false;
  }

  return (
    a === 10 ||
    (a === 172 && b >= 16 && b <= 31) ||
    (a === 192 && b === 168) ||
    a === 127 ||
    (a === 169 && b === 254)
  );
}

function isPrivateIpv6(ip) {
  const value = String(ip || "").toLowerCase();
  return (
    value === "::1" ||
    value.startsWith("fc") ||
    value.startsWith("fd") ||
    value.startsWith("fe80")
  );
}

function isPrivateAddress(address) {
  if (!address) {
    return false;
  }

  if (net.isIP(address) === 4) {
    return isPrivateIpv4(address);
  }

  if (net.isIP(address) === 6) {
    return isPrivateIpv6(address);
  }

  return false;
}

function formatLocationLabel(data, fallbackIp) {
  const city = String(data?.city || "").trim();
  const region = String(data?.region || data?.region_name || "").trim();
  const country = String(data?.country_name || data?.country || "").trim();
  const parts = [city, region, country].filter(Boolean);

  if (parts.length) {
    return parts.join(", ");
  }

  return fallbackIp || "Unknown location";
}

async function geolocateIp(ip, options = {}) {
  const { fetchImpl = fetch, timeoutMs = 4000 } = options;
  const { controller, timer } = createTimeoutSignal(timeoutMs);

  try {
    const response = await fetchImpl(`https://ipapi.co/${ip}/json/`, {
      signal: controller.signal,
      headers: {
        Accept: "application/json"
      }
    });

    if (!response.ok) {
      return null;
    }

    const payload = await response.json();
    return {
      ip,
      city: payload?.city || null,
      region: payload?.region || payload?.region_name || null,
      country: payload?.country_name || payload?.country || null,
      displayLabel: formatLocationLabel(payload, ip),
      kind: "public"
    };
  } catch {
    return null;
  } finally {
    clearTimeout(timer);
  }
}

export async function resolveTargetLocation(input, options = {}) {
  const {
    dnsLookup: lookup = dnsLookup,
    fetchImpl = fetch,
    timeoutMs = 4000
  } = options;

  let url;
  try {
    url = new URL(normalizeTarget(input));
  } catch {
    return {
      kind: "unknown",
      ip: null,
      displayLabel: "Unknown location"
    };
  }

  const hostname = url.hostname;

  if (isLocalHostname(hostname) || isPrivateAddress(hostname)) {
    return {
      kind: "local",
      ip: hostname,
      displayLabel: "Local / Private"
    };
  }

  let ip = hostname;
  if (net.isIP(hostname) === 0) {
    try {
      const lookupResult = await lookup(hostname);
      ip = lookupResult?.address || null;
    } catch {
      return {
        kind: "unknown",
        ip: null,
        displayLabel: "Unknown location"
      };
    }
  }

  if (!ip) {
    return {
      kind: "unknown",
      ip: null,
      displayLabel: "Unknown location"
    };
  }

  if (isPrivateAddress(ip)) {
    return {
      kind: "local",
      ip,
      displayLabel: "Local / Private"
    };
  }

  const geolocated = await geolocateIp(ip, { fetchImpl, timeoutMs });
  if (geolocated) {
    return geolocated;
  }

  return {
    kind: "public",
    ip,
    displayLabel: ip
  };
}
