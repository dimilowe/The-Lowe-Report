---
name: Optional article Visual Mode
description: Product decisions behind the watch-and-read experience and preserving normal article reading.
---

Visual Mode must be optional; normal article reading remains the default. It should let readers keep one YouTube video or image above the full scrollable article and switch the top media by selecting an embedded visual.

**Why:** The user explicitly chose an optional mode rather than making this the default, after previously deciding to keep the existing site design. Google Search is an important source of their article traffic.

**How to apply:** Do not replace normal article reading, remove the full server-rendered content, or alter canonicals/advertising context as part of Visual Mode changes. Support one active player at a time and preserve access to the complete article.

Visual Mode should follow the user's sketch: two clearly contained, inset panels stacked vertically, with the centered visual above and the full independently scrollable article below.

**Why:** The user rejected the initial edge-to-edge layout as unlike the sketch and reported clipped text and off-center video on iPhone.

**How to apply:** Preserve the two-panel separation and test long titles, unbroken URLs, oversized article media and narrow/landscape viewports. Checking that the dialog exists is insufficient; verify that its content stays within the visible viewport and that focusing controls does not shift the page sideways.
