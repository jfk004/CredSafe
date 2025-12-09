# WebTrafficMonitor
AI-Powered Website Data Usage Monitor
web Traffic Monitor is a chrome extension that watches how a site sends data out and feeds a summarized view into the Gemini API. The popup then shows a human-readable explanation of what the website appears to be doing with your data.
 
# Features

**Monitors outgoing data**

•	Tracks outgoing HTTPs requests via webRequest.

•	Uses **Chrome webRequest** API for low-level network visibility.

• Observes WebSocket opened and sends a message
 
• Logs form submissions (field names, with sensitive values redacted)


**AI privacy summary**

•	Sends a compact, sanitized event log to Gemini.

•	Explains how the site appears to use your data.

•	Highlights likely tracking/ analytics / advertising endpoints.

•	Estimates a rough privacy risk level (Low, Medium , High).

**Site View**

•	Summaries are grouped by origin.

•	Popup shows the current tab's summary on demand.

# Requirements
- Chrome/ Chromium-based browser with Manifest V3 support

# Installation
- Clone / download the repo:
   https://github.com/jfk004/WebTrafficMonitor.git

- Load the extension in Chrome:
   - Go to chrome://extensions/
   - Enable Developer mode
   - Click Load unpacked
   - Choose the folder with the web traffic monitor.

 - You should now see Web Traffic Monitor in your extension bar.

# Usage
- Navigate to any website you'r curious about
- Interact with the page as usual(login, click around, search etc).
- Click the Web Traffic Monitor icon in the toolbar:
  
   - The popup detects the current origin
     
   - It a generates a summary from the background.
     
   - You'll see a short report explaining:
     
      - What type of data the site seems to send out.
        
      - Where it might be sending that data
        
      - Rough privacy risks and key points in bullet form
    
- If there's not enough data yet the popup will tell you.

# Privacy and Data Handling
Web traffic Monitor is designed to be privacy-respectful:

 - Sanitization:
    - Form field names are logged and values are:
      
       - Redacted when field names suggest sensitive info for instance passwords, ssn, card information etc.
      
       - Shortened preview length
         
    - WebSocket and request bodies are summarized and not fully recorded.
      
 - The extension does not read or send cookies, auth headers or full bodies.

 - Raw event lists stay in memory in the background script.

 - Summaries are cached locally in chrome.storage.locl.

You are encouraged to review and adjust redaction rules before using this in sensitive environments.


# Disclaimer
Web Traffic Monitor is a research/ helper tool, not a production-grade security product.

  - It may miss some flows
    
  - AI summaries may misclassify endpoints or risks.
    
  - It is not substitute for professional security analysis, legal review, or compliance auditing.
    
Use it as an informative lens, not as the final word on any site's privacy posture.

