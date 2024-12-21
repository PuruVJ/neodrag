import { events, position as position_plugin, useDraggable } from '@neodrag/react';
import { startTransition, useCallback, useMemo, useRef, useState } from 'react';

function App() {
	const [position, setPosition] = useState({ x: 0, y: 0 });

	const draggableRef = useRef<HTMLDivElement>(null);

	// Memoize the event handler to prevent unnecessary plugin recreation
	const onDrag = useCallback(({ offset }: any) => {
		startTransition(() => {
			setPosition({ ...offset });
		});
	}, []);

	// Memoize plugins array to prevent unnecessary updates
	const plugins = useMemo(
		() => [
			events({
				onDrag,
			}),
			position_plugin({
				current: position,
			}),
		],
		[onDrag, position],
	);

	useDraggable(draggableRef, plugins);

	return (
		<>
			<div ref={draggableRef}>I can be moved with the slider too</div>
			X:
			<input
				type="range"
				min="0"
				max="300"
				value={position.x}
				// @ts-ignore
				onInput={(e) => setPosition({ x: +e.target.value, y: position.y })}
			/>
			Y:
			<input
				type="range"
				min="0"
				max="300"
				value={position.y}
				// @ts-ignore
				onInput={(e) => setPosition({ x: position.x, y: +e.target.value })}
			/>
		</>
	);
}

export default App;
