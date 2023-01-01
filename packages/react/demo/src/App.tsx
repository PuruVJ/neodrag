import { useDraggable } from '@neodrag/react';
import { useRef, useState } from 'react';

function App() {
	const [position, setPosition] = useState({ x: 0, y: 0 });

	const draggableRef = useRef<HTMLDivElement>(null);

	useDraggable(draggableRef, {
		onDrag: ({ offsetX, offsetY }) => setPosition({ x: offsetX, y: offsetY }),
	});

	return (
		<>
			<div ref={draggableRef}>I can be moved with the slider too</div>
			X:
			<input
				type="range"
				min="0"
				max="300"
				value={position.x}
				onInput={(e) => setPosition({ x: +e.target.value, y: position.y })}
			/>
			Y:
			<input
				type="range"
				min="0"
				max="300"
				value={position.y}
				onInput={(e) => setPosition({ x: position.x, y: +e.target.value })}
			/>
		</>
	);
}

export default App;
