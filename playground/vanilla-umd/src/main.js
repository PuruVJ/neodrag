const drag = new NeoDrag.Draggable({
	plugins: [],
	onDrag: ({ offset }) => {
		xSlider.value = offset.x.toString();
		ySlider.value = offset.y.toString();
	},
});

const draggableEl = document.querySelector('.box');
const xSlider = document.querySelector('#x');
const ySlider = document.querySelector('#y');

drag.attach(draggableEl);
