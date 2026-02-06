# Security Best Practices Report

Date: 2026-02-06

## Executive Summary
A security review was performed on the React frontend (app) and the Express backend (flight-backend). The backend now enforces rate limiting, request size limits, safer error responses, validation of flight search inputs, and verification for Moyasar webhooks. The remaining high-risk area is access control for admin-facing data stored in Supabase, which requires strict Row Level Security (RLS) to prevent unauthorized reads/writes.

## Scope
- Backend: `flight-backend` (Express, Amadeus/Moyasar integrations)
- Frontend: `app` (React, Supabase client)

## Critical Findings

### C-1: Missing webhook verification for payment events (Fixed)
Impact: An attacker could spoof payment webhooks to mark payments as completed or trigger downstream logic.
Status: Fixed in code; requires `MOYASAR_WEBHOOK_SECRET` to be configured.
Evidence: `flight-backend/src/controllers/payments.controller.js:65-76`, `flight-backend/src/config/env.config.js:21-25`.

## High Findings

### H-1: Callback URL could be influenced by Host header when backend base URL is missing (Fixed)
If `BACKEND_BASE_URL` is not configured in production, the callback URL could be derived from a spoofed Host header.
Status: Fixed in code; production now requires `BACKEND_BASE_URL`.
Evidence: `flight-backend/src/controllers/payments.controller.js:18-38`.

### H-2: Admin data updates are performed directly from the browser and rely on Supabase RLS
The client can insert, update, or delete admin data via Supabase. Without strict RLS, any authenticated (or even anonymous) user could change admin content.
Status: Requires Supabase RLS policies (not enforceable in this repo).
Evidence: `app/src/data/adminStore.ts:1161-1341`, `app/src/pages/Admin.tsx:336-557`.

## Medium Findings

### M-1: Auth sessions stored in localStorage
Storing auth tokens in localStorage is common in SPAs but increases impact if an XSS vulnerability is introduced. Continue to avoid rendering raw HTML and keep dependencies up to date.
Status: Acceptable with mitigations; ensure no user-controlled HTML rendering.
Evidence: `app/src/integrations/supabase/client.ts:11-16`.

## Low Findings

### L-1: `dangerouslySetInnerHTML` used for chart styling
This is currently used to inject CSS variables. If the chart config ever becomes user-controlled, it could open CSS injection risk.
Status: Low risk if config is trusted only.
Evidence: `app/src/components/ui/chart.tsx:69-86`.

## Informational

### I-1: Rate limiting uses in-memory store
The rate limiter is configured but uses the default in-memory store, which will not protect across multiple instances. Consider Redis if you scale horizontally.
Evidence: `flight-backend/src/app.js:12-20`.

## Notes on Tests
`npm -C app run lint` currently reports existing lint errors and warnings unrelated to this security pass. No automated backend tests are defined.
