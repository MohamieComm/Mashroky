# Mashrok Fix Report - 2026-02-13

## Scope Executed
- Arabic content hardening for home data rendering.
- Realistic image mapping for offers/hotels/activities.
- Missing-title/description fallbacks on home cards.
- Logo fallback handling.
- Cart placeholder normalization for booking items.
- Automated encoding scan run.
- Frontend build verification.
- Backend syntax verification.
- Security audit (npm audit) for frontend/backend.

## Files Changed
- app/src/components/home/FeaturedDestinations.tsx
- app/src/components/home/FeaturedHotels.tsx
- app/src/components/home/WeeklyOffers.tsx
- app/src/components/ui/image-with-fallback.tsx
- app/src/data/adminStore.ts
- app/src/hooks/useCart.tsx
- app/src/lib/contentQuality.ts
- app/src/i18n/index.ts -> app/src/i18n/index.tsx
- tools/mashrok-arabic-rebuilder.js

## Commands Executed
1. `git stash push -u -m "chore: pre-clean snapshot before fix pass"`
2. `npm run build` (app) -> PASS
3. `npm run lint` (app) -> FAIL (existing project-wide lint debt)
4. `npm audit --json` (app) -> 9 vulnerabilities (4 high, 4 moderate, 1 low)
5. `npm audit --json` (flight-backend) -> 2 vulnerabilities (1 high, 1 low)
6. `node tools/mashrok-arabic-rebuilder.js --dirs=app/src,flight-backend/src,public`
7. `Get-ChildItem flight-backend/src -Recurse -Filter *.js | ForEach-Object { node --check $_.FullName }` -> PASS

## Security Findings (from automated audit)
### Frontend
- High: `react-router-dom` / `@remix-run/router` open redirect/XSS advisory chain.
- Moderate: `vite` + `esbuild` dev server advisory chain.
- Low/Moderate: `qs`, `lodash`, `js-yaml` transitive advisories.

### Backend
- High: `nodemailer` DoS advisory (<7.0.10).
- Low: `qs` arrayLimit bypass advisory.

## Functional Notes
- Home cards now sanitize corrupted Arabic fields and fallback to curated Arabic text when source data is broken.
- Home card images now resolve by city/offer context to reduce mismatch between content and visuals.
- Cart now auto-fills robust placeholders per booking type when title/details are missing.
- Logo assets now fallback to `/logo.png` when logo sources fail.

## Pending Known Issues
- Project-wide ESLint errors remain (mostly existing `any` typing and regex lint rules in unrelated files).
- Dependency upgrades for security advisories are still pending.
