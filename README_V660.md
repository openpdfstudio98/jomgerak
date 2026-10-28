# JomGerak V6.6.0 – Premium Navigation

Upgrade based on V6.5.5. Includes MapTiler vector Streets style for 3D and night, MapLibre perspective, optional 3D building extrusion when vector source and building heights are available, smooth heading-follow camera, GPS position dot on vector map, clearer dual-layer route, and compact 2D / 3D / Follow GPS view controls. All existing scripts, routes, APIs, modes, reports, and cost panels retained.

MapTiler public API key must already be configured via Vercel. If absent, a raster map fallback remains and true 3D buildings are not available. The appearance is JomGerak's own; it does not use Google or Waze data. Traffic ETAs and toll prices remain limited to the previously connected data sources. Browser GPS and voice features require device permission.

Extract and upload all files to GitHub root; redeploy Vercel and refresh PWA cache. Do not use the interface while driving.
