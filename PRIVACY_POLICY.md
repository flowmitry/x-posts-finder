# PRIVACY POLICY

**Effective date: September 20, 2025**

This Privacy Policy describes how the "XPostsFinder" Chrome extension ("the Extension" or "we") collects, uses, discloses, and stores information when you install and use the Extension.

---

## 1. Summary

- The Extension helps you find and bookmark posts on X (formerly Twitter) within your browser. It operates locally and does not require you to create an account.  
- We do not run servers that collect your data. Any data processed by the Extension is stored locally in your browser unless you explicitly enable features that connect to third-party APIs.

---

## 2. Data We Access and Why

- **Browser tabs and active tab URL**: Used to detect when you are on X.com and to run analysis only on that site.  
- **Page content (on X.com)**: When analyzing or bookmarking posts, the Extension reads post text, author handles, timestamps, and media URLs to filter, display, and save matches.  
- **Local storage**: Your preferences (topics and AI settings) and any locally saved bookmarks are stored using browser storage APIs (`chrome.storage.local` or similar). This remains on your device/browser profile by default.  
- **Bookmarks**: The Extension may add matching posts to your X bookmarks on your behalf. It does not access or change other bookmarks in your browser.  
- **AI API access**: If you choose, the Extension can connect to third-party AI services (such as `api.openai.com`) or a locally hosted LM Studio API. In this case, snippets of post content may be sent to the API you configure strictly for analysis.

---

## 3. How We Use the Data

- **AI-powered bookmarking**: The Extension analyzes post content using AI to determine which posts match your preferences. Depending on your configuration, this analysis runs through the official OpenAI API or a locally hosted LM Studio API.  
- **Local features**: Once analyzed, matching posts are highlighted and bookmarked in your own X account. Settings are stored locally in your browser.  

---

## 4. Sharing and Third Parties

- **No tracking**: The Extension does not include analytics or telemetry.  
- **Third-party APIs**: If you connect to OpenAI or another external API, that provider’s privacy policy will apply to any data you send there.  
- **Browser vendors**: Chrome or other browsers may collect telemetry about extension usage under their own policies.

---

## 5. Security and Retention

- **Local storage**: Bookmarks, settings, and preferences remain on your device until you delete them or uninstall the Extension.  
- **No server storage**: We do not operate servers that store your data.  
- **Security**: We apply best-effort security practices. Since the Extension reads page content on X, you should only install it from trusted sources and keep it up to date.

---

## 6. Your Choices and Rights

- **Delete data**: You can remove bookmarks or reset settings from the Extension UI. Uninstalling the Extension will clear stored data depending on your browser’s behavior.  
- **Export**: If available, you can export your bookmarks before uninstalling.  
- **Opt-in**: Any future features that involve sending data externally will be off by default and require your explicit opt-in.

---

## 7. Children

The Extension is not intended for children under 13. We do not knowingly collect information from children.

---

## 8. Changes to This Policy

We may update this Privacy Policy from time to time. The “Effective date” above will be updated when changes are made. If the changes are material, we will try to notify users through the Extension’s UI or release notes.

---

## 9. Contact

If you have questions about this Privacy Policy, open an issue in the [repository](https://github.com/flowmitry/x-posts-finder).