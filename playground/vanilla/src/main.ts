import './style.css';
import { Draggable } from '@neodrag/vanilla';
import { position } from '@neodrag/vanilla/plugins';

const draggableEl = document.querySelector<HTMLDivElement>('.box')!;
const xSlider = document.querySelector<HTMLInputElement>('#x')!;
const ySlider = document.querySelector<HTMLInputElement>('#y')!;

let pos = { x: 0, y: 0 };

const drag = new Draggable({
	plugins: [() => position({ current: pos })],
	onDrag: ({ offset }) => {
		pos = { x: offset.x, y: offset.y };
		xSlider.value = offset.x.toString();
		ySlider.value = offset.y.toString();
	},
});

drag.attach(draggableEl);

function sync() {
	drag.update();
}

xSlider.addEventListener('input', (e: Event) => {
	pos.x = +(e.target as HTMLInputElement).value;
	sync();
});

ySlider.addEventListener('input', (e: Event) => {
	pos.y = +(e.target as HTMLInputElement).value;
	sync();
});
