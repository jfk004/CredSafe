// contentScript.js

console.log("[WebTrafficMonitor] Content script loaded");

// Note: Most traffic is captured via webRequest API in background.js
// This script only captures form submissions and provides fallback for other events.

// Listen for messages from injected page script (if injection succeeds)
window.addEventListener("message", (event) => {
  if (event.source !== window) return;
  const data = event.data;

  // Accept both old source name and new one
  if (!data || (data.source !== "privacy-lens" && data.source !== "webtrafficmonitor")) return;

  console.log("[WebTrafficMonitor] Forwarding event to background:", data.kind);

  // If the extension was reloaded/disabled, avoid "Extension context invalidated"
  if (!chrome.runtime || !chrome.runtime.id) {
    // Context is gone; silently ignore
    return;
  }

  try {
    chrome.runtime.sendMessage(
      {
        type: "page_event",
        payload: data
      },
      (response) => {
        if (chrome.runtime.lastError) {
          const msg = chrome.runtime.lastError.message || "";
          // Ignore the common dev-time noise
          if (!msg.includes("Extension context invalidated")) {
            console.error("[WebTrafficMonitor] Error sending message:", chrome.runtime.lastError);
          }
        }
      }
    );
  } catch (err) {
    const msg = err && err.message ? err.message : String(err);
    if (!msg.includes("Extension context invalidated")) {
      console.error("[WebTrafficMonitor] Exception in sendMessage:", err);
    }
  }
}, false);

// Capture form submissions directly (doesn't require page injection)
document.addEventListener("submit", (e) => {
  try {
    const form = e.target;
    const fields = {};
    const fd = new FormData(form);
    fd.forEach((value, key) => {
      const lower = key.toLowerCase();
      if (
        lower.includes("password") ||
        lower.includes("ssn") ||
        lower.includes("card") ||
        lower.includes("secret")
      ) {
        fields[key] = "<redacted>";
      } else {
        fields[key] = String(value).slice(0, 100);
      }
    });

    // Same guard here for safety
    if (!chrome.runtime || !chrome.runtime.id) {
      return;
    }

    chrome.runtime.sendMessage(
      {
        type: "page_event",
        payload: {
          kind: "form_submit",
          action: form.action || window.location.href,
          method: (form.method || "GET").toUpperCase(),
          fields,
          time: Date.now()
        }
      },
      (response) => {
        if (chrome.runtime.lastError) {
          const msg = chrome.runtime.lastError.message || "";
          if (!msg.includes("Extension context invalidated")) {
            console.error("[WebTrafficMonitor] Error sending form message:", chrome.runtime.lastError);
          }
        }
      }
    );
  } catch (err) {
    console.error("[WebTrafficMonitor] Error capturing form:", err);
  }
}, true);

// Note: Most network traffic (fetch, XHR, beacons, etc.) is captured
// via the webRequest API in background.js. This content script only
// handles form submissions and page-level events that require DOM access.
