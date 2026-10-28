# JomGerak V6.6.8 — Startup Unblock

- Replaces window.onload with DOMContentLoaded startup.
- Isolates theme, language, search, voice, community, and service worker startup so one failure does not prevent others.
- Loads map separately and retries Leaflet via alternative CDN with timeout.
- Makes Leaflet primary script asynchronous to avoid blocking HTML parsing.
- Bumps PWA cache version.

Test on a parked device in Chrome Incognito. Confirm map tiles and controls after deployment.
