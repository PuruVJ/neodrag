import { Neodrag } from './engine/neodrag.ts';
import { DragNeodrag } from './engine/drag-neodrag.ts';
import type { DragHandle, DropHandle, ResizeHandle } from './handles.ts';
import { numberStub } from './length-contract.ts';
import type { LengthAdapter } from './length-runtime.ts';
import type { MarkupAdapter } from './markup-adapter.ts';
import { PluginListResolver, resolvedPluginsUnchanged } from './resolve-plugins.ts';
import type { PluginSlot } from './types.ts';

type EngineHost = Neodrag | DragNeodrag;

export type TargetBindingContext = {
	length: LengthAdapter;
	markup?: MarkupAdapter;
};

export type TargetBindingOptions<P extends { key: symbol }> = {
	engine?: EngineHost;
	length?: LengthAdapter;
	markup?: MarkupAdapter;
	plugins: readonly PluginSlot<P>[];
	register: (
		engine: EngineHost,
		node: HTMLElement | SVGElement,
		resolved: P[],
		ctx: TargetBindingContext,
	) => DragHandle | DropHandle | ResizeHandle;
	sharedEngine?: () => EngineHost;
};

export class TargetBinding<P extends { key: symbol }> {
	readonly #engineOption?: EngineHost;
	#engine: EngineHost | null = null;
	#resolver: PluginListResolver<P>;
	#handle: DragHandle | DropHandle | ResizeHandle | null = null;
	#node: HTMLElement | SVGElement | null = null;
	#lastResolved: P[] | null = null;
	readonly #register: TargetBindingOptions<P>['register'];
	readonly #sharedEngine: () => EngineHost;
	readonly #length: LengthAdapter;
	readonly #markup?: MarkupAdapter;

	constructor(options: TargetBindingOptions<P>) {
		this.#engineOption = options.engine;
		this.#length = options.length ?? numberStub;
		this.#markup = options.markup;
		this.#resolver = new PluginListResolver(options.plugins);
		this.#register = options.register;
		this.#sharedEngine = options.sharedEngine ?? (() => Neodrag.shared);
	}

	get hasReactiveSlots() {
		return this.#resolver.hasReactive();
	}

	#resolveEngine(): EngineHost {
		return (this.#engine ??= this.#engineOption ?? this.#sharedEngine());
	}

	attach(node: HTMLElement | SVGElement) {
		if (this.#node === node && this.#handle) return;

		this.detach();
		this.#node = node;
		const resolved = this.#resolver.hasReactive()
			? this.#resolver.resolveAttach()
			: this.#resolver.resolveFull();
		this.#lastResolved = resolved;
		this.#handle = this.#register(this.#resolveEngine(), node, resolved, {
			length: this.#length,
			markup: this.#markup,
		});
	}

	detach() {
		this.#handle?.destroy();
		this.#handle = null;
		this.#node = null;
		this.#lastResolved = null;
	}

	#pushResolved(next: P[]) {
		if (!this.#handle) return;
		if (this.#lastResolved && resolvedPluginsUnchanged(this.#lastResolved, next)) return;
		this.#handle.update(next);
		this.#lastResolved = next;
	}

	flushReactive() {
		if (!this.#resolver.hasReactive()) return;
		this.#pushResolved(this.#resolver.resolveReactive());
	}

	update(slots?: readonly PluginSlot<P>[]) {
		if (slots) this.#resolver.setSlots(slots);
		if (!this.#handle) return;
		this.#pushResolved(
			this.#resolver.hasReactive()
				? this.#resolver.resolveReactive()
				: this.#resolver.resolveFull(),
		);
	}

	destroy() {
		this.detach();
	}
}
