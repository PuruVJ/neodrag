import { useDraggable } from '@neodrag/react';
import { useRef } from 'react';

function App() {
	const divRef = useRef<HTMLDivElement>(null);
	useDraggable(divRef, { onDrag: (e) => console.log(e) });

	return <div ref={divRef}>Hola</div>;
}

export default App;
