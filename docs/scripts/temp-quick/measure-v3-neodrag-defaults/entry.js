import { ignoreMultitouch, applyUserSelectHack, threshold, touchAction } from '@neodrag/core/plugins';
import { Neodrag } from '@neodrag/core';
const engine = new Neodrag({ plugins: [ignoreMultitouch, applyUserSelectHack, threshold(), touchAction] });