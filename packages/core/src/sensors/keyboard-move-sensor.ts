import { keyboardToInput } from '../interaction-input.ts';
import { startKeyboardRepeat } from '../a11y/keyboard-repeat.ts';
import {
	findKeyboardDragRoot,
	getKeyboardDragConfig,
	type ResolvedKeyboardDragOptions,
} from '../a11y/keyboard-drag-registry.ts';
import { is_svg_element, is_svg_svg_element, listen } from '../utils.ts';
import { SensorBase } from './sensor-base.ts';
import type { SensorHost } from './types.ts';

export const KEYBOARD_MOVE_SENSOR_KEY = Symbol('neodrag.sensor.keyboardMove');

const ARROW_KEYS = new Set(['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight']);

type GrabSession = {
	node: HTMLElement | SVGElement;
	clientX: number;
	clientY: number;
	config: ResolvedKeyboardDragOptions;
	repeat: ReturnType<typeof startKeyboardRepeat> | null;
	lastKey: string;
};

function axisDelta(
	key: string,
	step: number,
	axis: ResolvedKeyboardDragOptions['axis'],
): { x: number; y: number } | null {
	let x = 0;
	let y = 0;
	if (key === 'ArrowLeft') x = -step;
	else if (key === 'ArrowRight') x = step;
	else if (key === 'ArrowUp') y = -step;
	else if (key === 'ArrowDown') y = step;
	else return null;
	if (axis === 'x') y = 0;
	if (axis === 'y') x = 0;
	return { x, y };
}

function centerOf(node: HTMLElement | SVGElement) {
	const rect = node.getBoundingClientRect();
	return { x: rect.left + rect.width / 2, y: rect.top + rect.height / 2 };
}

function isGrabKey(key: string, grabKey: string): boolean {
	return key === grabKey || (grabKey === 'Space' && key === ' ');
}

export class KeyboardMoveSensor extends SensorBase {
	readonly key = KEYBOARD_MOVE_SENSOR_KEY;

	protected attach(host: SensorHost): () => void {
		const target = host.getDelegate();
		let grab: GrabSession | null = null;

		const stopRepeat = () => {
			grab?.repeat?.stop();
			if (grab) grab.repeat = null;
		};

		const emitMove = (session: GrabSession, key: string, fast: boolean) => {
			const step = fast ? session.config.fastStep : session.config.step;
			const delta = axisDelta(key, step, session.config.axis);
			if (!delta) return;
			session.clientX += delta.x;
			session.clientY += delta.y;
			host.onInteractionMove(
				keyboardToInput({
					phase: 'move',
					clientX: session.clientX,
					clientY: session.clientY,
					key,
					delta,
					target: session.node,
					repeat: true,
				}),
			);
		};

		const releaseGrab = () => {
			if (!grab) return;
			stopRepeat();
			host.onInteractionEnd(
				keyboardToInput({
					phase: 'end',
					clientX: grab.clientX,
					clientY: grab.clientY,
					key: grab.config.grabKey,
					target: grab.node,
				}),
			);
			grab = null;
		};

		const onKeyDown = (e: KeyboardEvent) => {
			if (e.defaultPrevented) return;

			if (e.key === 'Escape' && grab) {
				e.preventDefault();
				stopRepeat();
				grab = null;
				host.cancelActive('cancel');
				return;
			}

			const root = findKeyboardDragRoot(e.target);
			if (!root) {
				if (grab && isGrabKey(e.key, grab.config.grabKey)) {
					e.preventDefault();
					releaseGrab();
				}
				return;
			}

			const config = getKeyboardDragConfig(root)!;

			if (isGrabKey(e.key, config.grabKey)) {
				e.preventDefault();
				if (grab?.node === root) {
					releaseGrab();
					return;
				}
				if (grab) releaseGrab();

				const center = centerOf(root);
				grab = {
					node: root,
					clientX: center.x,
					clientY: center.y,
					config,
					repeat: null,
					lastKey: config.grabKey,
				};
				host.onInteractionStart(
					keyboardToInput({
						phase: 'start',
						clientX: grab.clientX,
						clientY: grab.clientY,
						key: e.key,
						target: root,
						native: e,
					}),
				);
				return;
			}

			if (!grab || grab.node !== root) return;
			if (!ARROW_KEYS.has(e.key)) return;

			e.preventDefault();
			grab.lastKey = e.key;
			stopRepeat();

			if (!e.repeat) {
				emitMove(grab, e.key, false);
				return;
			}

			grab.repeat = startKeyboardRepeat({
				slowInterval: config.slowInterval,
				speedupDelay: config.speedupDelay,
				fastInterval: config.fastInterval,
				onTick: (fast) => {
					if (!grab) return;
					emitMove(grab, grab.lastKey, fast);
				},
			});
		};

		const onBlur = () => {
			if (grab) releaseGrab();
		};

		listen(target, 'keydown', onKeyDown, { passive: false });
		listen(target, 'blur', onBlur, { passive: true, capture: true });

		return () => {
			stopRepeat();
			grab = null;
			target.removeEventListener('keydown', onKeyDown);
			target.removeEventListener('blur', onBlur, { capture: true });
		};
	}
}

export function isDraggableKeyboardTarget(el: Element): el is HTMLElement | SVGElement {
	return (
		(el instanceof HTMLElement || (is_svg_element(el) && !is_svg_svg_element(el))) &&
		getKeyboardDragConfig(el as HTMLElement) != null
	);
}
