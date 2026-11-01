# Garage marker in 3D

MapLibre previously drew blue GPS circles while Leaflet used Garage's vehicle SVG. The 3D renderer now uses a DOM Marker containing that same Garage SVG, with profile colour, map-aligned GPS heading and a viewport-facing icon. Profile changes update the existing element. Route/style refreshes do not recreate the legacy circles. No marker is shown before a genuine last GPS fix; missing stationary heading retains the last valid moving heading.

Production check on 1 November 2026: the primary site's `/api/public-config` returned `trafficEnabled: true`; `/api/traffic` at a generic test coordinate returned TomTom Traffic Flow successfully. The user's screenshot is on a branch-preview hostname, where environment variables may differ. The public configuration now identifies the deployment environment and the missing-key message explicitly identifies Preview. No credentials or deployment settings were changed. This check establishes the Production segment endpoint works; it does not establish every Preview environment or every flow tile works.

Vercel: set the existing `TOMTOM_API_KEY` for **Preview** as well as **Production**, then redeploy the affected preview. Do not put the key into browser config or GitHub.

Validation: 48 Node tests pass, including marker creation only after GPS, SVG identity/colour, position/heading updates, single-marker reuse, legacy-circle removal and Preview status. `git diff --check` clean. Real WebGL/device rendering remains unverified in this environment.
