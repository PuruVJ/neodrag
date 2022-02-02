import { Draggable, useDraggable } from '@neodrag/react';
import { useRef, useState } from 'react';
import './App.css';

function App() {
	const inputRef = useRef<HTMLInputElement>(null);
	const draggableRef = useDraggable(inputRef);

	return (
		<Draggable>
			<input className="App" ref={inputRef}></input>
		</Draggable>
	);
}

export default App;
