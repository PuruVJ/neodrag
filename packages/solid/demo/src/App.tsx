import { createDraggable, DragAxis } from '@neodrag/solid';
import { Component, createSignal } from 'solid-js';

const App: Component = () => {
	const { draggable } = createDraggable();

	const [axis, setAxis] = createSignal<DragAxis>('both');

	return (
		<div>
			<div
				use:draggable={{
					axis: axis(),
				}}
			>
				Draggable
			</div>

			<button onClick={() => setAxis((axis) => (axis === 'both' ? 'x' : 'both'))}>
				Update axis
			</button>
		</div>
	);
};

export default App;
