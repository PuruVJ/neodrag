export { DragNeodrag, type DragEngineOptions, type DragNeodragDebugSnapshot } from './engine/drag-neodrag.ts';
export {
	dragExtensions,
	registerDragExtensions,
	type DragExtensions,
	type DragExtensionRegistry,
} from './engine/extension-registry.ts';
export { DraggableEngineExtensions, ensureDraggableEngineExtensions } from './draggable/engine-extensions.ts';
export { ResizableEngineExtensions, ensureResizableEngineExtensions } from './resizable/engine-extensions.ts';
export { interactionDefaults, InteractionDefaultsRegistry } from './interaction-defaults.ts';
export type { EngineCostSnapshot, CostSpanStat } from './engine-profile.ts';
export {
	hasReactiveSlots,
	resolvePluginList,
	PluginListResolver,
	resolvedPluginsUnchanged,
} from './resolve-plugins.ts';
export { TargetBinding, type TargetBindingContext, type TargetBindingOptions } from './target-binding.ts';
export {
	BindingHandle,
	DragHandle,
	DropHandle,
	ResizeHandle,
	type NeodragHost,
} from './handles.ts';
export { transitionSession } from './state-machine.ts';
export type { DragCallbackHandlers } from './drag-callbacks.ts';
export { createDragCallbacksPlugin, eventPayload, hasDragCallbacks } from './drag-callbacks.ts';
export { DEFAULT_DRAG_THRESHOLD, resolveDragThreshold, type ResolvedDragThreshold } from './threshold.ts';
export {
	SensorBase,
	PointerSensor,
	KeyboardSensor,
	KeyboardMoveSensor,
	POINTER_SENSOR_KEY,
	KEYBOARD_SENSOR_KEY,
	KEYBOARD_MOVE_SENSOR_KEY,
	installDefaultSensors,
	type Sensor,
	type SensorHost,
	type PointerSensorOptions,
	type KeyboardSensorOptions,
} from './sensors/index.ts';
export {
	KEYBOARD_POINTER_ID,
	pointerToInput,
	keyboardToInput,
	programmaticToInput,
	submitInteraction,
	isPointerInput,
	isKeyboardInput,
	isProgrammaticInput,
	nativePointerEvent,
	interactionPointerId,
	type InteractionInput,
	type InteractionKind,
	type InteractionPhase,
	type PointerInteractionInput,
	type KeyboardInteractionInput,
	type ProgrammaticInteractionInput,
} from './interaction-input.ts';
export { keyboardDrag, ariaDrag, KEYBOARD_DRAG_KEY, ARIA_DRAG_KEY } from './a11y/index.ts';
export type { KeyboardDragOptions, AriaDragOptions } from './a11y/index.ts';
export {
	SORTABLE_ROW_ATTR,
	SORTABLE_KEY_ATTR,
	sortableRowAttrs,
	sortableItemAttrs,
	dragTargetAttrs,
	dropZoneAttrs,
	resizeFrameAttrs,
	type NeodragMarkupAttrs,
} from './element-props.ts';
export {
	DRAG_MARKUP_NEODRAG,
	DRAG_MARKUP_STATE,
	DRAG_MARKUP_COUNT,
	dragStateMarkupAttrs,
	applyDragMarkupIdle,
	applyDragMarkupDragging,
	applyDragMarkupEnd,
	type DragMarkupState,
} from './drag-markup.ts';
export {
	MarkupAdapter,
	DomMarkupAdapter,
	createDomMarkupAdapter,
	applyMarkupAttr,
} from './markup-adapter.ts';
export { SORTABLE_DROP_KEY } from './sortable-keys.ts';
export {
	IntentSession,
	SortableContext,
	SortableRegistry,
	sortableRegistry,
} from './sortable/context.ts';
export type { SortableCommit } from './sortable/context.ts';
export { SortableEngineExtensions } from './sortable/engine-extensions.ts';
export { SortableDropCoordinator, sortableDrop, ContainerDropState } from './sortable/commit.ts';
export { SortableIntent } from './sortable/intent.ts';
export { SortableNodeLayout, sortableNodeLayout } from './sortable/node-layout.ts';
export { SortableDragData } from './sortable/session-data.ts';
export type { SortableDragPayload } from './sortable/session-data.ts';
export {
	isSortableDragPayload,
	sortableDragKey,
	sortableSourceId,
} from './sortable/session-data.ts';
export {
	invalidateSortableLayoutForNode,
	clearSortableVisualTransformsForNode,
} from './sortable/node-layout.ts';

export function invalidateSortableLayout(invalidate: () => void) {
	invalidate();
}
export { registerSortableRowMarkup, sortableRowMarkup } from './sortable/row-markup.ts';
