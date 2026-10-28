# JomGerak V6.5.1 – Clean Driving UI

Fixes overlap at the top of the map while navigating:
- Removed duplicate 'Driving Mode' badge.
- Replaced four always-visible top buttons with one small **Driving / Pandu** button. Tap it to expand Stop, Overview, Recenter, and 2D/3D. Tap again to collapse.
- New controls are hidden outside active navigation.
- Hide the old duplicate driving control stack while V6.5.1 driving mode is active.
- Close any map location popup when navigation becomes active.
- Kept all existing routing, GPS, voice, saved places, APIs, PWA and community features unchanged.
- Updated service-worker cache version.

After deployment, test while parked:
1. Find route and start navigation.
2. Confirm only **Driving** button appears top left, with the navigation HUD at bottom.
3. Tap Driving → Overview/Recenter/3D; tap Driving to collapse.
4. Stop navigation and verify the old search controls return.
5. Reload in an incognito tab if an old PWA service worker still serves cached files.

JavaScript syntax checks are static only. No live phone GPS tests performed.
