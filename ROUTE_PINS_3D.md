# 3D route pins and quiet traffic display

MapLibre now shows selected start/destination pins and intermediate arrival points from the current route's legs. Pins use the same green/red meaning as the 2D map, with blue intermediate stops. They update on endpoint selection, swapping, clearing and route/style changes. Matching state does not create duplicates; obsolete markers are removed. Location names only enter accessible labels through setAttribute, never markup. Existing vehicle GPS marker is retained.

Successful traffic tile loading hides the explanatory banner. Provider attribution remains on both map renderers; loading/configuration/error status remains available instead of claiming missing traffic data is clear flow.

Validation: 50 Node tests pass and git diff --check is clean. New tests cover endpoints/stops, duplicate prevention, removal after edits, hidden successful-flow banner and retained attribution. Physical-device/WebGL rendering remains unverified in this environment.
