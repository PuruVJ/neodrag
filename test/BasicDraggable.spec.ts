// NOTE: jest-dom adds handy assertions to Jest and it is recommended, but not required.
import '@testing-library/jest-dom';

import { render } from '@testing-library/svelte';

import BasicDraggable from './components/BasicDraggable.svelte';
import { drag, touchDrag } from './testHelpers';

describe('BasicDraggable', () => {
  it('renders a basic div', () => {
    const { getByText } = render(<any>BasicDraggable);

    const element = getByText('Drag me!');

    expect(element).toBeInTheDocument();
    expect(element).not.toHaveClass('svelte-draggable');
    expect(element).not.toHaveClass('svelte-draggable-dragged');
    expect(element).toHaveStyle('transform: translate3d(0px, 0px, 0)');
  });

  it('should be dragged by the mouse', async () => {
    const { getByText } = render(<any>BasicDraggable);

    const element = getByText('Drag me!');

    expect(element).toBeInTheDocument();

    await drag(element, 50, 50);

    expect(element).toHaveClass('svelte-draggable');
    expect(element).toHaveClass('svelte-draggable-dragged');
    expect(element).toHaveStyle('transform: translate3d(50px, 50px, 0)');
  });

  it('should be dragged by a touch event', async () => {
    const { getByText } = render(<any>BasicDraggable);

    const element = getByText('Drag me!');

    expect(element).toBeInTheDocument();

    await touchDrag(element, 0, 0, 50, 50);

    expect(element).toHaveClass('svelte-draggable');
    expect(element).toHaveClass('svelte-draggable-dragged');
    expect(element).toHaveStyle('transform: translate3d(50px, 50px, 0)');
  });
});
