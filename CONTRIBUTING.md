# Contributing to Ruleta Académica

Thank you for considering contributing. This document describes how to set up your environment, coding conventions, and the PR workflow.

Getting started
---------------
1. Fork the repository and clone your fork.
2. Create a feature branch with a descriptive name: `git checkout -b feat/upload-validation`.
3. Install dependencies and run the dev server locally:

```powershell
npm install
npm run dev
```

Commit guidelines
-----------------
- Use conventional commit messages (e.g., `feat:`, `fix:`, `chore:`, `docs:`, `refactor:`).
- Keep commits small and focused.

Code style
----------
- TypeScript: strict mode is preferred. Use type annotations for public APIs.
- TailwindCSS: use utility classes; extract repeating patterns into components.
- Accessibility: keyboard operable, proper ARIA where appropriate, focus management in modals.

Branching & PRs
---------------
- Open a PR to `main`. Include a clear description, screenshots when relevant, and testing notes.
- Include unit tests for new features and ensure CI passes (if CI configured).

Testing locally
---------------
- Unit tests: add to `__tests__` and run with your test runner (TBD in repo). Use Playwright for E2E.

Security & data
---------------
- Do not commit secrets. Use `.env.local` for local environment variables.

Thank you
---------
Contributions are welcome — please be respectful and keep reviews constructive.
