import { events, position as position_plugin, useDraggable } from '@neodrag/react';
import { useRef, useState } from 'react';

function App() {
	const [position, setPosition] = useState({ x: 0, y: 0 });
	const draggable_ref = useRef<HTMLDivElement>(null);

	useDraggable(draggable_ref, () => [
		position_plugin({ current: position }),
		events({
			onDrag: ({ offset }) => {
				setPosition({ x: offset.x, y: offset.y });
			},
		}),
	]);

	return (
		<>
			<div ref={draggable_ref}>I can be moved with the slider too</div>
			X:
			<input
				type="range"
				min="0"
				max="300"
				value={position.x}
				onInput={(e) =>
					setPosition((prev) => ({ ...prev, x: +(e.target as HTMLInputElement).value }))
				}
			/>
			Y:
			<input
				type="range"
				min="0"
				max="300"
				value={position.y}
				onInput={(e) =>
					setPosition((prev) => ({ ...prev, y: +(e.target as HTMLInputElement).value }))
				}
			/>
		</>
	);
}

export default App;
