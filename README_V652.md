# JomGerak V6.5.2 – Cleaner Customer UI

- Removed the customer-facing API Connections panel (API configuration continues to load silently).
- Removed duplicate All Modes V6.3 panel. Existing transport mode controls remain in Journey; feature functions retained in JavaScript.
- Removed nonfunctional Mapbox Streets/Satellite options that required a separate Mapbox token. Added MapTiler Streets button using your configured public MapTiler key; existing OSM fallback stays.
- Replaced common Map/Trip/Settings and map-style emojis with Font Awesome icons.
- Added voice selection listing the actual BM/English/Indonesian TTS voices exposed by Android/Chrome, a Test Voice button, and persisted selection for navigation.
- Gender labels are not inferred; gender selection cannot be guaranteed unless distinct voices are installed and exposed by the device. Install voice packs in Android Text-to-Speech settings if needed.
- Preserved V6.5.1 compact Driving UI, existing API integrations, and other controls.

Upload all files and folders to GitHub root. Redeploy on Vercel. Test in Chrome incognito, then clear PWA cache if needed.
Static syntax/ZIP checks only; real GPS, audio, and API tests on Android still needed.
