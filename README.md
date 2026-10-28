# JomGerak V5.5 – Ultimate Navigation (Web/PWA Beta)

This build upgrades the existing V5.4 app without replacing its GPS, routing, language, saved places, community reports, MapLibre 3D perspective, or brand icons.

## Deploy to GitHub + Vercel
1. Extract the ZIP locally.
2. Upload **all contents**, not the ZIP itself, to the root of your existing GitHub repository (preserve `api/reports.js`).
3. Commit. Vercel should deploy the updated static site and optional serverless API.
4. On Android, reopen the PWA; if an older version persists, close it fully and refresh online. The service worker now caches `v55.js`.
5. Keep Supabase service-role credentials only in Vercel environment variables, never in GitHub.

## Implemented features
- **Compact three-tab Controls**: Map / Journey / Settings. Existing map and Journey controls remain; new tools are under Journey and Settings. BM/EN labels for new controls.
- **Driving Mode 2.0**: simplified, map-first HUD using live turn instructions and route-progress metrics, toggle under Settings; returns to normal panels on exit. Navigation still requires GPS, HTTPS and permission.
- **Smart Route Comparison 2.0**: compare available OSRM alternatives by distance, duration and fuel estimate using the stored vehicle profile; select a route.
- **Smart Pit Stop**: select petrol, restaurants, EV charging, prayer facilities, or toilets. Uses Overpass OSM nodes around three sampled route points; map markers and destination selection. Direct road access and detour times are **not** verified.
- **Trip Cost Pro**: save per-vehicle consumption, fuel type and user-entered RM/unit price; show one-way and approximate round-trip fuel/energy cost. Toll costs are **not** included.
- **Weather Along Route**: three location-based current weather observations from Open-Meteo. Not time-of-arrival forecasts, official warnings, or official flood alerts.
- **Voice Command**: browser SpeechRecognition if supported. Supported phrases include fuel/petrol, weather/cuaca, follow GPS/ikut GPS, and stop navigation/henti navigasi. Needs mic permission, may require online services; speech may not work in all Android browsers.
- **Multi-Stop Route Planner**: search up to five waypoints via Nominatim; route through start → stops → destination via OSRM; persists waypoint list locally. Stops must be explicitly entered; no optimization.
- **Community Traffic Verification**: status screen honestly explains that shared voting is not available without a database, moderation and anti-abuse. Existing community reports remain intact. **No fake verification button.**
- **My Vehicle Profile**: localStorage-backed vehicle name, fuel type, consumption and manually entered unit price.
- **Offline Trip Preparation**: save route coordinates, trip summary and up to 300 step directions to localStorage; view them without network. **Offline map tiles, full turn-by-turn GPS navigation and offline route calculation are not supported.**

## Critical service limitations
- OSRM public routing, Nominatim search, Overpass and OpenStreetMap tile servers have rate limits and usage policies. Do not use public demo endpoints as a production navigation backend; move to licensed/self-hosted services and enforce caching/quotas.
- Traffic estimates are **not live traffic**; toll detection/pricing and avoid-toll routing are unverified/unsupported; speed-limit and official Malaysian flood feeds are not integrated.
- The MapLibre raster view provides camera tilt only; real 3D buildings need licensed vector tiles/building layers.
- Community reports require the optional Supabase backend (see `supabase_schema.sql`, `api/reports.js`, `config.js`). Cross-user verification votes are **not implemented**.
- PWA service worker caches app shell but not offline road map tiles. PWA is **not** a native Android APK.
- For safety, use voice prompts and configure destinations before driving. Follow road signs and official road closures over app estimates.

## Tests performed
- `node --check` on inline HTML JavaScript, `v55.js`, `sw.js`, `config.js`, and `api/reports.js`.
- HTML parser structural checks for three tabs, new panel and existing controls.
- ZIP CRC validation and expected-file checks.
- **Not** tested: real Android GPS navigation, map API uptime, phone microphone recognition, 3D rendering, Vercel backend, offline PWA lifecycle, or actual road routes. Test these on a stationary phone before relying on them.

## Suggested on-device acceptance tests
1. Set EN, open Controls, confirm Map / Journey / Settings and new tool labels are English; switch back to BM.
2. Calculate route, compare alternatives, save a vehicle profile and check cost calculations.
3. Search and add one stop, calculate route through that stop.
4. Check Pit Stop markers, weather, and offline save/view while online; switch offline and view saved directions.
5. Enable navigation with GPS, try Driving Display, check return to normal panels; test voice command when parked.

## V5.6 Smart Road Safety (beta)
- Adds an **Road Alerts** button to the Journey tab, with bilingual on/off controls for map warnings and voice announcements (voice off by default).
- Alerts are based on **unverified user reports** (existing local reports or reports loaded through configured community API), for accident, closure, flooding, road damage, obstruction, hazards and congestion. Reports about police/checkpoints are **not used** for proximity alerts.
- When GPS navigation is active and accurate to 75m or better, computes nearest point along OSRM route for GPS and reports. Warns if report is within approximately 110m of route and up to 1.6km ahead. This is geometric proximity only; it does not verify lane, road direction, report validity or actual closure.
- Dismiss a particular warning for this session; voice prompts are rate limited to avoid repetitive distractions.
- Existing traffic report creation, map markers, route UI and backend schema remain unchanged.
- This does **not** detect roadblocks/checkpoints, automatically detect accidents, provide verified official road closures, or automatically reroute around hazards. Verified official closure integration requires a licensed, maintained data feed and backend.
- For cross-user report sync, set `communityApi:'/api/reports'` in `config.js`, configure Supabase environment secrets on Vercel and deploy the SQL schema. The existing backend has no user verification or abuse controls and is **not production-ready**.
- Test with a stationary phone and sample community reports before relying on it; always follow actual signs and official directions.

### V5.6 test checklist
1. Open Journey > Road Alerts; toggle warnings and voice in BM and EN.
2. Create a road-hazard report on the map, calculate a route through it and start GPS navigation while stationary to see the warning if the report is ahead.
3. Confirm police/checkpoint reports never generate route proximity warnings.
4. Confirm old routing, saved places, 3D map and PWA still load.
5. Verify that reports and weather aren't presented as official or verified.

## V6.0 – Malaysia Super Navigation (initial beta)
- **Transport selector** Car (existing OSRM driving), Motorcycle (existing driving route is only a rough approximation, not motorcycle-safe), Walking (Valhalla public pedestrian routing with distinct green route and approximate ETA, if available), Rail (official KTM website; no in-app rail routing).
- **3D driving perspective** invokes existing MapLibre 3D perspective mode; no true 3D building layer.
- **Voice destination/start search** uses Web SpeechRecognition when available and opens Nominatim suggestions; microphone permission and browser support required.
- **Navigation voice selector** lists device TTS voices and attempts to apply the selected voice to existing speechSynthesis calls. Browser implementation may prevent overriding native `speak`.
- **Prayer times**: optional Aladhan API estimates based on representative Malaysian city coordinates, NOT official JAKIM zone timings. Official e-Solat JAKIM link is provided. No push prayer alerts in this release.
- Existing V5.6 road alerts, V5.5 tools, GPS, BM/EN, PWA and map features remain.
- Not included: reliable real-time traffic-light countdown, native Android Auto/CarPlay, smartwatch integrations, state-accent TTS, running tracker. These need separate data sources, native SDKs or additional implementation. No dummy buttons for these.
- Production caution: public OSRM, Valhalla, Nominatim and map tile services can rate-limit or reject traffic; obtain a production routing provider. Browser speech may not work on every Android device.
- Test on stationary Android with Chrome and HTTPS, and verify BM/EN, all transport options, voice search, device voices, prayer results, 3D view, V5.6 road alerts and install/update of PWA.
