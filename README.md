# XPostsFinder – Smarter Conversations on X (Twitter)

Endless scrolling on X can feel like searching for a needle in a haystack. XPostsFinder helps you cut through the noise by automatically surfacing the conversations that actually matter.

How it works:
1.	Configure AI – add your OpenAI token or connect to a local LM Studio API.
2.	Set preferences – explain the topics, tone, or types of posts you want to bookmark.
3.	Run the scan – let the extension review your feed and communities.

As it runs, XPostsFinder highlights and bookmarks the posts that fit your criteria. At any time, you can find the selected posts directly in your X bookmarks—ready to dive in without the endless scroll.


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


