Title: chore(migration): prepare for Tailwind v4 migration (preparatory changes)

Summary:
This PR contains preparatory changes to make upgrading to Tailwind v4 less disruptive. The actual dependency bump to Tailwind v4 was attempted but blocked because the new PostCSS plugin package version wasn't available on npm during this work. The goal of this PR is to land the safe, low-risk changes first and review them before attempting a dependency bump.

What changed
- Converted Tailwind-specific color token usages to CSS-variable-backed classes to reduce coupling:
  - Introduced `.btn-primary`, `.input-primary`, `.text-primary`, and `.heading-primary` in `src/app/globals.css`.
  - Replaced `bg-primary-*`, `text-primary-*`, and focus ring tokens across components with those classes.
- Replaced `@apply max-w-7xl` with an explicit `max-width: 80rem` to avoid relying on utility name changes.
- Added migration plan docs: `MIGRATE_TAILWIND_TO_V4.md` and `MIGRATE_TAILWIND_TO_V4_NOTES.md`.
- Added CI workflow `.github/workflows/ci.yml` to validate builds and linting on `main` and `chore/**` branches (runs `npm ci`, `npx prisma generate`, `npm run lint`, `npm run build`).

Why
- Tailwind v4 changes the PostCSS plugin shape and may rename/remove utilities; converting usages and introducing CSS-variable-based utility classes reduces the amount of code that needs changing in the dependency bump PR.
- Adding CI ensures the bump will be validated in a clean environment and prevents OS-specific issues from blocking the migration.

Blocked work (next PR)
- The actual dependency bump to Tailwind v4 is blocked because `@tailwindcss/postcss@^5.0.0` wasn't available during this work (npm returned ETARGET). After the plugin or official migration instructions are available, we'll:
  - Bump `tailwindcss` and the PostCSS plugin, update `postcss.config.js` as needed, and fix any residual utility renames.
  - Validate via the CI added in this PR.

Notes for reviewers
- Main risk areas: CSS look-and-feel changes due to the CSS changes. The changes are intentionally conservative: they preserve the site's visual appearance by using CSS variables.
- If you want to help unblock the dependency bump earlier, we can change the build flow to use the Tailwind CLI for CSS generation as an alternative integration approach.

How to test locally
1. Checkout this branch: `git checkout chore/tailwind-migration`
2. Install dependencies: `npm install`
3. Start dev server: `npm run dev` and visit `http://localhost:3000`
4. Run the build: `npm run build` (CI will also run this)

