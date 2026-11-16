---
name: Production build isolation
description: Non-obvious build constraints when maintaining this Next.js app alongside a separate design sandbox.
---

Keep standalone artifacts isolated from the main app's TypeScript checks. Retain the Webpack production build and external Node database drivers unless a full replacement build has been verified.

**Why:** The production Turbopack build encountered an external Replit demo path during CSS compilation. Webpack compiled the app but bundling WebSocket optional native modules broke sitemap generation. Separate mockups also use their own module aliases and compiler settings.

**How to apply:** Do not broaden the app compiler's scope to include independent artifacts. When changing bundlers or server dependency handling, verify the complete build, including sitemap generation, and start the compiled app; compilation alone is not sufficient.
