# JomGerak V6.4.2 — Journey Controls visibility fix

Problem: V5.5 `jg55Show()` placed results in `#jg55Panel` **after** the Map/Journey/Settings tabs, so on mobile a tap on tools like Compare Routes, Multi-Stop, Pit Stop, Trip Costs, Route Weather, Save Offline, Verify Reports could appear to do nothing because the results were outside the visible scroll region.

Fix: Move `#jg55Panel` into the currently selected Journey/Settings tab when opened, then scroll it into view. Increase mobile controls scroll height and allow results to expand. Keep all existing functionality and API connections. Service worker cache version bumped.

**Limitations:** Buttons may still require an active route, location permission, network access, or external API. Avoid toll/highway toggles cannot affect public OSRM routes; no true offline map/routing, no official toll rate lookup, and no verified community report moderation. This is a UI visibility fix, not a claim that all integrations now work. Test each button on deployed Android and report specific failures.
