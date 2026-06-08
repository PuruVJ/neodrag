import { Neodrag } from '@neodrag/core';
import { ignoreMultitouch, applyUserSelectHack, touchAction } from '@neodrag/core/plugins';
import { threshold } from '@neodrag/core';
const engine = new Neodrag({ plugins: [ignoreMultitouch, applyUserSelectHack, threshold(), touchAction] });