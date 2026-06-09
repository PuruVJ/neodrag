import { isKeyboardInput } from '../interaction-input.ts';
import type { DragEventData, DragPlugin } from '../drag/drag.ts';

export type AriaDragAnnounce =
	| boolean
	| {
			grab?: boolean;
			move?: boolean;
			drop?: boolean;
	  };

export type AriaDragOptions = {
	role?: string;
	label?: string;
	liveRegion?: () => HTMLElement | null;
	announce?: AriaDragAnnounce;
};

function resolveAnnounce(
	announce: AriaDragAnnounce | undefined,
	key: keyof NonNullable<Exclude<AriaDragAnnounce, boolean>>,
): boolean {
	if (announce === undefined) return true;
	if (typeof announce === 'boolean') return announce;
	return announce[key] ?? true;
}

/**
 * Announce the drag position to an ARIA live region — a tier-2 `use: []` plugin. On start it
 * resolves (or creates) the live region and marks the node grabbed; each move writes the current
 * offset; end clears the region and unmarks the node. Keyboard interactions are the primary
 * audience (pointer drags are visible), so announcements are gated to keyboard input.
 */
export function ariaDrag(options: AriaDragOptions | null = {}): DragPlugin {
	const role = options?.role ?? 'button';
	const label = options?.label ?? 'Draggable';
	const announce = options?.announce;

	let liveRegion: HTMLElement | null = null;

	const speak = (message: string): void => {
		if (liveRegion) liveRegion.textContent = message;
	};

	const resolveLiveRegion = (): HTMLElement | null => {
		const provided = options?.liveRegion?.();
		if (provided) return provided;
		const region = document.createElement('div');
		region.setAttribute('aria-live', 'assertive');
		region.setAttribute('role', 'status');
		region.style.cssText =
			'position:absolute;width:1px;height:1px;margin:-1px;padding:0;overflow:hidden;clip:rect(0 0 0 0);clip-path:inset(50%);white-space:nowrap;border:0';
		document.body.appendChild(region);
		return region;
	};

	return {
		name: 'aria-drag',

		onStart({ node, input }: DragEventData): void {
			const el = node as HTMLElement;
			el.setAttribute('tabindex', '0');
			el.setAttribute('role', role);
			el.setAttribute('aria-label', label);
			el.setAttribute('aria-grabbed', 'true');
			liveRegion = resolveLiveRegion();
			if (isKeyboardInput(input) && resolveAnnounce(announce, 'grab')) speak('Grabbed');
		},

		onMove({ offset, input }: DragEventData): void {
			if (!isKeyboardInput(input) || !resolveAnnounce(announce, 'move')) return;
			speak(`Position ${Math.round(offset.x)}, ${Math.round(offset.y)}`);
		},

		onEnd({ node, input }: DragEventData): void {
			const el = node as HTMLElement;
			el.setAttribute('aria-grabbed', 'false');
			if (isKeyboardInput(input) && resolveAnnounce(announce, 'drop')) speak('Released');
			else speak('');
		},
	};
}
