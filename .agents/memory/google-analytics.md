---
name: Google Analytics integration
description: Non-obvious Google tag queue requirements and account-side automatic page tracking.
---

Preserve the standard Google tag bootstrap's `arguments` objects in the command queue; do not replace them with rest-argument arrays.

**Why:** Browser verification showed that array-based commands were silently ignored, while the standard bootstrap produced successful Google collection requests.

**How to apply:** Keep the standard command format when changing or extracting analytics initialization.

Check the Analytics web stream's Enhanced Measurement settings before adding manual navigation page views.

**Why:** The site's stream had history-based automatic page views enabled. Adding a manual route tracker would double-count navigation.

**How to apply:** Keep a single owner for navigation page views. If automatic history tracking is disabled in the Analytics account, revisit the integration rather than assuming it still measures client-side navigation.
