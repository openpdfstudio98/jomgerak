# Driving flow and gesture repair

- Start Navigation and Start Driving now share the same default: enable GPS navigation, request 3D, then set a tilted driving camera. A stopped navigation cannot activate a map after its library finishes loading. WebGL/library failure retains usable 2D with a warning.
- Explicitly enable MapLibre drag pan and touch zoom; disable cooperative gestures. Cancel camera easing at the start of a manual touch/mouse gesture and suspend GPS follow until Recenter. Control wrappers no longer capture input outside their actual controls. Canvas interaction surface fills its map container.
- Separate top maneuver guidance from bottom remaining minutes, distance and estimated arrival. A compact traffic status sits below guidance, with no fake congestion or free-flow claims.
- Add same-origin TomTom relative0 traffic raster tiles to both map renderers. Credentials stay in the server environment. Refresh at most once per minute while visible; remove overlays and timers on stop; ignore late configuration responses. Add provider attribution and tile error status. Existing segment-speed query remains available.
- Requires `TOMTOM_API_KEY` in Vercel Production and a redeploy. No credentials were added or changed in this PR. Traffic-aware routing/ETA is not supplied by the existing OSRM route engine.

## Validation

`node --test tests/audit.test.cjs`: 46 passing. Includes default 3D navigation entry, one GPS watch, canceled asynchronous activation, manual-follow suspension, missing traffic configuration, canceled requests, and traffic tile validation/PNG response without credential disclosure.

Browser layout review: 390 × 844 phone iframe, generic synthetic route, no live user location. Map tiles deliberately omitted in the local fixture. This cloud browser has WebGL disabled; actual MapLibre touch panning and live TomTom responses could not be verified here. A successful mocked renderer test is not proof of a physical phone gesture. Screenshot documents layout and unavailable-data behavior only.

Provider contract: https://docs.tomtom.com/traffic-api/documentation/tomtom-maps/v1/traffic-flow/raster-flow-tiles (relative0, 256px PNG, zoom 0–22).
