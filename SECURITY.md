# SECURITY — Ruleta Académica

This document lists security considerations and recommendations for deploying the application safely.

Secrets and env
---------------
- Never commit `.env` or credentials. Use CI/CD secrets stores or platform environment variables (Vercel/Render/Netlify).
- `DATABASE_URL` is the main secret; rotate credentials periodically.

Authentication & Authorization
------------------------------
- Current API endpoints are unauthenticated. Add an auth layer (NextAuth/Clerk/Auth0) for production.
- Authorization: Only allow users to manage their own saved `QuestionSet` (add `ownerId` to the model and checks on API routes).

Input validation
----------------
- The POST endpoint uses Zod, but server-side should keep validating and sanitizing any input before DB writes.

Operational security
--------------------
- Use TLS for all production traffic.
- Set up rate limiting on API endpoints if public.
- Log and monitor suspicious activity (Sentry, Datadog).

Dependencies
------------
- Keep dependencies up to date and monitor known vulnerabilities (npm audit, Dependabot). The project currently has a small number of vulnerabilities that should be triaged before a public deployment.
