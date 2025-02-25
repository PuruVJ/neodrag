import { position as position_plugin, useDraggable, useCompartment } from '@neodrag/react';
import { useEffect, useRef, useState } from 'react';

function App() {
	const [position, setPosition] = useState({ x: 0, y: 0 });
	const pos_comp = useCompartment(() => position_plugin({ current: position }));

	const draggable_ref = useRef<HTMLDivElement>(null);

	const drag_state = useDraggable(draggable_ref, () => [pos_comp]);

	useEffect(() => {
		setPosition(drag_state.offset);
	}, [drag_state.offset]);

	useEffect(() => {
		pos_comp.current = position_plugin({ current: position });
	}, [position]);

	// useEffect(() => {
	// 	console.log(position);
	// }, [position]);

	return (
		<>
			<div ref={draggable_ref}>I can be moved with the slider too</div>
			X:
			<input
				type="range"
				min="0"
				max="300"
				value={position.x}
				// @ts-ignore
				onInput={(e) => setPosition((prev) => ({ ...prev, x: +e.target.value }))}
			/>
			Y:
			<input
				type="range"
				min="0"
				max="300"
				value={position.y}
				// @ts-ignore
				onInput={(e) => setPosition((prev) => ({ ...prev, y: +e.target.value }))}
			/>
		</>
	);
}

export default App;
