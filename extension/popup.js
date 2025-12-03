// popup.js

function labelColor(label) {
  const l = label.toLowerCase();
  if (l === "benign" || l === "low") return "#2ecc71";
  if (l === "suspicious" || l === "medium") return "#f1c40f";
  return "#e74c3c";
}

chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
  const tab = tabs[0];
  if (!tab || !tab.url) return;

  const url = tab.url;
  document.getElementById("url").textContent = url;

  chrome.storage.local.get(null, (items) => {
    const risk = items[`risk:${url}`];
    if (!risk) {
      document.getElementById("score").textContent = "No data";
      document.getElementById("label").textContent = "No scan yet for this page.";
      document.getElementById("explanation").textContent =
        "Open a login form on this page (or reload) to trigger a scan.";
      return;
    }

    document.getElementById("score").textContent = `Score: ${risk.score}`;
    const labelEl = document.getElementById("label");
    labelEl.textContent = `Classification: ${risk.label}`;
    labelEl.style.color = labelColor(risk.label);

    document.getElementById("explanation").textContent = risk.explanation || "";
  });
});
