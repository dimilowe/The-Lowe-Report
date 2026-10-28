---
name: Dependency restoration constraints
description: Security policy constraints when restoring this project's dependencies.
---

Dependency restoration must use security-approved releases; do not assume historical lockfile versions remain installable.

**Why:** Restoring this workspace encountered critical-CVE firewall blocks on both the framework and test runner. A routine reinstall can therefore require coordinated patched dependency updates.

**How to apply:** Follow the package-management skill, respect firewall blocks, and check which package is actually blocked before changing application code or root-directory settings.
