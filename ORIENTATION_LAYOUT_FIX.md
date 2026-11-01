# Phone orientation layout repair

The short-landscape summary inherited the desktop translateX(-50%) while also using left/right offsets. This clipped the leading duration and placed Driving over the summary. Clear the transform and use dedicated landscape regions: guidance and summary on the left, speed on the right, Driving above the summary, map zoom controls above speed. Respect safe-area insets.

Resize/orientation/visualViewport events now resize both Leaflet and MapLibre immediately on an animation frame and once after 250ms to catch settled mobile browser chrome dimensions. Resize does not reset zoom, position or GPS-follow preference.

Validation: 54 Node tests pass; diff whitespace check clean. Browser fixture reviewed at 844×390 landscape and switched to 390×844 portrait without reloading; summary values stay visible and Driving is separated. Screenshot docs/orientation-landscape.jpg uses a synthetic route with tiles omitted. This establishes layout behavior, not physical phone rotation or WebGL rendering.
