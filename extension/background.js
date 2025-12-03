// background.js

const BACKEND_URL = "http://127.0.0.1:8000"; // Set BACKEND_URL to wherever the API runs during dev 

// Simple local heuristic (lexical) score as a fallback if backend fails
function localHeuristicScore(urlString) {
  try {
    const url = new URL(urlString);
    const host = url.hostname;
    const path = url.pathname + url.search;
    let score = 0;

    // Very long URLs are suspicious
    if (urlString.length > 120) score += 15;
    if (urlString.length > 200) score += 15;

    // Lots of subdomains
    const dotCount = host.split(".").length - 1;
    if (dotCount >= 3) score += 10;
    if (dotCount >= 4) score += 10;

    // IP address instead of domain
    if (/^\d{1,3}(\.\d{1,3}){3}$/.test(host)) score += 25;

    // Suspicious characters
    const suspiciousChars = /[@%$#]/g;
    const matches = (urlString.match(suspiciousChars) || []).length;
    score += matches * 5;

    // Common phishing keywords
    const lower = urlString.toLowerCase();
    const badTokens = ["login", "verify", "account", "secure", "update", "banking"];
    badTokens.forEach(tok => {
      if (lower.includes(tok)) score += 5;
    });

    // Clamp 0–100
    score = Math.max(0, Math.min(100, score));
    return score;
  } catch (e) {
    return 50; // unknown = medium risk
  }
}

function badgeColorForScore(score) {
  if (score <= 30) return "#2ecc71"; // green
  if (score <= 60) return "#f1c40f"; // yellow
  return "#e74c3c"; // red
}

function labelForScore(score) {
  if (score <= 30) return "LOW";
  if (score <= 60) return "MED";
  return "HIGH";
}

async function fetchRiskScore(url) {
  try {
    const res = await fetch(`${BACKEND_URL}/score`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ url })
    });

    if (!res.ok) {
      throw new Error(`Backend returned status ${res.status}`);
    }

    const data = await res.json();
    // expected: { score: number, label: string, probs: {...}, explanation: string }
    return data;
  } catch (err) {
    console.warn("Backend scoring failed, using heuristic only:", err);
    const score = localHeuristicScore(url);
    return {
      score,
      label: score <= 30 ? "benign" : score <= 60 ? "suspicious" : "malicious",
      probs: {},
      explanation: "Local heuristic score (backend unavailable)."
    };
  }
}

// Handle messages from content scripts
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.type === "CREDENTIAL_FORM_DETECTED") {
    const { url } = message.payload;

    // Async call, reply later
    (async () => {
      const risk = await fetchRiskScore(url);
      const tabId = sender.tab?.id;

      if (tabId !== undefined) {
        const text = labelForScore(risk.score);
        const color = badgeColorForScore(risk.score);

        chrome.action.setBadgeText({ tabId, text });
        chrome.action.setBadgeBackgroundColor({ tabId, color });

        // Show notification if high risk
        if (risk.score >= 70) {
          chrome.notifications.create({
            type: "basic",
            iconUrl: "icon128.png", // add an icon file or change this
            title: "High-Risk Login Page Detected",
            message: `This page appears ${risk.label.toUpperCase()}. Avoid entering credentials.\nReason: ${risk.explanation}`,
            priority: 2
          });
        }

        // Save last risk data for popup
        chrome.storage.local.set({
          [`risk:${url}`]: {
            url,
            score: risk.score,
            label: risk.label,
            explanation: risk.explanation,
            probs: risk.probs,
            timestamp: Date.now()
          }
        });
      }
    })();

    sendResponse({ status: "processing" });
    return true; // keep message channel open for async
  }
});
