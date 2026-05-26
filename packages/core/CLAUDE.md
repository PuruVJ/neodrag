# Claude Development Notes

## Precision Bug Fix (Issue #232)

### Problem
Dragging elements at large coordinates with small movements caused floating-point precision loss, resulting in incorrect element positioning.

### Root Cause
JavaScript floating-point arithmetic loses precision with large numbers. The delta calculation `e.clientX - instance.ctx.initial.x - instance.ctx.offset.x` was vulnerable to precision errors when dealing with large coordinate values.

### Solution
1. **Precision Fix**: Modified delta calculation to use inverse scale compensation:
   ```javascript
   const inverse_scale = this.#calculate_inverse_scale(instance);
   const target_offset_x = (e.clientX - instance.ctx.initial.x) * inverse_scale;
   const target_offset_y = (e.clientY - instance.ctx.initial.y) * inverse_scale;
   instance.ctx.delta.x = target_offset_x - instance.ctx.offset.x;
   instance.ctx.delta.y = target_offset_y - instance.ctx.offset.y;
   ```

2. **Performance Optimization**: Cached `inverse_scale` as instance property to avoid expensive recalculation:
   - Calculate once in `handle_pointer_down`
   - Reuse cached value in `handle_pointer_move` and `handle_pointer_up`

### Test Strategy
Created comprehensive cross-browser tests that:
- Use large coordinates (1000000, 500000) to trigger precision bugs
- Verify exact pixel movement after drag operations
- Test across WebKit, Chromium, and Firefox
- Fail with buggy code (6 failures: 2 tests × 3 browsers)
- Pass with precision fix applied (0 failures)

### Key Files Modified
- `src/index.ts`: Core precision fix and optimization
- `tests/plugins.test.svelte.ts`: Precision detection tests
- `tests/components/PrecisionTest.svelte`: Test component with Svelte 5 reactivity

### Browser Differences
- **Firefox**: Shows `Infinity` values with extreme coordinates
- **WebKit**: Elements don't move at problematic coordinates
- **Chrome**: Sometimes works but inconsistent

### Technical Details
- Uses CSS `translate` property (not `transform`) for positioning
- Inverse scale calculation handles SVG vs HTML elements differently
- Added `inverse_scale: number` to DraggableInstance interface
- Tests use `window.getComputedStyle(element).translate` for verification

### Testing Commands
- `pnpm test`: Run all tests including precision tests
- Tests must show exactly 6 failures with buggy code, 0 with fix applied