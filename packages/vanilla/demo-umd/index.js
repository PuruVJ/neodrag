const dragEl = document.querySelector('.box');
if (!dragEl) {
  throw new Error('Drag element not found');
}
const dragInstance = new NeoDragVanilla.Draggable(dragEl);
console.log({ dragInstance });
