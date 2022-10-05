import './style.css';
import { Draggable } from '@neodrag/vanilla';

const box = document.querySelector<HTMLDivElement>('.box')!;

const dragInstance = new Draggable(box, { axis: 'both', grid: [10, 10] });

document.querySelector('button')!.onclick = () => {
	dragInstance.options = { axis: dragInstance.options.axis === 'both' ? 'x' : 'both' };
	console.log(dragInstance.options);
};
