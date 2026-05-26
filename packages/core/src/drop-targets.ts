import type { InteractionInput } from './interaction-input.ts';
import { is_svg_element } from './utils.ts';
import type { DropInstance } from './instance.ts';
import type { ActiveSession } from './instance.ts';
import type { DragInstance } from './instance.ts';
import type { DropTargetInfo } from './types.ts';

export type DropTargetHost = {
	getDropCount(): number;
	getSoleDrop(): DropInstance | null;
	getActive(): ActiveSession | null;
	getActiveSource(): DragInstance | null;
	getDropTargets(): Map<HTMLElement | SVGElement, DropInstance>;
	runDropHook(
		inst: DropInstance,
		hook: 'enter' | 'over' | 'leave' | 'drop',
		input: InteractionInput,
	): boolean | void;
};

export class DropTargetTracker {
	#currentOver: DropInstance[] = [];
	#nextOverScratch: DropInstance[] = [];
	#lastDropInput: InteractionInput | null = null;
	#lastDropPointerX = NaN;
	#lastDropPointerY = NaN;
	#dropRafId = 0;

	#host: DropTargetHost;

	constructor(host: DropTargetHost) {
		this.#host = host;
	}

	getOverDrops(): readonly DropInstance[] {
		return this.#currentOver;
	}

	reset() {
		if (this.#dropRafId) {
			cancelAnimationFrame(this.#dropRafId);
			this.#dropRafId = 0;
		}
		this.#lastDropInput = null;
		this.#lastDropPointerX = NaN;
		this.#lastDropPointerY = NaN;
		this.#currentOver.length = 0;
	}

	queueUpdate(input: InteractionInput) {
		this.#lastDropInput = input;
		if (this.#dropRafId) return;
		this.#dropRafId = requestAnimationFrame(() => {
			this.#dropRafId = 0;
			const current = this.#lastDropInput;
			if (!current || !this.#host.getActiveSource()?.isDragging || this.#host.getDropCount() <= 0)
				return;
			this.runUpdate(current);
		});
	}

	flush(input: InteractionInput) {
		if (this.#dropRafId) {
			cancelAnimationFrame(this.#dropRafId);
			this.#dropRafId = 0;
		}
		this.#lastDropInput = input;
		if (this.#host.getDropCount() > 0) this.runUpdate(input, true);
	}

	runUpdate(input: InteractionInput, force = false) {
		const sole = this.#host.getSoleDrop();
		if (sole) {
			this.#updateSole(sole, input, force);
			return;
		}
		this.#updateMulti(input, force);
	}

	#syncSessionTargets(drops: readonly DropInstance[]) {
		const overTargets = this.#host.getActive()?.overTargets;
		if (!overTargets) return;
		overTargets.length = 0;
		for (let i = 0; i < drops.length; i++) {
			overTargets.push(this.#lazyTarget(drops[i]!.rootNode));
		}
	}

	#updateSole(drop: DropInstance, input: InteractionInput, force: boolean) {
		const x = input.clientX;
		const y = input.clientY;
		if (!force && x === this.#lastDropPointerX && y === this.#lastDropPointerY) return;
		this.#lastDropPointerX = x;
		this.#lastDropPointerY = y;

		const over = this.#containsPointer(drop, x, y);
		this.#currentOver.length = 0;

		if (over) {
			if (!drop.isOver) {
				const accepted = this.#host.runDropHook(drop, 'enter', input);
				drop.isOver = accepted !== false;
			}
			if (drop.isOver) {
				this.#currentOver.push(drop);
				this.#host.runDropHook(drop, 'over', input);
			}
		} else if (drop.isOver) {
			this.#host.runDropHook(drop, 'leave', input);
			drop.isOver = false;
		}
		this.#syncSessionTargets(this.#currentOver);
		drop.effects.flush();
	}

	#updateMulti(input: InteractionInput, force: boolean) {
		const x = input.clientX;
		const y = input.clientY;
		if (!force && x === this.#lastDropPointerX && y === this.#lastDropPointerY) return;
		this.#lastDropPointerX = x;
		this.#lastDropPointerY = y;

		const targets = this.#hitTestTargets(x, y);
		const next = this.#nextOverScratch;
		next.length = 0;

		for (let i = 0; i < targets.length; i++) {
			const drop = this.#host.getDropTargets().get(targets[i]!.node);
			if (!drop) continue;
			next.push(drop);
		}

		const nextSet = new Set(next);
		for (let i = 0; i < this.#currentOver.length; i++) {
			const drop = this.#currentOver[i]!;
			if (!nextSet.has(drop) && drop.isOver) {
				this.#host.runDropHook(drop, 'leave', input);
				drop.isOver = false;
			}
		}

		const stack = this.#currentOver;
		stack.length = 0;

		for (let i = 0; i < next.length; i++) {
			const drop = next[i]!;
			if (!drop.isOver) {
				const accepted = this.#host.runDropHook(drop, 'enter', input);
				drop.isOver = accepted !== false;
			} else {
				this.#host.runDropHook(drop, 'over', input);
			}
			if (drop.isOver) stack.push(drop);
			if (this.#host.getActive()?.propagationStopped) break;
		}

		this.#syncSessionTargets(stack);

		for (let i = 0; i < stack.length; i++) {
			stack[i]!.effects.flush();
			if (this.#host.getActive()?.propagationStopped) break;
		}
	}

	#lazyTarget(node: HTMLElement | SVGElement): DropTargetInfo {
		return {
			node,
			get rect() {
				return node.getBoundingClientRect();
			},
		};
	}

	#containsPointer(drop: DropInstance, x: number, y: number) {
		const expand = drop.hitExpandPx;
		if (expand) {
			const r = drop.rootNode.getBoundingClientRect();
			if (
				x >= r.left - expand.left &&
				x <= r.right + expand.right &&
				y >= r.top - expand.top &&
				y <= r.bottom + expand.bottom
			) {
				return true;
			}
		}
		const el = document.elementFromPoint(x, y);
		if (!el) return false;
		let current: Element | null = el;
		const root = drop.rootNode;
		while (current && current !== document.documentElement) {
			if (current === root) return true;
			current = current.parentElement;
		}
		return false;
	}

	#hitTestTargets(x: number, y: number): DropTargetInfo[] {
		const stack: DropTargetInfo[] = [];
		const el = document.elementFromPoint(x, y);
		if (!el) return stack;

		let current: Element | null = el;
		while (current && current !== document.documentElement) {
			if (
				(current instanceof HTMLElement || is_svg_element(current)) &&
				this.#host.getDropTargets().has(current as HTMLElement | SVGElement)
			) {
				stack.push(this.#lazyTarget(current as HTMLElement | SVGElement));
			}
			current = current.parentElement;
		}
		return stack;
	}
}
