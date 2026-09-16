---
'@neodrag/core': patch
---

fix(sortable): in `indicator: 'line'` mode, draw the drop-line on the boundary the item will land on when dragging past its original slot. The line was measured against the full item list (ghost included) with an insert-after-removal index, so downward drags showed the line one slot above the committed position.
