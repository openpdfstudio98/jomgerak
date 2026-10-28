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
- Controls → Map → **API Connections** → MapTiler / Nearby Traffic.
- Post a road report and open the app on a different device to verify Supabase sync.

## What is / isn't implemented
- MapTiler streets raster style is enabled by a button in Map controls; existing MapLibre 3D perspective uses MapTiler vector style if key is configured. OpenStreetMap fallback remains.
- Supabase community report GET/POST via Vercel Functions; RLS SQL included. If backend fails, local report storage still works.
- TomTom live *nearby road-segment speed* via server-side proxy, **not** live route-wide ETA or automatic traffic-aware routing.
- Existing driving/running/walking/rail/prayer and other V6.3.2 functionality retained.
- No genuine traffic-light countdown, smartwatch pairing, native CarPlay/Android Auto, or dialect voice engines.
- Browser/GPS and third-party service calls must still be tested on deployed site; static checks do not establish successful live integrations.

## Notes
- Public routing/geocoding/tiles endpoints can have usage restrictions. For production traffic, obtain appropriate paid/licensed service plans.
- MapTiler raster tile API path may vary with your account/plan; check MapTiler dashboard if the map falls back.
- Never send secrets in chat or commit them into GitHub.
