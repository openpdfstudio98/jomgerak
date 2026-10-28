# JomGerak V6.6.7 — Map startup and cache consistency

Changes:
- Includes `v666.js` in `index.html` and in the service worker asset list, enabling startup diagnostics.
- Aligns service worker cache name with this release, caches all present local `v*.js` modules and tolerates individual precache failures.
- Uses network-first fetching for local assets with cached fallback when offline; never intercepts `/api/` or external map tile requests.
- Leaflet 1.9.4 is requested from cdnjs with unpkg fallback when the primary script fails to load.
- Reports Leaflet or map initialization failures instead of stopping silently.
- Requests a service worker update without using HTTP cache.

Testing: Syntax and ZIP checks are performed before delivery. Browser/map tile access, Vercel configuration, GPS and CDN availability still need testing on device.

Deploy: Upload all files to the repository root. Once Vercel is Ready, open in an incognito tab or close/reopen the installed PWA to refresh its service worker.
