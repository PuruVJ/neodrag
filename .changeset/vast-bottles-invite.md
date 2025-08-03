---
'@neodrag/core': patch
---

Fix floating-point precision bug in drag calculations at large coordinates (issue #232)

This fix addresses a critical precision issue where dragging elements at large coordinates with small movements caused floating-point precision loss, resulting in incorrect element positioning. The delta calculation has been optimized to use inverse scale compensation, and the expensive inverse_scale calculation is now cached as an instance property for improved performance.

- Fixed precision loss in delta calculations at large coordinates
- Optimized performance by caching inverse_scale calculation
- Added comprehensive cross-browser tests to detect precision bugs
- Tests now properly fail with buggy code and pass with the fix applied
