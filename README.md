# JomGerak Advanced Beta — GitHub / Vercel

Upload contents of this ZIP to the **repository root**. Vercel framework: Other; build command: none; output directory: blank/root. `index.html` is the entrypoint. HTTPS is required for GPS.

## Implemented now
- Retains V4.8 Leaflet search, routes, driving mode, map styles, BM/EN, saved destinations, local reports and PWA.
- Route alternatives from OSRM if returned; distance/time comparison; approximate fuel costs (static illustrative fuel rates, NOT live pricing).
- GPS speed from browser geolocation; GPS accuracy varies. Voice rate preference; TTS depends on installed voices.
- Trip history and GPS track saved **only on this device**; export as JSON. Clear browser storage to delete.
- Route facilities from OpenStreetMap Overpass; weather forecast from Open-Meteo. Not certified hazard/flood data.
- Optional real MapLibre GL 3D camera (pitch + GPS heading) using MapTiler vector tiles. To enable: create your own MapTiler key, restrict it to your domain, set `maptilerKey` in `config.js`; select 3D View. MapLibre loads only when requested. MapTiler may charge beyond free quota. 3D map route line is shown; advanced 3D labels/buildings depend on the selected style. Leaflet controls and 3D map overlays need device QA.
- Optional shared community reports via Vercel serverless `api/reports.js` and Supabase. To enable: run `supabase_schema.sql`; set `SUPABASE_URL` and `SUPABASE_SERVICE_ROLE_KEY` as Vercel environment variables; set `communityApi: '/api/reports'` in `config.js`. **Do not put service role key in browser code**. Add CAPTCHA, per-IP rate limiting, moderation, abuse reporting and spam prevention before public release. User reports are unverified.

## Not implemented / needs data or major engine work
- **Smart Toll Malaysia**: actual toll detection, toll avoidance and prices by vehicle class require a toll-aware routing engine and licensed Malaysian plaza/tariff data. The app labels toll status unknown; the existing Avoid Toll / Highway controls do not modify OSRM routes.
- **Speed limits**: current road limit and overspeed warnings are not available without map-matching and reliable speed limit data. GPS speed alone is available.
- **Flood alerts**: official Malaysian warnings not integrated. Open-Meteo gives forecasts, not verified local flood hazards.
- **Live traffic ETA**: no real-time traffic provider; community markers do not automatically change routing/ETA.
- **Offline navigation**: service worker caches the app shell only; offline tiles and routing need licensed offline maps, storage quota strategy and offline routing engine. Do not claim offline navigation works.
- **Native APK**: this package is Website/PWA, not a compiled Android APK. Capacitor wrapping and Android build/signing are a separate step.

## Testing
Run `node --check` on extracted inline JavaScript, deploy to Vercel and test on a real Android device: GPS permission, voice, driving mode, 3D tile load, community sync and routing. Public OSRM/Overpass/Nominatim are not production SLA services; use your own/commercial backend for scale.

**Safety**: Do not operate the app while driving. This beta must not be the only navigation reference.
