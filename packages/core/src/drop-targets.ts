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
		e: PointerEvent,
	): boolean | void;
};

export class DropTargetTracker {
	#currentOver: DropInstance[] = [];
	#nextOverScratch: DropInstance[] = [];
	#lastDropEvent: PointerEvent | null = null;
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
		this.#lastDropEvent = null;
		this.#lastDropPointerX = NaN;
		this.#lastDropPointerY = NaN;
		this.#currentOver.length = 0;
	}

	queueUpdate(e: PointerEvent) {
		this.#lastDropEvent = e;
		if (this.#dropRafId) return;
		this.#dropRafId = requestAnimationFrame(() => {
			this.#dropRafId = 0;
			const ev = this.#lastDropEvent;
			if (!ev || !this.#host.getActiveSource()?.isDragging || this.#host.getDropCount() <= 0) return;
			this.runUpdate(ev);
		});
	}

	flush(e: PointerEvent) {
		if (this.#dropRafId) {
			cancelAnimationFrame(this.#dropRafId);
			this.#dropRafId = 0;
		}
		this.#lastDropEvent = e;
		if (this.#host.getDropCount() > 0) this.runUpdate(e, true);
	}

	runUpdate(e: PointerEvent, force = false) {
		const sole = this.#host.getSoleDrop();
		if (sole) {
			this.#updateSole(sole, e, force);
			return;
		}
		this.#updateMulti(e, force);
	}

	#syncSessionTargets(drops: readonly DropInstance[]) {
		const overTargets = this.#host.getActive()?.overTargets;
		if (!overTargets) return;
		overTargets.length = 0;
		for (let i = 0; i < drops.length; i++) {
			overTargets.push(this.#lazyTarget(drops[i]!.rootNode));
		}
	}

	#updateSole(drop: DropInstance, e: PointerEvent, force: boolean) {
		const x = e.clientX;
		const y = e.clientY;
		if (!force && x === this.#lastDropPointerX && y === this.#lastDropPointerY) return;
		this.#lastDropPointerX = x;
		this.#lastDropPointerY = y;

		const over = this.#containsPointer(drop, x, y);
		this.#currentOver.length = 0;

		if (over) {
			if (!drop.isOver) {
				const accepted = this.#host.runDropHook(drop, 'enter', e);
				drop.isOver = accepted !== false;
			}
			if (drop.isOver) {
				this.#currentOver.push(drop);
				this.#host.runDropHook(drop, 'over', e);
			}
		} else if (drop.isOver) {
			this.#host.runDropHook(drop, 'leave', e);
			drop.isOver = false;
		}
		this.#syncSessionTargets(this.#currentOver);
		drop.effects.flush();
	}

	#updateMulti(e: PointerEvent, force: boolean) {
		const x = e.clientX;
		const y = e.clientY;
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
				this.#host.runDropHook(drop, 'leave', e);
				drop.isOver = false;
			}
		}

		const stack = this.#currentOver;
		stack.length = 0;

		for (let i = 0; i < next.length; i++) {
			const drop = next[i]!;
			if (!drop.isOver) {
				const accepted = this.#host.runDropHook(drop, 'enter', e);
				drop.isOver = accepted !== false;
			} else {
				this.#host.runDropHook(drop, 'over', e);
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
