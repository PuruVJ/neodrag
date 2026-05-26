import { Neodrag } from './engine.ts';
import type { DragHandle, DropHandle, ResizeHandle } from './handles.ts';
import { numberStub } from './length-contract.ts';
import type { LengthAdapter } from './length-runtime.ts';
import { PluginListResolver, resolvedPluginsUnchanged } from './resolve-plugins.ts';
import type { PluginSlot } from './types.ts';

export type PluginBindingOptions<P extends { key: symbol }> = {
	engine?: Neodrag;
	length?: LengthAdapter;
	plugins: readonly PluginSlot<P>[];
	register: (
		engine: Neodrag,
		node: HTMLElement | SVGElement,
		resolved: P[],
		binding: { length: LengthAdapter },
	) => DragHandle | DropHandle | ResizeHandle;
	attachIdempotency?: 'node-and-handle' | 'handle-node';
};

export class PluginBinding<P extends { key: symbol }> {
	readonly #engineOption?: Neodrag;
	#engine: Neodrag | null = null;
	#resolver: PluginListResolver<P>;
	#handle: DragHandle | DropHandle | ResizeHandle | null = null;
	#node: HTMLElement | SVGElement | null = null;
	#lastResolved: P[] | null = null;
	readonly #register: PluginBindingOptions<P>['register'];
	readonly #attachIdempotency: NonNullable<PluginBindingOptions<P>['attachIdempotency']>;
	readonly #length: LengthAdapter;

	readonly attachment: (node: HTMLElement | SVGElement) => void | (() => void);

	constructor(options: PluginBindingOptions<P>) {
		this.#engineOption = options.engine;
		this.#length = options.length ?? numberStub;
		this.#resolver = new PluginListResolver(options.plugins);
		this.#register = options.register;
		this.#attachIdempotency = options.attachIdempotency ?? 'handle-node';

		this.attachment = (node) => {
			this.attach(node);
			return () => this.detach();
		};
	}

	get hasReactiveSlots() {
		return this.#resolver.hasReactive();
	}

	#resolveEngine(): Neodrag {
		return (this.#engine ??= this.#engineOption ?? Neodrag.shared);
	}

	attach(node: HTMLElement | SVGElement) {
		if (this.#attachIdempotency === 'node-and-handle') {
			if (this.#node === node && this.#handle) return;
		} else if (this.#handle?.node === node) {
			return;
		}

		this.detach();
		this.#node = node;
		const resolved = this.#resolver.hasReactive()
			? this.#resolver.resolveAttach()
			: this.#resolver.resolveFull();
		this.#lastResolved = resolved;
		this.#handle = this.#register(this.#resolveEngine(), node, resolved, {
			length: this.#length,
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
