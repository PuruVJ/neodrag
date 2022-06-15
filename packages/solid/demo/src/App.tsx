import { Component, createEffect } from 'solid-js';
import { createDraggable } from '@neodrag/solid';

const App: Component = () => {
	let draggableRef: HTMLDivElement | undefined = undefined;

	const { dragState, isDragging } = createDraggable(
		() => draggableRef,
		() => ({ onDrag: () => console.log('Muhahahahahah') })
	);

	createEffect(() => {
		console.log({ isDragging: isDragging(), dragState: dragState() });
	});

	return <div ref={draggableRef}>Hello</div>;
};

export default App;
