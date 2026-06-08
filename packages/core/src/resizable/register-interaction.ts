import { registerResizeInteraction } from '../engine/resize-slot.ts';
import { ResizeInteraction } from '../engine/resize-interaction.ts';

registerResizeInteraction((deps) => new ResizeInteraction(deps));
