const form = document.querySelector("#check-form");
const targetInput = document.querySelector("#target");
const submitButton = document.querySelector("#submit-button");
const statusEl = document.querySelector("#status");
const resultEl = document.querySelector("#result");
const resultTitle = document.querySelector("#result-title");
const resultBadge = document.querySelector("#result-badge");
const metricReachable = document.querySelector("#metric-reachable");
const metricStatus = document.querySelector("#metric-status");
const metricElapsed = document.querySelector("#metric-elapsed");
const metricUrl = document.querySelector("#metric-url");
const detailTarget = document.querySelector("#detail-target");
const detailErrorType = document.querySelector("#detail-error-type");
const detailError = document.querySelector("#detail-error");
const copyLinkButton = document.querySelector("#copy-link");
const resetButton = document.querySelector("#reset-button");

const chips = [...document.querySelectorAll(".chip")];

let lastTarget = "";

function setStatus(message, tone = "idle") {
  statusEl.className = `status ${tone}`;
  statusEl.textContent = message;
}

function setBadge(tone, text) {
  resultBadge.className = `badge ${tone}`;
  resultBadge.textContent = text;
}

function formatReachable(result) {
  if (result.reachable) {
    return result.ok ? "可达且 2xx" : "可达但非 2xx";
  }

  return "不可达";
}

function formatElapsed(ms) {
  if (typeof ms !== "number" || Number.isNaN(ms)) {
    return "-";
  }

  return `${ms} ms`;
}

function showResult(result, originalTarget) {
  resultEl.classList.remove("hidden");
  lastTarget = originalTarget;
  detailTarget.textContent = originalTarget;
  resultTitle.textContent = result.ok ? "请求成功" : "请求完成但返回异常";
  metricReachable.textContent = formatReachable(result);
  metricStatus.textContent = result.statusCode ?? "-";
  metricElapsed.textContent = formatElapsed(result.elapsedMs);
  metricUrl.textContent = result.finalUrl ?? "-";
  detailErrorType.textContent = result.errorType ?? "-";
  detailError.textContent = result.error ?? "-";

  if (result.ok) {
    setBadge("success", "reachable");
    setStatus(`目标可达，${result.statusCode}，耗时 ${result.elapsedMs} ms`, "success");
    return;
  }

  if (result.reachable) {
    setBadge("warning", "http issue");
    setStatus(`连通了，但 HTTP 返回 ${result.statusCode}。`, "error");
    return;
  }

  setBadge("error", "unreachable");
  setStatus(`请求失败：${result.errorType || "unknown"}`, "error");
}

function showError(message) {
  resultEl.classList.remove("hidden");
  setBadge("error", "error");
  resultTitle.textContent = "检查失败";
  metricReachable.textContent = "-";
  metricStatus.textContent = "-";
  metricElapsed.textContent = "-";
  metricUrl.textContent = "-";
  detailTarget.textContent = lastTarget || "-";
  detailErrorType.textContent = "-";
  detailError.textContent = message;
  setStatus(message, "error");
}

function setLoading(isLoading) {
  submitButton.disabled = isLoading;
  targetInput.disabled = isLoading;
  submitButton.textContent = isLoading ? "检查中..." : "开始检查";
}

async function runCheck(target) {
  setLoading(true);
  setStatus("正在检查外部可达性...", "loading");

  try {
    const response = await fetch("/api/check", {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({ target })
    });

    const payload = await response.json();

    if (!response.ok) {
      throw new Error(payload?.error || "Request failed");
    }

    showResult(payload, target);
  } catch (error) {
    showError(error?.message || "Request failed");
  } finally {
    setLoading(false);
  }
}

function buildShareUrl(target) {
  const url = new URL(window.location.href);
  url.searchParams.set("target", target);
  return url.toString();
}

form.addEventListener("submit", (event) => {
  event.preventDefault();
  const target = targetInput.value.trim();

  if (!target) {
    showError("请输入一个目标地址。");
    return;
  }

  runCheck(target);
});

chips.forEach((chip) => {
  chip.addEventListener("click", () => {
    targetInput.value = chip.dataset.target || "";
    targetInput.focus();
  });
});

copyLinkButton.addEventListener("click", async () => {
  if (!lastTarget) {
    showError("先完成一次检查再复制分享链接。");
    return;
  }

  const shareUrl = buildShareUrl(lastTarget);

  try {
    await navigator.clipboard.writeText(shareUrl);
    setStatus("分享链接已复制。", "success");
  } catch {
    setStatus(`分享链接：${shareUrl}`, "idle");
  }
});

resetButton.addEventListener("click", () => {
  targetInput.value = "";
  lastTarget = "";
  resultEl.classList.add("hidden");
  setStatus("准备好了，输入一个地址开始检测。", "idle");
  targetInput.focus();
});

const initialTarget = new URLSearchParams(window.location.search).get("target");

if (initialTarget) {
  targetInput.value = initialTarget;
  runCheck(initialTarget);
} else {
  setStatus("准备好了，输入一个地址开始检测。", "idle");
}
