---
name: Advertising context privacy and taxonomy
description: Constraints for contextual advertising signals on editorial pages.
---

Advertising context must use assigned editorial category slugs, not inferred interests, personal data, or display-only fallback labels. An article with no assigned category must send no category context.

**Why:** The user requested reliable content-based signals and explicitly required no personal data and no signal when a category is absent. A visual fallback such as “Culture” is not evidence of an assigned topic.

**How to apply:** Preserve this distinction when expanding ad targeting or changing article/category presentation. Keep identity and private workspace content out of the ad request.
