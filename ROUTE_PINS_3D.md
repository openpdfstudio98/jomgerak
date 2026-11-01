# 3D route pins and quiet traffic display

MapLibre now shows only the selected destination pin in red, as requested. The vehicle already indicates current position, so no start pin or intermediate-stop pins are rendered in 3D. They update on endpoint selection, swapping, clearing and route/style changes. Matching state does not create duplicates; obsolete markers are removed. Location names only enter accessible labels through setAttribute, never markup. Existing vehicle GPS marker is retained. The 2D map also omits the green origin marker; start coordinates remain available through the origin search field, while the destination remains draggable.

Successful traffic tile loading hides the explanatory banner. Provider attribution remains on both map renderers; loading/configuration/error status remains available instead of claiming missing traffic data is clear flow.

Validation: 50 Node tests pass and git diff --check is clean. New tests cover destination-only rendering even with an origin and multi-leg route, duplicate prevention, removal after edits, hidden successful-flow banner and retained attribution. Physical-device/WebGL rendering remains unverified in this environment.
