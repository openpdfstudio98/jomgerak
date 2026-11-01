# Installed fullscreen display

The manifest previously requested standalone, which permits visible system chrome. It now prefers fullscreen in both display and display_override, with standalone fallback when fullscreen is unsupported. HTML enables viewport-fit=cover and the iOS standalone/translucent-status-bar hints. Full-display map containers fill the viewport; existing safe-area control spacing is retained. Theme/background colours use navy instead of the bright blue/white bars shown in the recording. Service-worker cache is bumped.

58 Node regression tests pass and git diff --check is clean. Manifest JSON parsed and fullscreen preference verified. Actual Android WebAPK/system-bar behavior cannot be verified in the cloud browser; fullscreen is a browser/OS preference, not a guarantee that all system UI stays hidden. Gesture bars can reappear when users interact with system edges. iOS may retain system UI. Existing installations may receive manifest updates later; close/reopen after deployment, or remove/re-add the installed shortcut if its display metadata remains stale. Site storage must not be cleared.

Reference: https://developer.mozilla.org/en-US/docs/Web/Progressive_web_apps/Manifest/Reference/display
