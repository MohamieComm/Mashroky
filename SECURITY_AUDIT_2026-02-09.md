# Security Audit Report (2026-02-09)

## Scope
- Frontend: `app`
- Backend: `flight-backend`

## Commands Run
- `cd app && npm audit --json`
- `cd flight-backend && npm audit --json`

## Findings Summary
### Frontend (`app`)
- Total: 8 (High: 4, Moderate: 4)
- Key advisories:
  - `react-router-dom` / `react-router` / `@remix-run/router`: open redirect / XSS risk (High)
  - `vite` / `esbuild`: dev server file exposure and request proxy issues (Moderate)
  - `glob`: CLI command injection (High)
  - `lodash`, `js-yaml`: prototype pollution (Moderate)

### Backend (`flight-backend`)
- Total: 1 (Moderate: 1)
- Key advisory:
  - `nodemailer`: address parser interpretation conflict + DoS (Moderate/Low)

## Recommended Fixes
### Frontend (`app`)
1. Update router stack to patched versions.
2. Update `vite` and `esbuild` to patched versions (dev server exposure).
3. Update `glob`, `lodash`, `js-yaml` by refreshing dependency tree.

Suggested commands:
```
cd app
npm audit fix
# If issues remain, update directly:
npm install react-router-dom@latest react-router@latest @remix-run/router@latest
npm install vite@latest esbuild@latest
npm install glob@latest lodash@latest js-yaml@latest
```

### Backend (`flight-backend`)
1. Update nodemailer to latest (major update required).

Suggested commands:
```
cd flight-backend
npm install nodemailer@latest
```

## Additional Notes
- Ensure production environment variables (API keys, secrets) are stored only in backend/hosting secrets.
- Keep `VITE_*` vars limited to public keys only.
- Use HTTPS-only cookies and enable rate limiting on sensitive endpoints (already using `helmet` and `express-rate-limit`).

## Status
- Audit completed locally on 2026-02-09.
- Package updates not applied yet.
