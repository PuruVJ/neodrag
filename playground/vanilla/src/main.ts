import './style.css';
import { Compartment, Draggable, events, position } from '@neodrag/vanilla';

const draggableEl = document.querySelector<HTMLDivElement>('.box')!;
const xSlider = document.querySelector<HTMLInputElement>('#x')!;
const ySlider = document.querySelector<HTMLInputElement>('#y')!;

let pos = { x: 0, y: 0 };

const positionCompartment = new Compartment(position({ current: pos }));
const eventsCompartment = new Compartment(
	events({
		onDrag: ({ offset }) => {
			pos = { ...offset };

			xSlider.value = offset.x.toString();
			ySlider.value = offset.y.toString();
		},
		onDragEnd() {
			positionCompartment.current = position({ current: pos });
		},
	}),
);

const dragInstance = new Draggable(draggableEl, [positionCompartment, eventsCompartment]);

xSlider.addEventListener('input', (e: Event) => {
	// @ts-ignore
	pos.x = +e.target.value;
	positionCompartment.current = position({ current: pos });
});

ySlider.addEventListener('input', (e: Event) => {
	// @ts-ignore
	pos.y = +e.target.value;
	positionCompartment.current = position({ current: pos });
});
