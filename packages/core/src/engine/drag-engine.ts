import type { DragInstance } from '../instance.ts';
import type { DragPlugin, EndReason, ErrorInfo } from '../types.ts';
import { DragInteraction } from './drag-interaction.ts';
import { ExtensionRegistry, engineExtensions } from './extension-registry.ts';
import { InteractionCoordinator, type InteractionCoordinatorHost } from './interaction-coordinator.ts';
import type { DropInteractionRunner } from './drop-runner.ts';
import { noopDropInteraction } from './noop-drop-interaction.ts';
import { PluginRunner } from './plugin-runner.ts';

export type DragEngineBindings = {
	engine: object;
	onError?: (error: ErrorInfo) => void;
	dev: () => boolean;
	defaultDragPlugins: () => DragPlugin[];
	endActiveInteraction: (reason: EndReason) => void;
	getActiveSource: () => DragInstance | null;
};

export class DragEngine {
	readonly plugins: PluginRunner;
	readonly extensions: ExtensionRegistry;
	readonly drag: DragInteraction;
	readonly drop: DropInteractionRunner = noopDropInteraction;

	constructor(bindings: DragEngineBindings) {
		this.plugins = new PluginRunner({
			onError: bindings.onError,
			dev: bindings.dev,
		});
		this.extensions = engineExtensions;

		this.drag = new DragInteraction({
			engine: bindings.engine,
			plugins: this.plugins,
			extensions: this.extensions,
			dev: bindings.dev,
			defaultPlugins: bindings.defaultDragPlugins,
			endActiveInteraction: bindings.endActiveInteraction,
			getActiveSource: bindings.getActiveSource,
		});
	}

	createCoordinator(host: InteractionCoordinatorHost): InteractionCoordinator {
		return new InteractionCoordinator(host);
	}
}
