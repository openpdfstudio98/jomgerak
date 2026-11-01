# 3D route pins and quiet traffic display

MapLibre now shows only the selected destination pin in red, as requested. The vehicle already indicates current position, so no start pin or intermediate-stop pins are rendered in 3D. They update on endpoint selection, swapping, clearing and route/style changes. Matching state does not create duplicates; obsolete markers are removed. Location names only enter accessible labels through setAttribute, never markup. Existing vehicle GPS marker is retained. The 2D map also omits the green origin marker; start coordinates remain available through the origin search field, while the destination remains draggable.

Successful traffic tile loading hides the explanatory banner. Provider attribution remains on both map renderers; loading/configuration/error status remains available instead of claiming missing traffic data is clear flow.

Validation: 53 Node tests pass and git diff --check is clean. New tests cover destination-only rendering even with an origin and multi-leg route, duplicate prevention, removal after edits, hidden successful-flow banner and retained attribution. Physical-device/WebGL rendering remains unverified in this environment.


## Search-as-you-type

Both origin and destination inputs now request Photon autocomplete after a 350ms pause with at least 3 characters. Requests share cancellation and sequence protection with explicit Search/Enter; clearing, Escape, changing text, selection or outside dismissal invalidates pending results. IME composition waits until completion. Results are Malaysia-only, rendered through existing escaped suggestion rows, cached for five minutes (maximum 100 terms) and bounded by an eight-second timeout. Search/Enter retains the existing explicit geocoder, and typing never uses public Nominatim.

Live request for the generic term Klang returned two Photon features. This establishes endpoint access from the test environment, not every device/network. Photon supports search-as-you-type and permits reasonable demo use, with throttling and no availability guarantee. A dedicated compatible endpoint can be supplied via `JOMGERAK_CONFIG.autocompleteUrl` for production scale. Source: https://github.com/komoot/photon (README and docs/api-v1.md).
