import { createDraggable } from '@neodrag/core';
import { type Plugin } from '@neodrag/core/plugins';
import { useEffect, useRef } from 'react';

const { draggable, instances } = createDraggable();

export function useDraggable(
	ref: React.RefObject<HTMLElement | SVGElement>,
	plugins: Plugin[] = [],
) {
	const instance = useRef<ReturnType<typeof draggable>>();
	const pluginsRef = useRef(plugins);

	// Use a separate effect for initialization and cleanup
	useEffect(() => {
		if (!ref.current) return;

		instance.current = draggable(ref.current, plugins);
		pluginsRef.current = plugins;

		return () => {
			instance.current?.destroy();
			instance.current = undefined;
		};
	}, []); // Empty deps - only run on mount/unmount

	// Use a separate effect for plugin updates
	useEffect(() => {
		// Skip the initial mount since that's handled above
		if (!instance.current || plugins === pluginsRef.current) return;

		instance.current.update(plugins);
		pluginsRef.current = plugins;
	}, [plugins]); // Only run when plugins change
}

export * from '@neodrag/core/plugins';
export { instances };
