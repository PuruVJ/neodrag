import { useDraggable } from '@neodrag/react';
import { useEffect, useRef } from 'react';

function App() {
	const draggableRef = useRef<HTMLDivElement>(null);
	const { dragState, isDragging } = useDraggable<HTMLDivElement>(draggableRef, {
		onDrag: () => console.log('Muhahahahahah'),
	});

	useEffect(() => {
		console.log({ isDragging, dragState });
	}, [dragState, isDragging]);

	return <div ref={draggableRef}>Hello</div>;
}

export default App;
