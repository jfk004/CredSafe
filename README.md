# CredSafe
AI-Powered Credential Protection & Malicious URL Detection for the Web
CredSafe is a security-focused Chrome extension that protects users from entering their credentials on suspicious or malicious websites. Using a combination of machine learning, real-time URL analysis, and OSINT-backed intelligence, CredSafe detects phishing attempts, cloned login pages, and high-risk sites—before the user enters sensitive information.
This project uses the Malicious URLs Dataset from Kaggle to train a multi-class classifier that identifies benign, phishing, malware, and defacement URLs. The extension then analyzes login pages in real time and displays a clear risk rating or blocks unsafe interactions.
 
# Features

**Real-Time Credential Form Detection**

•	Automatically detects password fields, login forms, and credential popups.

•	Instantly evaluates the webpage whenever a login UI appears.

**Machine Learning–Based URL Classification**

•	Trained on 650k+ labeled URLs from the Kaggle malicious URL dataset.

•	Predicts whether a site is:

-	Benign

-	Phishing

-	Malware

-	Defacement

**Risk Scoring Engine**

Each URL receives a 0–100 risk score based on:

•	ML classification probabilities

•	Structural URL analysis (length, subdomains, special chars)

•	Suspicious patterns (IP-based URLs, brand keywords, etc.)

•	Fallback heuristic scoring if offline

•	Future-additions: WHOIS age, SSL issuer checks, OSINT signals

**Brand & Impersonation Detection**

•	Detects domains impersonating known services (Google, Microsoft, banks, etc.).

•	Flags typosquatting or look-alike domains commonly used in phishing.

**Visual Safety Indicators**

•	Extension displays a badge color:

-	Green — Safe
-	Yellow — Suspicious
-	Red — Dangerous
  
•	Popup window shows classification, risk score, and an AI summary.

**Automatic Alerts & Blocking**

•	If a page is classified as High Risk, CredSafe issues:

-	A system alert
  
-	A visible warning
  
-	Optional blocking of credential entry
 
# How It Works
**1. Browser Extension**
   
•	Listens for credential fields and login UI elements.

•	Sends URL + minimal page context to the backend for scoring.

•	Shows risk scores and notifications in real time.

**2. Machine Learning Backend**
   
•	Character-level TF-IDF + Logistic Regression model.

•	Trained using Kaggle’s malicious URL dataset.

•	Returns:

  - Predicted label

 - Class probabilities

  - Computed risk score

- Human-readable explanation
  
**3. Combined Risk Engine**
   
Final risk = ML prediction + heuristics + impersonation detection.

This hybrid approach prevents zero-day false negatives and improves detection reliability.
 
# Dataset Used

**Malicious URLs Dataset**

Kaggle: https://www.kaggle.com/datasets/sid321axn/malicious-urls-dataset

•	~651,000 URLs

•	Categories:

-	benign

-	phishing

-	malware

-	defacement

This dataset powers the ML model used in CredSafe.
 
# Installation Guide

 **Prerequisites**

•	Google Chrome (or any Chromium-based browser)

•	Python 3.9+

•	Kaggle dataset downloaded (CSV file)


# Disclaimer
CredGuard significantly enhances protection against phishing and malicious login pages, but no security tool is perfect. Users should still practice safe browsing habits and verify unknown websites manually.

# Contributing
Pull requests, feature suggestions, and improvements are welcome!

# License



