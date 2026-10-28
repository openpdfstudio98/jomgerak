# JomGerak V5.2 Smart Navigation (BETA)

## Deploy
Extract ZIP and upload the files to the ROOT of your existing GitHub repo, retaining `api/reports.js`. Vercel deploys from GitHub. The ZIP itself must not be uploaded as the web app. HTTPS is required for GPS.

## Features
- Unified floating control: Map Style, Journey, Route Tools in one menu. Compact driving HUD and speed display.
- MapLibre 3D perspective with smoothed heading and GPS-follow camera. Without a licensed vector style it uses raster tiles: pitched view is NOT true 3D buildings.
- Automatic rerouting if off-route by >100 m for >7 seconds with GPS accuracy <=45 m, online, and a 45-second cooldown; OSRM public routing.
- Trip dashboard shows remaining route distance and ETA based on GPS or OSRM speed, NOT live traffic.
- Safety notifications for low GPS accuracy, no internet, and failed reroutes. Not official road hazard alerts.
- Route POI searches around five sampled points; facilities may not have direct road access. No calculated detour time.
- Installable PWA where supported; basic app shell caching only.
- Preserved route alternatives, GPS, voice navigation, BM/EN, weather forecast, saved places, local trip history, fuel estimates and optional shared reports.

## Important limitations
- Toll prices/avoidance, live traffic ETA, road speed limits, official flood warnings, full offline map/routing, and native Android APK are NOT implemented.
- Public OSRM, Nominatim, OpenStreetMap tiles, Overpass, and Open-Meteo are rate-limited or subject to terms. Use licensed/self-hosted providers before public scale.
- 3D vector buildings require licensed vector tiles with building layers and appropriate configuration. Raster perspective is not building geometry.
- Community reports need Supabase. Run `supabase_schema.sql`, set `SUPABASE_URL` and `SUPABASE_SERVICE_ROLE_KEY` in Vercel Environment Variables only; NEVER expose service role key in `config.js` or GitHub. Set `communityApi: '/api/reports'` in config.js. Add anti-spam and moderation for public use.
- GPS and speech require device/browser permissions. Do not operate controls while driving.
- Native APK requires Capacitor/Android Studio setup, permissions, testing, and signing. This ZIP is for GitHub/Vercel PWA, not an APK.

## Testing
JavaScript syntax checked with `node --check` for inline scripts, service worker, config and API. No claim of actual GPS/Android/API live testing. Test GPS, camera, routes, install, and deployment on real Android over HTTPS.


## V5.3 UI & bilingual update
- Unified controls restyled with smaller cards, spacing, responsive scrolling and dark-mode support.
- Added translations for the unified control menu, route options, saved/share buttons, quick destinations, voice rate and other static UI strings.
- Language switch changes supported static labels immediately and toast messages with dictionary entries. Dynamic third-party place names, road names, user content, and some generated route messages may remain in their original language.
- No new routing, map, toll or community backend capabilities in this release.
- For deployment, replace index.html and sw.js, or upload all ZIP contents to GitHub repository root.
- JavaScript syntax checked, not browser/device integration tested.


## V5.4 Official Branding
- Unified JomGerak Modern Pin + Road icon across in-app header, navigation HUD, PWA launcher icon, maskable Android icon, favicon and Apple touch icon.
- New assets: icon.svg, icon-maskable.svg, icon-48.png, icon-192.png, icon-512.png, icon-maskable-512.png, favicon.ico.
- Updated manifest theme/background colors and service-worker cache version to refresh icons.
- Deploy ALL files in ZIP to repository root; keep API folder. If Android has an older installed PWA icon, remove its old shortcut/PWA and install again after Vercel deploy. Browser favicon and icon caches may persist.
- No new routing or GPS behavior changes in this branding release.
