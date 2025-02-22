import { events, position as positionPlugin, useDraggable } from '@neodrag/solid';
import { Component, createSignal } from 'solid-js';

const App: Component = () => {
	const [draggableRef, setDraggableRef] = createSignal<HTMLElement>();

	const [position, setPosition] = createSignal({ x: 0, y: 0 });

	const dragState = useDraggable(draggableRef, () => [
		positionPlugin({ current: position() }),
		events({
			onDrag({ offset }) {
				console.log(1);
				setPosition({ x: offset.x, y: offset.y });
			},
		}),
	]);

	return (
		<>
			<div ref={setDraggableRef}>I can be moved with the slider too</div>
			X:
			<input
				type="range"
				min="0"
				max="300"
				value={position().x}
				onInput={(e) => setPosition({ x: +e.target.value, y: position().y })}
			/>
			Y:
			<input
				type="range"
				min="0"
				max="300"
				value={position().y}
				onInput={(e) => setPosition({ x: position().x, y: +e.target.value })}
			/>
		</>
	);
};

export default App;
