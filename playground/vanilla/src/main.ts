import './style.css';
import { Draggable, events, position } from '@neodrag/vanilla';

const draggableEl = document.querySelector<HTMLDivElement>('.box')!;
const xSlider = document.querySelector<HTMLInputElement>('#x')!;
const ySlider = document.querySelector<HTMLInputElement>('#y')!;

let pos = { x: 0, y: 0 };

const build = () => [
	position({ current: pos }),
	events({
		onDrag: ({ offset }) => {
			pos = { x: offset.x, y: offset.y };
			xSlider.value = offset.x.toString();
			ySlider.value = offset.y.toString();
		},
	}),
];

const dragInstance = new Draggable(draggableEl, build());

function sync() {
	dragInstance.update(build());
}

xSlider.addEventListener('input', (e: Event) => {
	pos.x = +(e.target as HTMLInputElement).value;
	sync();
});

ySlider.addEventListener('input', (e: Event) => {
	pos.y = +(e.target as HTMLInputElement).value;
	sync();
});
