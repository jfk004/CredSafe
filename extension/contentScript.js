// contentScript.js

//Inject hook into the page context
const script = document.createElement("script");
script.textContent = "(" + inPageHook.toString() + ")();";
(document.documentElement || document.head || document.body).appendChild(script);
script.remove();

//Listen for messages from the page and forward to background
window.addEventListener("message", (event) => {
  if (event.source !== window) return;
  const data = event.data;
  if (!data || data.source !== "privacy-lens") return;

  chrome.runtime.sendMessage({
    type: "page_event",
    payload: data
  });
});

//The actual hook function (stringified above)
function inPageHook() {
  function previewData(data) {
    if (!data) return null;
    try {
      if (typeof data === "string") return data.slice(0, 200);
      if (data instanceof Blob) return `Blob(${data.type}, ${data.size} bytes)`;
      if (data instanceof ArrayBuffer) return `ArrayBuffer(${data.byteLength} bytes)`;
      if (typeof data === "object") return JSON.stringify(data).slice(0, 200);
    } catch (e) {}
    return "<unserializable>";
  }

  function send(kind, extra) {
    window.postMessage(
      {
        source: "privacy-lens",
        kind,
        ...extra
      },
      "*"
    );
  }

  //sendBeacon 
  if (typeof navigator.sendBeacon === "function") {
    const origBeacon = navigator.sendBeacon.bind(navigator);
    navigator.sendBeacon = function (url, data) {
      send("beacon", {
        url,
        dataPreview: previewData(data),
        time: Date.now()
      });
      return origBeacon(url, data);
    };
  }

  // fetch 
  if (typeof window.fetch === "function") {
    const origFetch = window.fetch.bind(window);
    window.fetch = function (input, init = {}) {
      const url = typeof input === "string" ? input : input.url;
      const method = (init.method || "GET").toUpperCase();
      send("fetch", {
        url,
        method,
        time: Date.now()
      });
      return origFetch(input, init);
    };
  }

  //XMLHttpRequest
  if (typeof window.XMLHttpRequest === "function") {
    const OrigXHR = window.XMLHttpRequest;

    function WrappedXHR() {
      const xhr = new OrigXHR();

      const origOpen = xhr.open;
      xhr.open = function (method, url, ...rest) {
        xhr.__plMethod = method;
        xhr.__plUrl = url;
        return origOpen.call(xhr, method, url, ...rest);
      };

      const origSend = xhr.send;
      xhr.send = function (body) {
        send("xhr", {
          url: xhr.__plUrl,
          method: xhr.__plMethod,
          time: Date.now()
        });
        return origSend.call(xhr, body);
      };

      return xhr;
    }

    WrappedXHR.prototype = OrigXHR.prototype;
    window.XMLHttpRequest = WrappedXHR;
  }

  // WebSocket 
  if (typeof window.WebSocket === "function") {
    const OrigWS = window.WebSocket;

    function WrappedWS(url, protocols) {
      const ws = protocols ? new OrigWS(url, protocols) : new OrigWS(url);
      send("websocket_open", { url, time: Date.now() });

      const origSend = ws.send;
      ws.send = function (data) {
        send("websocket_send", {
          url,
          dataPreview: previewData(data),
          time: Date.now()
        });
        return origSend.call(ws, data);
      };

      return ws;
    }

    WrappedWS.prototype = OrigWS.prototype;
    window.WebSocket = WrappedWS;
  }

  // Form submissions (DOM/fields) 
  document.addEventListener(
    "submit",
    (e) => {
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

        send("form_submit", {
          action: form.action || window.location.href,
          method: (form.method || "GET").toUpperCase(),
          fields,
          time: Date.now()
        });
      } catch (err) {
        //ignore
      }
    },
    true
  );
}
