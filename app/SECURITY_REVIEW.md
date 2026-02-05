# Security quick review (Mashrouk web – August 2026)

## Summary
- Supabase RLS is enabled across core tables (profiles, flights, hotels, offers, activities, articles, destinations, partners, api_keys, users_admin, pages, admin_settings) with `is_admin()` helper. Good baseline.
- Admin access is restricted by email + profile role; logout clears Supabase storage.
- No secrets found in frontend code; environment is consumed via Vite variables.

## Findings / Recommendations
1. **Profiles read policy** – ensure a `select` policy allows the authenticated user to read only their profile; otherwise admin screen may hang. (Check Supabase policies; add if missing.)
2. **Admin detection fallback** – Admin emails are now also accepted from `VITE_ADMIN_EMAILS`; keep this list minimal and rotate when staff changes.
3. **XSS surface** – All user-facing text comes from Supabase/content; keep it plain text. Avoid rendering raw HTML. If you add rich text later, sanitize on render.
4. **API keys table** – Keep values encrypted or obfuscated; RLS already restricts to admins. Do not log keys in console.
5. **Transport security** – Serve over HTTPS only; set `VITE_SUPABASE_URL` to https endpoint; enable HSTS at the host (Railway) if possible.
6. **Session handling** – Logout now wipes local Supabase tokens. Periodically test the flow; consider shorter session lifetime in Supabase if higher security is needed.
7. **Rate limiting / abuse** – Consider adding rate limits on write endpoints (contact forms / bookings) via Supabase Edge Functions or an API gateway.
8. **Content integrity** – Images come from external URLs; broken images now fall back. Prefer hosting critical assets locally to avoid mixed content / spoofing.

## Quick test checklist
- Login / logout: session cleared, redirect to /auth.
- Admin: email in `VITE_ADMIN_EMAILS` or role=admin; admin page loads without spinner after 8s timeout.
- RLS: non-admin cannot read/write admin tables; own profile accessible.
- Booking buttons: add to cart then open /cart; cart total updates and delete works.
- Broken images: no layout breaks; fallbacks render.
