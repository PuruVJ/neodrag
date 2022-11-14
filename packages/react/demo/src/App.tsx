import { useDraggable } from '@neodrag/react';
import { useEffect, useRef } from 'react';

function App() {
	const cancelRef = useRef<HTMLDivElement>(null);
	const draggableRef = useRef<HTMLDivElement>(null);
	const { dragState, isDragging } = useDraggable<HTMLDivElement>(draggableRef, {
		onDrag: () => console.log('Muhahahahahah'),
		cancel: cancelRef,
	});

	useEffect(() => {
		console.log({ isDragging, dragState });
	}, [dragState, isDragging]);

	return (
		<div ref={draggableRef}>
			Hello
			<div ref={cancelRef}>Cancel me</div>
		</div>
	);
}

export default App;
