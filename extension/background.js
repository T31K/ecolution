// Tries prod first, falls back to a locally running main-server.
const API_BASES = ["https://api.kaleidoscopical.com", "http://localhost:3001"];
const INGEST_SECRET = "ad0a93bdf3ebe6de5d520ff544223db43bc545f6bfe8ec52";

function notify(title, message) {
  chrome.notifications.create({
    type: "basic",
    iconUrl: "icon128.png",
    title,
    message,
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
      lastError = data.error || `HTTP ${res.status}`;
      // Auth/validation errors won't improve on the fallback host — stop.
      if (res.status === 400 || res.status === 401) break;
    } catch (err) {
      lastError = err.message;
    }
  }
  throw new Error(lastError);
}

chrome.commands.onCommand.addListener(async (command) => {
  if (command !== "capture-job") return;
  const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
  if (!tab?.id) return;

  const [{ result: selection }] = await chrome.scripting.executeScript({
    target: { tabId: tab.id },
    func: () => window.getSelection().toString(),
  });

  if (!selection || !selection.trim()) {
    notify("Ecolution: nothing selected", "Select the job text first, then press Cmd+Shift+Y.");
    return;
  }

  chrome.action.setBadgeText({ text: "…" });
  try {
    const data = await postIngest({ selection, url: tab.url, title: tab.title });
    chrome.action.setBadgeBackgroundColor({ color: "#16a34a" });
    chrome.action.setBadgeText({ text: "✓" });
    notify("Job captured ✓", `${data.job.title} @ ${data.job.company}`);
  } catch (err) {
    chrome.action.setBadgeBackgroundColor({ color: "#dc2626" });
    chrome.action.setBadgeText({ text: "✗" });
    notify("Capture failed", err.message);
  }
  setTimeout(() => chrome.action.setBadgeText({ text: "" }), 4000);
});
