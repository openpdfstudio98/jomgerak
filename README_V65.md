# JomGerak V6.5 – Smart Driving Mode

## Changes
- Visible **Start Driving / Stop** control, only starts with a route and GPS permissions.
- Compact driving layout that hides search/controls to prioritize map; existing navigation HUD remains visible.
- **Overview** fits the route, **Recenter** resumes GPS follow, **2D / 3D** toggles existing MapLibre perspective.
- GPS updates camera in navigation. 3D uses device heading where supported, otherwise current map bearing. No fabricated location.
- Existing V6.4.2 APIs and features retained.

## Limitations
- This is a browser/PWA, not native Android Auto or CarPlay.
- True building 3D requires compatible vector map data; perspective raster is not 3D buildings.
- GPS heading may be unavailable when stationary; mobile Chrome permissions/HTTPS required.
- Real-time traffic-aware ETA, traffic-light countdown and lane guidance are not implemented.
- Static syntax checks pass; road/device E2E testing is not included. Test while stationary, never operate the phone while driving.

## Deploy
Upload all ZIP contents (not the ZIP itself) to GitHub repo root. Preserve `api/`. Commit and wait for Vercel Ready. Reload app in incognito to bypass old service worker cache. Existing Vercel environment variables stay configured.
