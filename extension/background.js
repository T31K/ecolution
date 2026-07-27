// Prefers a locally running main-server, falls back to prod (same database).
const API_BASES = ["http://localhost:3001", "https://api.kaleidoscopical.com"];
const INGEST_SECRET = "ad0a93bdf3ebe6de5d520ff544223db43bc545f6bfe8ec52";

/**
 * In-page toast instead of chrome.notifications — macOS routinely suppresses
 * extension notifications, and the whole point is instant feedback.
 */
function showToast(tabId, kind, title, message) {
  chrome.scripting.executeScript({
    target: { tabId },
    args: [kind, title, message],
    func: (kind, title, message) => {
      const existing = document.getElementById("ecolution-toast");
      if (existing) existing.remove();
      const el = document.createElement("div");
      el.id = "ecolution-toast";
      el.style.cssText = [
        "position:fixed",
        "top:24px",
        "right:24px",
        "z-index:2147483647",
        "max-width:380px",
        "padding:16px 20px",
        "border-radius:12px",
        "font:14px/1.45 -apple-system,system-ui,sans-serif",
        "color:#fff",
        "box-shadow:0 8px 30px rgba(0,0,0,.35)",
        `background:${kind === "ok" ? "#15803d" : kind === "wait" ? "#334155" : "#b91c1c"}`,
        "transition:opacity .3s",
      ].join(";");
      el.innerHTML = `<div style="font-weight:700;margin-bottom:2px">${title}</div><div style="opacity:.9">${message}</div>`;
      document.documentElement.appendChild(el);
      if (kind !== "wait") {
        setTimeout(() => {
          el.style.opacity = "0";
          setTimeout(() => el.remove(), 350);
        }, 4500);
      }
    },
  }).catch(() => {
    // Restricted page (chrome://, PDF viewer) — fall back to badge only.
  });
}

async function postIngest(payload) {
  let lastError = "no API reachable";
  for (const base of API_BASES) {
    try {
      const res = await fetch(`${base}/decarbon/ingest`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${INGEST_SECRET}`,
        },
        body: JSON.stringify(payload),
      });
      const data = await res.json();
      if (res.ok && data.ok) return data;
      lastError = `${base.includes("localhost") ? "local" : "prod"}: ${data.error || `HTTP ${res.status}`}`;
      // Auth/validation errors won't improve on the fallback host — stop.
      if (res.status === 400 || res.status === 401) break;
    } catch (err) {
      lastError = `${base.includes("localhost") ? "local" : "prod"}: ${err.message}`;
    }
  }
  throw new Error(lastError);
}

async function captureFromActiveTab() {
  const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
  if (!tab?.id) return;

  // A manual selection wins; otherwise capture the whole page's visible text
  // and let the server-side parser find the job in it.
  let selection = "";
  try {
    const [{ result }] = await chrome.scripting.executeScript({
      target: { tabId: tab.id },
      func: () => {
        const text =
          window.getSelection().toString().trim() ||
          document.body.innerText.slice(0, 40000);
        // Company logo: the real <img> on the page beats og:image, which job
        // boards fill with a generic share card. Skip data: URIs and icons.
        const usable = (img) =>
          img?.src?.startsWith("http") &&
          img.naturalWidth >= 40 &&
          img.naturalHeight >= 40;
        const logoImg = [
          ...document.querySelectorAll(
            'img[class*="logo" i], img[alt*="logo" i], aside img, [class*="sidebar" i] img, [class*="company" i] img',
          ),
        ].find(usable);
        const og = document.querySelector('meta[property="og:image"]');
        const logo = logoImg?.src || og?.content || "";
        // All links so the server can pick the true apply URL.
        const links = [...document.querySelectorAll("a[href]")]
          .map((a) => ({ text: a.innerText.trim().slice(0, 80), href: a.href }))
          .filter((l) => l.text && l.href.startsWith("http"))
          .slice(0, 80);
        return { text, logo, links };
      },
    });
    selection = result?.text || "";
    var pageMeta = { logo: result?.logo || "", links: result?.links || [] };
  } catch {
    return; // restricted page — nothing we can do
  }

  if (!selection.trim()) {
    showToast(tab.id, "err", "Empty page", "Couldn't read any text from this page.");
    return;
  }

  chrome.action.setBadgeText({ text: "…" });
  showToast(tab.id, "wait", "Capturing job…", "Parsing the listing with AI, ~5 seconds.");
  try {
    const data = await postIngest({
      selection,
      url: tab.url,
      title: tab.title,
      logo: pageMeta.logo,
      links: pageMeta.links,
    });
    chrome.action.setBadgeBackgroundColor({ color: "#16a34a" });
    chrome.action.setBadgeText({ text: "✓" });
    showToast(
      tab.id,
      "ok",
      data.duplicate ? "Already captured — updated ✓" : "Job captured ✓",
      `${data.job.title} @ ${data.job.company}`,
    );
  } catch (err) {
    chrome.action.setBadgeBackgroundColor({ color: "#dc2626" });
    chrome.action.setBadgeText({ text: "✗" });
    showToast(tab.id, "err", "Capture failed", err.message);
  }
  setTimeout(() => chrome.action.setBadgeText({ text: "" }), 4000);
}

chrome.commands.onCommand.addListener((command) => {
  if (command === "capture-job") captureFromActiveTab();
});

// Clicking the toolbar icon captures too — works even when the keyboard
// shortcut failed to bind (Chrome skips suggested keys that conflict).
chrome.action.onClicked.addListener(() => captureFromActiveTab());
