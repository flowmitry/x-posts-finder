# XPostsFinder – Smarter Conversations on X (Twitter)

XPostsFinder automatically bookmarks the posts on X that match your interests, so you can skip the scroll and join the right conversations.

How it works:
1. Configure AI – add your OpenAI token or connect to a local LM Studio API.
2. Set preferences – explain the topics, tone, or types of posts you want to bookmark.
3. Run the scan – let the extension review your feed and communities.

As it runs, XPostsFinder highlights and bookmarks the posts that fit your criteria. At any time, you can find the selected posts directly in your X bookmarks—ready to dive in without the endless scroll.

## Demo

[![Watch the demo on YouTube](https://img.youtube.com/vi/LgfCNMi6n2Q/0.jpg)](https://youtu.be/LgfCNMi6n2Q)

## Installation

You can install XPostsFinder in two ways:

### 1) Install from the Chrome Web Store

- Open the Chrome Web Store (or the store for your Chromium-based browser).
- Search for "XPostsFinder" and click "Add to Chrome" (or the equivalent button).

Note: If the extension isn't available in the store for your browser or region, use the GitHub unpacked install below.

### 2) Install from GitHub (download release and load unpacked)

There are two common ways to install from the source or a release on GitHub.

- From a prebuilt release (recommended):
  1. Visit the releases page for this project: https://github.com/flowmitry/x-posts-finder/releases
  2. Download the ZIP for the release you want and extract it.
  3. Open Chrome and go to chrome://extensions
  4. Enable "Developer mode" (toggle in the top-right).
  5. Click "Load unpacked" and select the extracted folder that contains the extension's `manifest.json` file.

- Build from source and load locally:
  1. Clone the repository and install dependencies:

```bash
git clone https://github.com/flowmitry/x-posts-finder.git
cd x-posts-finder
npm install
```

  2. Build the extension bundle:

```bash
npm run build
```

  3. In Chrome, go to chrome://extensions, enable Developer mode, and click "Load unpacked". Select the `dist/` directory produced by the build step.

Troubleshooting:
- If Chrome refuses to load the folder, make sure you selected the directory that contains `manifest.json`.
- Use the browser console on the chrome://extensions page to see any error messages about missing files or incompatible manifest versions.

## Notes

- This extension uses Manifest V3 and is intended for Chromium-based browsers that support MV3.
- Before publishing or distributing an unpacked build, review permissions in `manifest.json` and test behavior in an isolated profile.

If you want screenshots or a short GIF showing the "Load unpacked" workflow, I can add that too.


