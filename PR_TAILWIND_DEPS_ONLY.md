Title: chore(deps): attempt Tailwind v4 deps bump (dependency-only PR)

Summary:
This PR updates only dependency versions in package.json to prepare for a Tailwind v4 migration. It intentionally does not change source files beyond what is necessary to make the dependency change (no CSS or component edits). The purpose is to run CI and surface compatibility issues in isolation.

Changes:
- Bump `tailwindcss` to ^4.0.0 (or the target stable v4 range)
- Add or bump `@tailwindcss/postcss` to the required version for Tailwind v4 build pipeline

Notes:
- If the PostCSS plugin package is not available on npm, CI will fail on install. In that case revert the dependency bump and continue with a staged migration.
- This PR should be created from branch `chore/tailwind-deps-only` and opened as a draft first.

CI guidance:
- Ensure `SENTRY_DSN` is not required for CI runs (the codebase already treats it as optional).
- The workflow will run `npm ci`, `npx prisma generate`, `npm run lint`, `npm run build`.

Recommended follow-ups:
- If CI shows install failures, comment the failure and add a fallback PR that only updates package.json lockfile.
- After successful install, open a second PR that updates CSS usages and adapts PostCSS config.
