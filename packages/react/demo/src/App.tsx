import { useDraggable } from '@neodrag/react';
import { useRef } from 'react';

function App() {
	const draggableRef = useRef<HTMLDivElement>(null);
	useDraggable<HTMLDivElement>(draggableRef, { onDrag: (e) => console.log(e) });

	return <div ref={draggableRef}>Hello</div>;
}

export default App;
