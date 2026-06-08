import { listen, is_svg_element, is_svg_svg_element } from '../utils.ts';
import {
	ActiveSession,
	type DragInstance,
	type DropInstance,
	type DropCtxHost,
	SessionPrivate,
} from '../instance.ts';
import { applyDragMarkupDragging } from '../drag-markup.ts';
import type { ExtensionRegistry } from './extension-registry.ts';
import { DropTargetTracker } from '../drop-targets.ts';
import { measureCost } from '../engine-profile.ts';
import type { InteractionInput, PointerInteractionInput } from '../interaction-input.ts';
import {
	interactionPointerId,
	isPointerInput,
	KEYBOARD_POINTER_ID,
} from '../interaction-input.ts';
import { createDragSession, resolveEndReason } from '../session.ts';
import { syncDragSessionPointer } from '../sync-session-pointer.ts';
import { transitionSession } from '../state-machine.ts';
import { passesDragThreshold, resetThresholdSample } from '../threshold.ts';
import type { ResizeEndReason } from '../resize/types.ts';
import type { DragSession, EndReason } from '../types.ts';
import type { DragInteraction } from './drag-interaction.ts';
import type { DropInteractionRunner } from './drop-runner.ts';

export type { DropInteractionRunner } from './drop-runner.ts';

export type InteractionCoordinatorHost = {
	engine: object;
	extensions: ExtensionRegistry;
	drag: DragInteraction;
	drop: DropInteractionRunner;

	getActive(): ActiveSession | null;
	setActive(session: ActiveSession | null): void;
	getActiveSource(): DragInstance | null;
	setActiveSource(source: DragInstance | null): void;
	getActivePointerId(): number | null;
	setActivePointerId(id: number | null): void;
	getActiveSessionView(): DragSession | null;
	setActiveSessionView(view: DragSession | null): void;

	getDropHost(): DropCtxHost;
	getDropTracker(): DropTargetTracker;
	getDropCount(): number;

	hasDragSource(node: HTMLElement | SVGElement): boolean;
	getDragSource(node: HTMLElement | SVGElement): DragInstance | undefined;

	ensureIdleSession(): DragSession;
	disarmPointer(): void;

	isDragInteracting(): boolean;
	isResizeInteracting(): boolean;
	tryBeginResize(input: PointerInteractionInput): boolean;
	onResizeMove(input: PointerInteractionInput): void;
	onResizePointerEnd(input: InteractionInput): void;
	finishResize(reason: ResizeEndReason, input: InteractionInput): void;
	getResizeLastInput(): InteractionInput | null;
	hasActiveResizeSession(): boolean;
	clearResizeSession(): void;
};

export class InteractionCoordinator {
	readonly #host: InteractionCoordinatorHost;
	#lastTarget: Element | null = null;
	#lastResult: HTMLElement | SVGElement | null = null;

	constructor(host: InteractionCoordinatorHost) {
		this.#host = host;
	}

	onStart(input: InteractionInput) {
		measureCost(this.#host.engine, 'interaction.start', () => this.#onStartCore(input));
	}

	onMove(input: InteractionInput) {
		measureCost(this.#host.engine, 'interaction.move', () => this.#onMoveCore(input));
	}

	onEnd(input: InteractionInput) {
		measureCost(this.#host.engine, 'interaction.end', () => this.#onEndCore(input));
	}

	cancelSession(reason: EndReason) {
		if (this.#host.isResizeInteracting()) {
			const input = this.#host.getResizeLastInput();
			if (input) this.#host.finishResize('cancel', input);
			return;
		}
		const active = this.#host.getActive();
		const source = this.#host.getActiveSource();
		if (!active || !source) return;
		const input = source.lastInput;
		if (input) this.#finishInteraction(reason, input);
	}

	endActiveInteraction(reason: EndReason) {
		if (this.#host.isResizeInteracting()) {
			const input = this.#host.getResizeLastInput();
			if (input && this.#host.hasActiveResizeSession()) {
				this.#host.finishResize(reason === 'cancel' ? 'cancel' : 'commit', input);
				return;
			}
			this.#host.clearResizeSession();
			return;
		}
		const inst = this.#host.getActiveSource();
		if (!inst?.isInteracting) return;
		const input = inst.lastInput;
		if (input && this.#host.getActive()) {
			this.#finishInteraction(reason, input);
			return;
		}
		if (inst) this.#clearSessionState(inst);
	}

	#onStartCore(input: InteractionInput) {
		if (isPointerInput(input) && input.pointer.button === 2) return;
		if (this.#host.isDragInteracting() || this.#host.isResizeInteracting()) return;

		if (isPointerInput(input) && this.#host.tryBeginResize(input)) return;

		const node = this.#resolveDragSource(input);
		if (!node) return;

		const inst = this.#host.getDragSource(node);
		if (!inst || inst.isInteracting) return;

		this.#host.extensions.runPointerDown({ inst, node });

		inst.cachedRootNodeRect = node.getBoundingClientRect();
		inst.inverseScale = this.#host.drag.inverseScale(inst);
		inst.initialX = input.clientX - inst.offsetX / inst.inverseScale;
		inst.initialY = input.clientY - inst.offsetY / inst.inverseScale;
		inst.syncLiveViews();
		inst.isInteracting = true;
		inst.cancelled = false;
		syncDragSessionPointer(input, inst, null, this.#host.getDropHost());
		this.#host.getDropTracker().reset();
		this.#beginSession(inst, input);
	}

	#onMoveCore(input: InteractionInput) {
		if (
			this.#host.getActivePointerId() !== null &&
			interactionPointerId(input) !== this.#host.getActivePointerId()
		) {
			return;
		}

		if (this.#host.isResizeInteracting()) {
			if (isPointerInput(input)) this.#host.onResizeMove(input);
			return;
		}

		const inst = this.#host.getActiveSource();
		if (!inst?.isInteracting) return;

		const active = this.#host.getActive();

		if (!inst.isDragging) {
			inst.lastInput = input;
			const passes = measureCost(this.#host.engine, 'threshold.check', () =>
				passesDragThreshold(inst.thresholdConfig, inst.thresholdSample, inst.dragCtx, input),
			);
			if (!passes) return;

			measureCost(this.#host.engine, 'session.syncPointer', () =>
				syncDragSessionPointer(input, inst, active, this.#host.getDropHost()),
			);
			inst.syncLiveViews();

			const startOk = this.#host.drag.runStart(inst, inst.dragCtx, input);
			if (!startOk) {
				if (inst.effects.hasPending()) inst.effects.flush();
				if (active) active.state = transitionSession(active.state, { type: 'start-abort' });
				return;
			}
			if (inst.cancelled) return;

			applyDragMarkupDragging(inst.markup, inst.rootNode);
			inst.isDragging = true;
			if (inst.effects.hasPending()) inst.effects.flush();
			if (active) active.state = transitionSession(active.state, { type: 'threshold-passed' });

			if (isPointerInput(input)) {
				inst.pointerCapturedId = input.pointer.pointerId;
				try {
					inst.visualNode.setPointerCapture(input.pointer.pointerId);
				} catch {
					this.#cleanupPointer(input.pointer.pointerId);
					return;
				}
			} else {
				inst.pointerCapturedId = KEYBOARD_POINTER_ID;
			}
		} else {
			measureCost(this.#host.engine, 'session.syncPointer', () =>
				syncDragSessionPointer(input, inst, active, this.#host.getDropHost()),
			);
		}

		if (isPointerInput(input)) input.native.preventDefault();

		this.#applyDragDelta(inst, input);
		inst.syncLiveViews();

		if (active) {
			active.deltaX = inst.deltaX;
			active.deltaY = inst.deltaY;
		}

		if (this.#host.getDropCount() > 0) {
			measureCost(this.#host.engine, 'drop.update', () => this.#host.getDropTracker().queueUpdate(input));
		}

		const dragPatched = this.#host.drag.runDrag(inst, inst.dragCtx, input);
		inst.offsetX += inst.proposedX;
		inst.offsetY += inst.proposedY;
		const moved =
			inst.proposedX !== 0 ||
			inst.proposedY !== 0 ||
			inst.deltaX !== 0 ||
			inst.deltaY !== 0;
		inst.proposedX = 0;
		inst.proposedY = 0;
		if (dragPatched || moved) inst.syncLiveViews();
		if (inst.effects.hasPending()) inst.effects.flush();
		this.#host.drag.syncTransform(inst);
	}

	#onEndCore(input: InteractionInput) {
		if (
			this.#host.getActivePointerId() !== null &&
			interactionPointerId(input) !== this.#host.getActivePointerId()
		) {
			return;
		}

		if (this.#host.isResizeInteracting()) {
			this.#host.onResizePointerEnd(input);
			return;
		}

		const inst = this.#host.getActiveSource();
		if (!inst?.isInteracting) return;

		measureCost(this.#host.engine, 'session.syncPointer', () =>
			syncDragSessionPointer(input, inst, this.#host.getActive(), this.#host.getDropHost()),
		);

		if (inst.isInteracting && this.#host.getDropCount() > 0) {
			measureCost(this.#host.engine, 'drop.flush', () => this.#host.getDropTracker().flush(input));
		}

		const reason = resolveEndReason(this.#host.getActive(), inst.cancelled);
		this.#finishInteraction(reason, input);
	}

	#beginSession(source: DragInstance, input: InteractionInput) {
		resetThresholdSample(source.thresholdSample);
		const rect = source.rootNode.getBoundingClientRect();
		const active: ActiveSession = {
			state: transitionSession('idle', { type: 'pointerdown' }),
			sourceNode: source.rootNode,
			visualNode: source.visualNode,
			sourceRect: rect,
			visualRect: rect,
			pointerX: input.clientX,
			pointerY: input.clientY,
			deltaX: 0,
			deltaY: 0,
			data: undefined,
			overTargets: [],
			private: new SessionPrivate(),
			propagationStopped: false,
			pointerId: interactionPointerId(input),
			startedAt: Date.now(),
		};
		this.#host.setActive(active);
		this.#host.setActiveSource(source);
		this.#host.setActivePointerId(interactionPointerId(input));

		const sessionView = createDragSession(active, (node) => this.#host.getActiveSource()?.setVisual(node));
		this.#host.setActiveSessionView(sessionView);
		source.bindSession(sessionView, () => {
			const current = this.#host.getActive();
			if (current) current.state = transitionSession(current.state, { type: 'cancel' });
		});
		this.#host.getDropHost().session = sessionView;
	}

	#applyDragDelta(inst: DragInstance, input: InteractionInput) {
		measureCost(this.#host.engine, 'applyDragDelta', () => this.#applyDragDeltaCore(inst, input));
	}

	#applyDragDeltaCore(inst: DragInstance, input: InteractionInput) {
		if (input.kind === 'pointer') {
			const target_offset_x = (input.clientX - inst.initialX) * inst.inverseScale;
			const target_offset_y = (input.clientY - inst.initialY) * inst.inverseScale;
			inst.deltaX = target_offset_x - inst.offsetX;
			inst.deltaY = target_offset_y - inst.offsetY;
			inst.proposedX = inst.deltaX;
			inst.proposedY = inst.deltaY;
			if (inst.isDragging) this.#host.extensions.runPointerDelta({ inst, input });
			return;
		}
		if (input.delta) {
			inst.deltaX = input.delta.x;
			inst.deltaY = input.delta.y;
			inst.proposedX = input.delta.x;
			inst.proposedY = input.delta.y;
		}
	}

	#resolveDropTarget(input: InteractionInput, isDragging: boolean): DropInstance | null {
		const seen = new Set<DropInstance>();
		const candidates: DropInstance[] = [];
		const add = (drop: DropInstance) => {
			if (seen.has(drop)) return;
			seen.add(drop);
			candidates.push(drop);
		};

		for (const drop of this.#host.getDropTracker().getOverDrops()) add(drop);
		if (isDragging) {
			const samples = this.#host.extensions.runDropPointerSamples({
				sessionData: this.#host.getActive()?.data,
				pointerX: input.clientX,
				pointerY: input.clientY,
			}) ?? [{ x: input.clientX, y: input.clientY }];
			for (const pt of samples) {
				for (const drop of this.#host.getDropTracker().dropsAtPointer(pt.x, pt.y)) add(drop);
			}
		}

		const accepted: DropInstance[] = [];
		for (const drop of candidates) {
			if (!drop.isOver) {
				const ok = this.#host.drop.runHook(drop, 'enter', input);
				drop.isOver = ok !== false;
			}
			if (drop.isOver) accepted.push(drop);
		}

		if (accepted.length === 0) return null;

		const filtered = this.#host.extensions.runDropCandidateFilter({
			candidates: accepted,
			sessionData: this.#host.getActive()?.data,
			x: input.clientX,
			y: input.clientY,
			pickBest: (drops, x, y) => this.#pickBestDrop(drops, x, y),
		});
		if (filtered) return filtered;

		return this.#pickBestDrop(accepted, input.clientX, input.clientY);
	}

	#pickBestDrop(drops: DropInstance[], x: number, y: number): DropInstance {
		let best = drops[0]!;
		for (let i = 1; i < drops.length; i++) {
			const drop = drops[i]!;
			if (drop.collisionPriority > best.collisionPriority) {
				best = drop;
				continue;
			}
			if (drop.collisionPriority < best.collisionPriority) continue;
			const useCenter =
				drop.collisionStrategy === 'closestCenter' || best.collisionStrategy === 'closestCenter';
			if (!useCenter) continue;
			const db = this.#dropCenterDistanceSq(drop, x, y);
			const bb = this.#dropCenterDistanceSq(best, x, y);
			if (db < bb) best = drop;
		}
		return best;
	}

	#dropCenterDistanceSq(drop: DropInstance, x: number, y: number) {
		const r = drop.rootNode.getBoundingClientRect();
		const cx = r.left + r.width / 2;
		const cy = r.top + r.height / 2;
		const dx = x - cx;
		const dy = y - cy;
		return dx * dx + dy * dy;
	}

	#finishInteraction(reason: EndReason, input: InteractionInput) {
		const inst = this.#host.getActiveSource();
		if (!inst) return;

		if (inst.isDragging) {
			listen(inst.rootNode as HTMLElement, 'click', (ev) => ev.stopPropagation(), {
				once: true,
				signal: inst.controller.signal,
				capture: true,
			});
		}

		if (
			inst.pointerCapturedId !== null &&
			typeof inst.visualNode.hasPointerCapture === 'function' &&
			inst.visualNode.hasPointerCapture(inst.pointerCapturedId)
		) {
			inst.visualNode.releasePointerCapture(inst.pointerCapturedId);
		}

		const wasDragging = inst.isDragging;

		const dropTarget = this.#resolveDropTarget(input, inst.isDragging);
		if (dropTarget) {
			this.#host.drop.runHook(dropTarget, 'drop', input);
			if (dropTarget.effects.hasPending()) dropTarget.effects.flush();
		}

		this.#host.drag.runEnd(inst, inst.dragCtx, input, reason);
		if (inst.effects.hasPending()) inst.effects.flush();

		const finishFollowUp = this.#host.extensions.runFinish({ inst, wasDragging });
		if (finishFollowUp) void finishFollowUp;

		const overDrops = this.#host.getDropTracker().getOverDrops();
		for (const drop of overDrops) {
			if (drop.isOver) this.#host.drop.runHook(drop, 'leave', input);
			drop.isOver = false;
		}
		const active = this.#host.getActive();
		if (active) active.overTargets.length = 0;

		inst.isInteracting = false;
		inst.isDragging = false;
		inst.cancelled = false;
		inst.pointerCapturedId = null;

		if (active) active.state = transitionSession(active.state, { type: 'pointerup', reason });

		this.#host.setActive(null);
		this.#host.setActiveSource(null);
		this.#host.setActivePointerId(null);
		this.#host.setActiveSessionView(null);
		this.#host.getDropHost().session = this.#host.ensureIdleSession();
		inst.bindSession(this.#host.ensureIdleSession());
		this.#host.disarmPointer();
		this.#host.getDropTracker().reset();
	}

	#cleanupPointer(_pointerId: number) {
		const inst = this.#host.getActiveSource();
		if (!inst) return;
		inst.cancelled = true;
		const input = inst.lastInput;
		if (input) {
			this.#finishInteraction('cancel', input);
			return;
		}
		this.#clearSessionState(inst);
	}

	#clearSessionState(inst: DragInstance) {
		inst.isInteracting = false;
		inst.isDragging = false;
		inst.cancelled = false;
		inst.pointerCapturedId = null;
		resetThresholdSample(inst.thresholdSample);
		this.#host.setActive(null);
		this.#host.setActiveSource(null);
		this.#host.setActivePointerId(null);
		this.#host.setActiveSessionView(null);
		this.#host.getDropHost().session = this.#host.ensureIdleSession();
		inst.bindSession(this.#host.ensureIdleSession());
		this.#host.disarmPointer();
		this.#host.getDropTracker().reset();
	}

	#resolveDragSource(input: InteractionInput): HTMLElement | SVGElement | null {
		if (input.kind === 'pointer') return this.#findDragSource(input.native);
		if (input.kind === 'keyboard' || input.kind === 'programmatic') {
			const target = input.target;
			if (target instanceof HTMLElement && this.#host.hasDragSource(target)) return target;
			if (
				target instanceof SVGElement &&
				!is_svg_svg_element(target) &&
				this.#host.hasDragSource(target)
			) {
				return target;
			}
		}
		return null;
	}

	#findDragSource(e: PointerEvent): HTMLElement | SVGElement | null {
		const target = e.target as Element;
		if (target === this.#lastTarget) return this.#lastResult;

		const path = e.composedPath();
		for (let i = 0; i < Math.min(path.length, 20); i++) {
			const el = path[i];
			if (
				(el instanceof HTMLElement || (is_svg_element(el) && !is_svg_svg_element(el))) &&
				this.#host.hasDragSource(el as HTMLElement | SVGElement)
			) {
				this.#lastTarget = target;
				this.#lastResult = el as HTMLElement | SVGElement;
				return this.#lastResult;
			}
			if (el === document || el === document.body) break;
		}

		this.#lastTarget = target;
		this.#lastResult = null;
		return null;
	}
}
