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
	measure?: (span: string, fn: () => void) => void;
};

export class DropTargetTracker {
	#currentOver: DropInstance[] = [];
	#nextOverScratch: DropInstance[] = [];
	#nextOverSet = new Set<DropInstance>();
	#hitNodeScratch: (HTMLElement | SVGElement)[] = [];
	#hitNodeSeen = new Set<HTMLElement | SVGElement>();
	#targetByNode = new WeakMap<HTMLElement | SVGElement, DropTargetInfo>();
	#lastDropInput: InteractionInput | null = null;
	#lastDropPointerX = NaN;
	#lastDropPointerY = NaN;
	#dropRafId = 0;
	#efipX = NaN;
	#efipY = NaN;
	#efipEl: Element | null = null;
	#rectByNode = new Map<HTMLElement | SVGElement, DOMRectReadOnly>();

	#host: DropTargetHost;

	constructor(host: DropTargetHost) {
		this.#host = host;
	}

	getOverDrops(): readonly DropInstance[] {
		return this.#currentOver;
	}

	dropsAtPointer(x: number, y: number): DropInstance[] {
		const found: DropInstance[] = [];
		for (const drop of this.#host.getDropTargets().values()) {
			if (this.#pointInDropRect(drop, x, y)) found.push(drop);
		}
		return found;
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
		const run = () => {
			this.#efipX = NaN;
			this.#efipY = NaN;
			this.#efipEl = null;
			this.#rectByNode.clear();
			const sole = this.#host.getSoleDrop();
			if (sole) {
				this.#updateSole(sole, input, force);
				return;
			}
			this.#updateMulti(input, force);
		};
		if (this.#host.measure) this.#host.measure('drop.update', run);
		else run();
	}

	#syncSessionTargets(drops: readonly DropInstance[]) {
		const overTargets = this.#host.getActive()?.overTargets;
		if (!overTargets) return;
		overTargets.length = 0;
		for (let i = 0; i < drops.length; i++) {
			overTargets.push(this.#targetInfo(drops[i]!.rootNode));
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
				if (drop.isOver) this.#host.runDropHook(drop, 'over', input);
			} else {
				this.#host.runDropHook(drop, 'over', input);
			}
			if (drop.isOver) this.#currentOver.push(drop);
		} else if (drop.isOver) {
			this.#host.runDropHook(drop, 'leave', input);
			drop.isOver = false;
		}
		this.#syncSessionTargets(this.#currentOver);
		if (drop.effects.hasPending()) drop.effects.flush();
	}

	#updateMulti(input: InteractionInput, force: boolean) {
		const x = input.clientX;
		const y = input.clientY;
		if (!force && x === this.#lastDropPointerX && y === this.#lastDropPointerY) return;
		this.#lastDropPointerX = x;
		this.#lastDropPointerY = y;

		const nodes = this.#hitTestNodes(x, y);
		const next = this.#nextOverScratch;
		next.length = 0;
		const dropTargets = this.#host.getDropTargets();

		for (let i = 0; i < nodes.length; i++) {
			const drop = dropTargets.get(nodes[i]!);
			if (drop) next.push(drop);
		}

		const nextSet = this.#nextOverSet;
		nextSet.clear();
		this.#rankDropInstances(next, x, y);

		for (let i = 0; i < next.length; i++) nextSet.add(next[i]!);
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
				if (drop.isOver) this.#host.runDropHook(drop, 'over', input);
			} else {
				this.#host.runDropHook(drop, 'over', input);
			}
			if (drop.isOver) stack.push(drop);
			if (this.#host.getActive()?.propagationStopped) break;
		}

		this.#syncSessionTargets(stack);

		for (let i = 0; i < stack.length; i++) {
			const drop = stack[i]!;
			if (drop.effects.hasPending()) drop.effects.flush();
			if (this.#host.getActive()?.propagationStopped) break;
		}
	}

	#targetInfo(node: HTMLElement | SVGElement): DropTargetInfo {
		let info = this.#targetByNode.get(node);
		if (!info) {
			info = {
				node,
				get rect() {
					return node.getBoundingClientRect();
				},
			};
			this.#targetByNode.set(node, info);
		}
		return info;
	}

	#rankDropInstances(drops: DropInstance[], x: number, y: number) {
		drops.sort((a, b) => {
			if (a.collisionPriority !== b.collisionPriority) return b.collisionPriority - a.collisionPriority;
			const useCenter =
				a.collisionStrategy === 'closestCenter' || b.collisionStrategy === 'closestCenter';
			if (!useCenter) return 0;
			return this.#centerDistanceSq(a, x, y) - this.#centerDistanceSq(b, x, y);
		});
	}

	#nodeRect(node: HTMLElement | SVGElement): DOMRectReadOnly {
		let rect = this.#rectByNode.get(node);
		if (!rect) {
			rect = node.getBoundingClientRect();
			this.#rectByNode.set(node, rect);
		}
		return rect;
	}

	#centerDistanceSq(drop: DropInstance, x: number, y: number) {
		const r = this.#nodeRect(drop.rootNode);
		const cx = r.left + r.width / 2;
		const cy = r.top + r.height / 2;
		const dx = x - cx;
		const dy = y - cy;
		return dx * dx + dy * dy;
	}

	#pointInDropRect(drop: DropInstance, x: number, y: number) {
		const expand = drop.hitExpandPx;
		const r = this.#nodeRect(drop.rootNode);
		const pad = expand ?? { top: 0, right: 0, bottom: 0, left: 0 };
		return (
			x >= r.left - pad.left &&
			x <= r.right + pad.right &&
			y >= r.top - pad.top &&
			y <= r.bottom + pad.bottom
		);
	}

	#containsPointer(drop: DropInstance, x: number, y: number) {
		if (this.#pointInDropRect(drop, x, y)) return true;
		return this.#elementContainsRoot(x, y, drop.rootNode);
	}

	#elementAt(x: number, y: number) {
		if (x === this.#efipX && y === this.#efipY) return this.#efipEl;
		this.#efipX = x;
		this.#efipY = y;
		this.#efipEl = document.elementFromPoint(x, y);
		return this.#efipEl;
	}

	#elementContainsRoot(x: number, y: number, root: HTMLElement | SVGElement) {
		const el = this.#elementAt(x, y);
		if (!el) return false;
		let current: Element | null = el;
		while (current && current !== document.documentElement) {
			if (current === root) return true;
			current = current.parentElement;
		}
		return false;
	}

	#isDragSourceElement(el: Element) {
		const source = this.#host.getActiveSource()?.rootNode;
		if (!source) return false;
		return el === source || source.contains(el);
	}

	#hitTestNodes(x: number, y: number): (HTMLElement | SVGElement)[] {
		const stack = this.#hitNodeScratch;
		stack.length = 0;
		const seen = this.#hitNodeSeen;
		seen.clear();
		const dropTargets = this.#host.getDropTargets();

		const collectFrom = (root: Element | null) => {
			let current: Element | null = root;
			while (current && current !== document.documentElement) {
				if (
					(current instanceof HTMLElement || is_svg_element(current)) &&
					dropTargets.has(current as HTMLElement | SVGElement)
				) {
					const node = current as HTMLElement | SVGElement;
					if (!seen.has(node)) {
						seen.add(node);
						stack.push(node);
					}
				}
				current = current.parentElement;
			}
		};

		if (typeof document.elementsFromPoint === 'function') {
			for (const el of document.elementsFromPoint(x, y)) {
				if (this.#isDragSourceElement(el)) {
					collectFrom(el.parentElement);
					continue;
				}
				collectFrom(el);
			}
		} else {
			const top = this.#elementAt(x, y);
			if (top && !this.#isDragSourceElement(top)) collectFrom(top);
		}

		for (const drop of dropTargets.values()) {
			if (this.#pointInDropRect(drop, x, y) && !seen.has(drop.rootNode)) {
				seen.add(drop.rootNode);
				stack.push(drop.rootNode);
			}
		}

		return stack;
	}
}
