# JomGerak V6.5.4 – Automatic Toll Status (beta)

## What is implemented
- Petrol estimate remains separate; manual toll input and combined total removed.
- Automatically checks OSM `toll=yes` road tags near 12 sample points along the selected route, using Overpass.
- Shows **toll road detected** if a tagged road overlaps the route geometry, otherwise **not verified**, not RM0.
- Does not invent prices. A verified toll price provider / plaza rate data is required to display RM automatically.
- Refreshes when the user chooses an alternative route or a new route is found.
- Retains professional icons and existing features.

## Limitations
- Sampling and incomplete OSM tagging can miss toll roads; route proximity can also generate false positives near parallel roads.
- OpenStreetMap is community-maintained and not an official toll-rate database.
- Overpass public servers may rate-limit requests or be unavailable. No key required.
- Toll amount **is not yet calculated automatically**. To do that reliably, integrate a toll-pricing provider with verified Malaysia coverage, class and entry/exit plaza data.
- Do not use toll indicators to decide whether to enter a toll road.

## Deploy
Extract ZIP and upload all files including `v654.js` to GitHub root, commit, then wait for Vercel Ready. Test with route KL Sentral -> Putrajaya in Chrome Incognito. Test when parked.
