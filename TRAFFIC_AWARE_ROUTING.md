# Traffic-aware route planning and ETA

`api/route.js` calls TomTom Calculate Route with `traffic=true`, `departAt=now`, `computeTravelTimeFor=all`, text instructions and up to two alternatives. It validates 2–7 Malaysian coordinates and car/motorcycle/4x4 modes, rejects truck/walk/rail and keeps the existing TOMTOM_API_KEY server-side. Upstream errors never expose request URLs or credentials. TomTom guidance is normalised to the app's geometry/legs/steps shape, with authoritative plain-text instructions escaped for HTML.

`routing.js` is shared by Find Route, multi-stop planning and rerouting. It tries TomTom first and falls back to OSRM with explicit no-traffic metadata. Alternatives retain their own traffic estimates. Existing 2D/3D maps, vehicle marker and destination pins are retained.

Driving ETA interpolates the provider's cumulative time profile along route progress rather than dividing remaining distance by instantaneous GPS speed, which would discard congestion delay. Single-leg online navigation refreshes the remaining route on accurate GPS updates at most once per two minutes, using existing stale-request protection and without fitting/resetting the camera. Multi-stop routes retain their original estimate; after three minutes it is labelled as a previous traffic estimate awaiting refresh. No route is labelled current indefinitely. Routing failures retain an honest OSRM label.

No credentials or Vercel settings were changed. The existing key must permit TomTom Routing in the deployment being tested. Traffic Flow access alone does not prove Routing entitlement. The key/access and real TomTom route responses cannot be verified locally without that server environment; merge/deploy and test the preview/production endpoint to verify live entitlement. OSRM fallback is not proof of successful TomTom routing.

Validation: 58 Node tests pass and git diff --check is clean. Tests cover provider request parameters, invalid coordinates, access-denied responses, credential non-disclosure, normalisation of geometry/guidance/delay, profile-based remaining time, TomTom preference and explicitly marked fallback, plus existing stale-route/reroute regressions. Physical driving and live provider integration remain unverified.

Official contracts: https://docs.tomtom.com/routing-api/documentation/tomtom-maps/v1/calculate-route and https://docs.tomtom.com/routing-api/documentation/tomtom-maps/v1/guidance-instructions.
