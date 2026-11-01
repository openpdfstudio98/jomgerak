# JomGerak V6.4 — API Connection Setup

## 1. Vercel → Project → Settings → Environment Variables
Set these in **Production** and redeploy:
- `MAPTILER_API_KEY` = **public** MapTiler key restricted to your Vercel domain.
- `SUPABASE_URL` = Supabase Project URL (`https://...supabase.co`).
- `SUPABASE_ANON_KEY` = Supabase publishable (`sb_publishable_...`) or legacy anon key. **NEVER** a service-role / `sb_secret_` key.
- `TOMTOM_API_KEY` = TomTom API key; accessed server-side only.

The public MapTiler key is intentionally returned to the browser via `/api/public-config`. It must be domain restricted. Supabase and TomTom keys are not returned to the browser.

## 2. Supabase
Open your Supabase project's **SQL Editor**. Paste and run `supabase_schema.sql`. This creates `public.jg_reports`, enables RLS, allows anonymous reads of reports from the past 24 hours and anonymous inserts, but **not** update/delete. Anonymous inserts are vulnerable to spam; add Turnstile CAPTCHA and rate limiting before promoting public community reporting. Do not accept unverified user reports as official information.

## 3. Deploy
Upload **all** ZIP contents to the GitHub repo root and commit. Redeploy in Vercel. Open website in a new tab and check:
- `https://YOUR-DOMAIN/api/public-config` should show flags and a public MapTiler key only.
- `https://YOUR-DOMAIN/api/reports` should show `{"reports":[]}` or actual reports after SQL is run.
- `https://YOUR-DOMAIN/api/traffic?lat=3.0738&lng=101.5183` should show one road segment's traffic flow (if TomTom plan allows it).
- Tools → Map → **Map layer** → Road / Satellite. A configured MapTiler key is used by the road-layer handler; provider-specific duplicate buttons are no longer shown.
- Post a road report and open the app on a different device to verify Supabase sync.

## What is / isn't implemented
- MapTiler streets raster style is enabled by a button in Map controls; existing MapLibre 3D perspective uses MapTiler vector style if key is configured. OpenStreetMap fallback remains.
- Supabase community report GET/POST via Vercel Functions; RLS SQL included. If backend fails, local report storage still works.
- TomTom nearby road-segment speed and traffic-flow raster overlays in 2D/3D via server-side proxies. Flow starts with navigation and refreshes once per minute while the page is visible. Requires `TOMTOM_API_KEY` with Traffic API access in Vercel, then redeploy. Green/amber/red roads show provider flow; unavailable coverage or credentials are never interpreted as clear traffic. OSRM route ETA still excludes traffic delay; traffic-aware route selection is not implemented.
- Existing driving/running/walking/rail/prayer and other V6.3.2 functionality retained.
- No genuine traffic-light countdown, smartwatch pairing, native CarPlay/Android Auto, or dialect voice engines.
- Browser/GPS and third-party service calls must still be tested on deployed site; static checks do not establish successful live integrations.

## Notes
- Public routing/geocoding/tiles endpoints can have usage restrictions. For production traffic, obtain appropriate paid/licensed service plans.
- MapTiler raster tile API path may vary with your account/plan; check MapTiler dashboard if the map falls back.
- Never send secrets in chat or commit them into GitHub.

## Navigation audit (1 November 2026)

See [AUDIT_2026-11-01.md](./AUDIT_2026-11-01.md) for repaired defects, a function-by-function matrix and the remaining production/device gates. Run `node --test tests/audit.test.cjs` for the regression suite.

Typing at least 3 characters now queues Photon autocomplete after a 350ms pause. Enter and Search retain explicit Nominatim-compatible lookup. Public Nominatim never receives typing requests. Photon demo usage is for low-volume beta, with no availability guarantee; set `JOMGERAK_CONFIG.autocompleteUrl` to a dedicated Photon-compatible HTTPS `/api/` endpoint before public scale. `GEOCODING_BASE_URL` optionally supplies an HTTPS Nominatim-compatible production base URL via `/api/public-config`; no secret may be embedded in that public URL. The public fallback is for low-volume beta use only. Its client queue is per tab, not the required application-wide rate limiter. Read the official policy and audit before public launch.


## 3D interaction and map-control repair

See [MAP_INTERACTION_REPAIR.md](./MAP_INTERACTION_REPAIR.md) for the pointer-event and GPS-camera fixes, the consolidated map menu, Settings-only installation, reference technology findings and the WebGL verification limit.
