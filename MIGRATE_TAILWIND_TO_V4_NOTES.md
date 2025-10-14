Migration actionable checklist

Files and spots to review/update:

- src/app/globals.css
  - @apply max-w-7xl mx-auto px-6 py-12; -> verify if 'max-w-7xl' exists in v4 or replace with explicit max-width (e.g., max-width: 80rem) or custom variable
  - @apply text-4xl, text-gray-300, space-y-* -> confirm retained in v4
  - Many custom classes (bg-primary, text-primary) use CSS variables — keep them; remove @apply where possible

- src/components/file-input.tsx
  - h2 uses text-primary-500 -> change to text-primary or use CSS var class
  - button classes use bg-primary-500 -> replace with btn-primary utility class that uses CSS variables

- src/app/inicio/page.tsx
  - headings and buttons rely on text-primary-400, bg-primary-500 -> map to CSS variables or update to new tokens

- src/components/QuestionWheel.tsx
  - buttons use bg-primary-500 and hover:bg-primary-700 -> replace with .btn-primary and .btn-secondary depending

Strategy:
- Prefer using the CSS variables already defined in `globals.css` (e.g., --primary-color) for custom named classes (btn-primary, .bg-primary) rather than relying on Tailwind color tokens
- Keep `@apply` for basic spacing utilities (space-y-*) where possible; if Tailwind v4 renames them, replace with explicit CSS rules (margin-block-gap or gap)
- Test build after bumping Tailwind to v4 in the migration branch, and fix errors iteratively

