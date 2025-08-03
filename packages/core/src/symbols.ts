// Core instance properties
export const root_node = Symbol();
export const plugins = Symbol();
export const controller = Symbol();
export const resolver = Symbol();

// Coordinate and state symbols
export const delta_x = Symbol();
export const delta_y = Symbol();
export const proposed_x = Symbol();
export const proposed_y = Symbol();
export const offset_x = Symbol();
export const offset_y = Symbol();
export const initial_x = Symbol();
export const initial_y = Symbol();

export const is_dragging = Symbol();
export const is_interacting = Symbol();

export const last_event = Symbol();
export const cached_root_node_rect = Symbol();
export const currently_dragged_node = Symbol();

export const plugin_states = Symbol();
export const dragstart_prevented = Symbol();
export const current_drag_hook_cancelled = Symbol();
export const failed_plugins = Symbol();
export const pointer_captured_id = Symbol();
export const inverse_scale = Symbol();

export const paint_effects = Symbol();
export const immediate_effects = Symbol();

export const compartment_map = Symbol();
export const pending_compartments = Symbol();
export const is_flushing_compartments = Symbol();
export const is_processing_external_update = Symbol();
