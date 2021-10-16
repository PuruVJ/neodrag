// NOTE: jest-dom adds handy assertions to Jest and it is recommended, but not required.
import '@testing-library/jest-dom';

import { render } from '@testing-library/svelte';

import CoordinateBounds from './components/CoordinateBounds.svelte';
import { drag, touchDrag } from './testHelpers';

describe('BasicDraggable', () => {
  beforeEach(() => {
    Element.prototype.getBoundingClientRect = jest.fn(() => {
      return <any>{
        width: 10,
        height: 10,
        top: 0,
        left: 0,
        bottom: 10,
        right: 10,
      };
    });

    Object.assign(window, {
      innerWidth: 200,
      innerHeight: 200,
    });
  });

  it('renders a basic div', () => {
    const { getByText } = render(<any>CoordinateBounds);

    const element = getByText('Drag me!');

    expect(element).toBeInTheDocument();
    expect(element).not.toHaveClass('svelte-draggable');
    expect(element).not.toHaveClass('svelte-draggable-dragged');
    expect(element).toHaveStyle('transform: translate3d(0px, 0px, 0)');
  });

  it('should move within bounds', async () => {
    const { getByText } = render(<any>CoordinateBounds);

    const element = getByText('Drag me!');

    expect(element).toBeInTheDocument();

    await drag(element, 0, 0, 50, 50);

    expect(element).toHaveClass('svelte-draggable');
    expect(element).toHaveClass('svelte-draggable-dragged');
    expect(element).toHaveStyle('transform: translate3d(50px, 50px, 0)');
  });

  it('should not leave bounds from the bottom right', async () => {
    const { getByText } = render(<any>CoordinateBounds);

    const element = getByText('Drag me!');

    expect(element).toBeInTheDocument();

    await drag(element, 0, 0, 200, 200);

    expect(element).toHaveClass('svelte-draggable');
    expect(element).toHaveClass('svelte-draggable-dragged');
    expect(element).toHaveStyle('transform: translate3d(90px, 90px, 0)');
  });

  it('should not leave bounds from the top left', async () => {
    const { getByText } = render(<any>CoordinateBounds);

    const element = getByText('Drag me!');

    expect(element).toBeInTheDocument();

    await drag(element, 0, 0, -100, -100);

    expect(element).toHaveClass('svelte-draggable');
    expect(element).toHaveClass('svelte-draggable-dragged');
    expect(element).toHaveStyle('transform: translate3d(0px, 0px, 0)');
  });

  it('should be dragged by a touch event', async () => {
    const { getByText } = render(<any>CoordinateBounds);

    const element = getByText('Drag me!');

    expect(element).toBeInTheDocument();

    await touchDrag(element, 0, 0, 50, 50);

    expect(element).toHaveClass('svelte-draggable');
    expect(element).toHaveClass('svelte-draggable-dragged');
    expect(element).toHaveStyle('transform: translate3d(50px, 50px, 0)');
  });
});
