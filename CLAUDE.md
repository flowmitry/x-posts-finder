# Repository Guidelines

## Project Structure & Module Organization
The Chrome extension source lives in `src/`, with `main.tsx` bootstrapping the popup UI, `content.ts` handling in-page scraping, and `background.ts` coordinating bookmarking. Shared styling sits in `App.css` and `index.css`. Static assets and the MV3 `manifest.json` are under `public/`, while production bundles land in `dist/` after builds.

## Build, Test, and Development Commands
Use `npm run dev` for a hot-reloading popup preview during UI work. Run `npm run build` before packaging; it compiles TypeScript, runs Vite, and copies the manifest and icon into `dist/`. `npm run preview` serves the built bundle for smoke checks, and `npm run lint` enforces the ESLint ruleset locally and in CI.

## Coding Style & Naming Conventions
Write new code in TypeScript with React function components. Prefer 2-space indentation, trailing commas, and single quotes to match existing files. Keep files focused on one concern (e.g., page logic in `content.ts`, UI in `.tsx`). Name React components in PascalCase, hooks in camelCase starting with `use`, and any shared utility modules with clear verbs, such as `findPosts.ts`.

## Testing Guidelines
Automated tests are not yet configured; treat linting as a required gate. When adding new features, include lightweight helpers that can be unit-tested once a harness (e.g., Vitest) is introduced, and document expected behaviours in the PR description. For now, verify the extension manually in Chrome by loading `dist/` as an unpacked extension and testing against both `x.com` and `twitter.com`.

## Commit & Pull Request Guidelines
Author commits in the imperative mood (e.g., `Add bookmark sync`) and keep them focused on a single change. Reference related issues in the body when applicable. Pull requests should explain the user impact, list manual verification steps, and attach screenshots or short videos for UI changes, especially those affecting the popup or injected content scripts.

## Extension Packaging & Manual QA
Before publishing, run `npm run build`, delete any stale `dist/` contents, and confirm the generated `background.js`, `content.js`, and assets match the manifest. Reinstall the unpacked extension, clear Chrome storage, and repeat bookmarking scenarios to ensure permissions and storage interactions continue to function.
