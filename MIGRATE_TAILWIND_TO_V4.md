Tailwind v4 migration plan

Goal: Upgrade from Tailwind v3 to Tailwind v4 safely in a dedicated branch.

High-level steps

1. Dependency updates
   - bump `tailwindcss` to ^4.x
   - install `@tailwindcss/postcss` v5 if published or follow Tailwind docs for PostCSS plugin (if changed)
   - update PostCSS config to use plugin export form if required

2. PostCSS config
   - Tailwind v4 may require using `require('@tailwindcss/postcss')()` in `postcss.config.js` instead of the object plugin syntax.

3. Audit CSS usage
   - Identify all `@apply` usages that reference utilities no longer generated or renamed (custom colors, spacing, and `max-w-7xl` etc.)
   - For custom utilities using `@apply`, prefer porting them to CSS variables or explicit rules where Tailwind changed the utility names.

4. Update `tailwind.config.js`
   - Ensure `content` globs cover all files
   - Migrate custom theme extensions if shape changed

5. Build & test
   - Run `npm run build` and fix reported errors
   - Run app in dev and test UI carefully for missing utilities

6. CI
   - Add a GitHub Actions workflow to run build & lint for this branch

7. Rollout
   - After successful validation, open PR into `main` with migration notes and any UI adjustments

Notes / Risks
- Tailwind v4 can rename/remove utilities; scan the codebase for `@apply` references and custom classnames (e.g., `max-w-7xl`, `bg-primary-500`) and fix them.
- PostCSS plugin shape may differ; check the official Tailwind migration docs at https://tailwindcss.com/docs/upgrading-to-v4

Recommended tooling
- Use `npx tailwindcss -i src/input.css -o dist/output.css --minify` locally to iterate on utility generation.
- Use a CSS search for `@apply` and custom classes in `src/app/globals.css` and `src/components`.

Start: Create this migration branch and run an initial attempt to bump packages and run the build to catch early errors.

