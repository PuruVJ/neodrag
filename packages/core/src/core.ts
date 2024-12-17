import type { Plugin, PluginContext } from './plugins.ts';

export function createDraggable({ plugins: initial_plugins = [] }: { plugins?: Plugin[] } = {}) {
	return (node: HTMLElement, plugins: Plugin[] = []) => {
		const default_plugins: Plugin[] = initial_plugins;

		let is_interacting = false;
		let is_dragging = false;

		const offset = { x: 0, y: 0 };
		const initial = { x: 0, y: 0 };
		const proposals: {
			x: number | null;
			y: number | null;
		} = { x: 0, y: 0 };
		const delta: { x: number; y: number } = { x: 0, y: 0 };
		let current_drag_hook_cancelled = false;
		let dragstart_prevented = false;
		let pointer_captured_id: number | null = null;
		let cached_root_node_rect: DOMRect;
		let currently_dragged_element = node;

		const effects_to_run = new Set<() => void>();

		const ctx: PluginContext = {
			proposed: proposals,
			delta,
			offset,
			initial,
			get isDragging() {
				return is_dragging;
			},
			get isInteracting() {
				return is_interacting;
			},
			get rootNode() {
				return node;
			},
			get cachedRootNodeRect() {
				return cached_root_node_rect;
			},
			set cachedRootNodeRect(val) {
				cached_root_node_rect = val;
			},
			get currentlyDraggedNode() {
				return currently_dragged_element;
			},
			set currentlyDraggedNode(val) {
				//  In case a plugin switches currentDraggedElement through the pointermove
				if (
					pointer_captured_id &&
					currently_dragged_element.hasPointerCapture(pointer_captured_id)
				) {
					currently_dragged_element.releasePointerCapture(pointer_captured_id);
					val.setPointerCapture(pointer_captured_id);
				}

				currently_dragged_element = val;
			},
			effect: (func) => {
				effects_to_run.add(func);
			},
			propose: (proposed) => {
				proposals.x = proposed.x;
				proposals.y = proposed.y;
			},
			cancel() {
				current_drag_hook_cancelled = true;
			},
			preventStart() {
				dragstart_prevented = true;
			},
		};

		// For finding duplicates
		const plugin_map = new Map<string, Plugin<any>>();
		for (const plugin of [...plugins, ...default_plugins]) {
			// User plugins first
			const existing_plugin = plugin_map.get(plugin.name);
			if (!existing_plugin || (plugin.priority ?? 0) >= (existing_plugin.priority ?? 0)) {
				// >= instead of >
				plugin_map.set(plugin.name, plugin);
			}
		}

		const ordered_plugins = [...plugin_map.values()].sort(
			(a, b) => (b.priority ?? 0) - (a.priority ?? 0),
		);

		const private_states = new Map<string, any>();
		for (const plugin of ordered_plugins) {
			// Initialize private state
			const maybe_state = plugin.setup?.(ctx);
			flush_effects();
			if (maybe_state) private_states.set(plugin.name, maybe_state);
		}

		// Run own setup
		// On mobile, touch can become extremely janky without it
		set_style(node, 'touch-action', 'none');

		function flush_effects() {
			for (const effect of effects_to_run) {
				effect();
			}
			clear_effects();
		}

		function clear_effects() {
			effects_to_run.clear();
		}

		function run_plugins(
			hook: 'dragStart' | 'drag' | 'dragEnd' | 'shouldDrag',
			event: PointerEvent,
		) {
			let should_run = true;
			dragstart_prevented = false;

			for (const plugin of ordered_plugins) {
				const handler = plugin[hook];
				if (!handler) continue;

				if (current_drag_hook_cancelled && plugin.cancelable !== false) continue;

				const result = handler(ctx, private_states.get(plugin.name), event);

				if (result === false) {
					should_run = false;
					break;
				}
			}

			return should_run;
		}

		function calculate_inverse_scale() {
			// Calculate the current scale of the node
			let inverse_scale = node.offsetWidth / ctx.cachedRootNodeRect.width;
			if (isNaN(inverse_scale)) inverse_scale = 1;
			return inverse_scale;
		}

		const listen = window.addEventListener;
		const controller = new AbortController();
		const event_options = { signal: controller.signal, capture: false };

		// Contrary to what you might believe, this doesn't actually start dragging. This sets up the premise for drag
		// Actual dragging is begun in the pointerdown once all the conditions are met.
		listen(
			'pointerdown',
			(e: PointerEvent) => {
				if (e.button === 2) return;

				// We will run this by default in the drag_start plugin. But not in any other, the user will have to
				// run it in their own plugin
				cached_root_node_rect = node.getBoundingClientRect();

				// Run the plugins
				const should_drag = run_plugins('shouldDrag', e);

				// Some plugin blocked dragStart, dont drag at all
				// Also, should_drag doesn't take any effect callbacks, so no need to flush to clear
				if (should_drag === false) return;

				if (!currently_dragged_element.contains(e.target as Node)) return;

				is_interacting = true;

				pointer_captured_id = e.pointerId;
				currently_dragged_element.setPointerCapture(pointer_captured_id);

				const inverse_scale = calculate_inverse_scale();

				// Some plugin like axis might not allow dragging in one direction
				if (proposals.x != null) initial.x = e.clientX - offset.x / inverse_scale;
				if (proposals.y != null) initial.y = e.clientY - offset.y / inverse_scale;
			},
			event_options,
		);

		listen(
			'pointermove',
			(e: PointerEvent) => {
				if (!is_interacting) return;

				if (!is_dragging) {
					dragstart_prevented = false;
					run_plugins('drag', e);

					if (!dragstart_prevented && !current_drag_hook_cancelled) {
						const start_drag = run_plugins('dragStart', e);
						if (!start_drag) return clear_effects();
						else flush_effects();

						is_dragging = true;
					}

					if (!is_dragging) return;
				}

				e.preventDefault();

				delta.x = e.clientX - initial.x - offset.x;
				delta.y = e.clientY - initial.y - offset.y;

				// Core proposes delta
				proposals.x = delta.x;
				proposals.y = delta.y;

				// Run the plugins
				const run_result = run_plugins('drag', e);

				if (run_result) flush_effects();
				else return clear_effects();

				// Whatever offset we have had till now since the draggable() was mounted, add proposals to it, as long as they're not null
				offset.x += proposals.x ?? 0;
				offset.y += proposals.y ?? 0;
			},
			event_options,
		);

		listen(
			'pointerup',
			(e: PointerEvent) => {
				if (!is_interacting) return;

				if (is_dragging) {
					// Listen for click handler and cancel it
					listen('click', (e) => e.stopPropagation(), {
						once: true,
						signal: controller.signal,
						capture: true,
					});
				}

				if (
					pointer_captured_id &&
					currently_dragged_element.hasPointerCapture(pointer_captured_id)
				) {
					currently_dragged_element.releasePointerCapture(pointer_captured_id);
				}

				// Call the dragEnd hooks
				run_plugins('dragEnd', e);
				flush_effects();

				if (proposals.x) initial.x = offset.x;
				if (proposals.y) initial.y = offset.y;

				proposals.x = 0;
				proposals.y = 0;
				is_interacting = false;
				is_dragging = false;
				dragstart_prevented = false;
				pointer_captured_id = null;
				clear_effects();
			},
			event_options,
		);

		return {
			destroy() {
				for (const plugin of ordered_plugins) {
					plugin.cleanup?.();
				}

				private_states.clear();
				controller.abort();
			},
		};
	};
}

const set_style = (el: HTMLElement, style: string, value: string) =>
	el.style.setProperty(style, value);
