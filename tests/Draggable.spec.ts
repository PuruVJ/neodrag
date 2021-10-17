// NOTE: jest-dom adds handy assertions to Jest and it is recommended, but not required.
import '@testing-library/jest-dom';

import { render } from '@testing-library/svelte';

import Draggable from './components/Draggable.svelte';
import { drag, touchDrag } from './testHelpers';

describe('Draggable', () => {
  describe('defaults', () => {
    it('renders a basic div', () => {
      const { getByText } = render(Draggable);

      const element = getByText('Drag me!');

      expect(element).toBeInTheDocument();
      expect(element).not.toHaveClass('svelte-draggable');
      expect(element).not.toHaveClass('svelte-draggable-dragged');
      expect(element).toHaveStyle('transform: translate3d(0px, 0px, 0)');
    });

    it('should be dragged by the mouse', async () => {
      const { getByText } = render(Draggable);

      const element = getByText('Drag me!');

      expect(element).toBeInTheDocument();

      await drag(element, 0, 0, 50, 50);

      expect(element).toHaveClass('svelte-draggable');
      expect(element).toHaveClass('svelte-draggable-dragged');
      expect(element).toHaveStyle('transform: translate3d(50px, 50px, 0)');
    });

    it('should be dragged by a touch event', async () => {
      const { getByText } = render(Draggable);

      const element = getByText('Drag me!');

      expect(element).toBeInTheDocument();

      await touchDrag(element, 0, 0, 50, 50);

      expect(element).toHaveClass('svelte-draggable');
      expect(element).toHaveClass('svelte-draggable-dragged');
      expect(element).toHaveStyle('transform: translate3d(50px, 50px, 0)');
    });
  });

  describe('with coordinate bounds', () => {
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
      const { getByText } = render(Draggable, {
        bounds: { top: 0, bottom: 100, left: 0, right: 100 },
      });

      const element = getByText('Drag me!');

      expect(element).toBeInTheDocument();
      expect(element).not.toHaveClass('svelte-draggable');
      expect(element).not.toHaveClass('svelte-draggable-dragged');
      expect(element).toHaveStyle('transform: translate3d(0px, 0px, 0)');
    });

    it('should move within bounds', async () => {
      const { getByText } = render(Draggable, {
        bounds: { top: 0, bottom: 100, left: 0, right: 100 },
      });

      const element = getByText('Drag me!');

      expect(element).toBeInTheDocument();

      await drag(element, 0, 0, 50, 50);

      expect(element).toHaveClass('svelte-draggable');
      expect(element).toHaveClass('svelte-draggable-dragged');
      expect(element).toHaveStyle('transform: translate3d(50px, 50px, 0)');
    });

    it('should be dragged by a touch event', async () => {
      const { getByText } = render(Draggable, {
        bounds: { top: 0, bottom: 100, left: 0, right: 100 },
      });

      const element = getByText('Drag me!');

      expect(element).toBeInTheDocument();

      await touchDrag(element, 0, 0, 50, 50);

      expect(element).toHaveClass('svelte-draggable');
      expect(element).toHaveClass('svelte-draggable-dragged');
      expect(element).toHaveStyle('transform: translate3d(50px, 50px, 0)');
    });

    it('should not leave bounds from the bottom right', async () => {
      const { getByText } = render(Draggable, {
        bounds: { top: 0, bottom: 100, left: 0, right: 100 },
      });

      const element = getByText('Drag me!');

      expect(element).toBeInTheDocument();

      await drag(element, 0, 0, 200, 200);

      expect(element).toHaveClass('svelte-draggable');
      expect(element).toHaveClass('svelte-draggable-dragged');
      expect(element).toHaveStyle('transform: translate3d(90px, 90px, 0)');
    });

    it('should not leave bounds from the top left', async () => {
      const { getByText } = render(Draggable, {
        bounds: { top: 0, bottom: 100, left: 0, right: 100 },
      });

      const element = getByText('Drag me!');

      expect(element).toBeInTheDocument();

      await drag(element, 0, 0, -100, -100);

      expect(element).toHaveClass('svelte-draggable');
      expect(element).toHaveClass('svelte-draggable-dragged');
      expect(element).toHaveStyle('transform: translate3d(0px, 0px, 0)');
    });

    it('should not leave bounds from the bottom right when touched', async () => {
      const { getByText } = render(Draggable, {
        bounds: { top: 0, bottom: 100, left: 0, right: 100 },
      });

      const element = getByText('Drag me!');

      expect(element).toBeInTheDocument();

      await touchDrag(element, 0, 0, 200, 200);

      expect(element).toHaveClass('svelte-draggable');
      expect(element).toHaveClass('svelte-draggable-dragged');
      expect(element).toHaveStyle('transform: translate3d(90px, 90px, 0)');
    });

    it('should not leave bounds from the top left when touched', async () => {
      const { getByText } = render(Draggable, {
        bounds: { top: 0, bottom: 100, left: 0, right: 100 },
      });

      const element = getByText('Drag me!');

      expect(element).toBeInTheDocument();

      await touchDrag(element, 0, 0, -100, -100);

      expect(element).toHaveClass('svelte-draggable');
      expect(element).toHaveClass('svelte-draggable-dragged');
      expect(element).toHaveStyle('transform: translate3d(0px, 0px, 0)');
    });
  });

  describe('bound to the x axis', () => {
    it('renders a basic div', () => {
      const { getByText } = render(Draggable, { axis: 'x' });

      const element = getByText('Drag me!');

      expect(element).toBeInTheDocument();
      expect(element).not.toHaveClass('svelte-draggable');
      expect(element).not.toHaveClass('svelte-draggable-dragged');
      expect(element).toHaveStyle('transform: translate3d(0px, 0px, 0)');
    });

    it('should only drag on the X axis', async () => {
      const { getByText } = render(Draggable, { axis: 'x' });

      const element = getByText('Drag me!');

      expect(element).toBeInTheDocument();

      await drag(element, 0, 0, 50, 50);

      expect(element).toHaveClass('svelte-draggable');
      expect(element).toHaveClass('svelte-draggable-dragged');
      expect(element).toHaveStyle('transform: translate3d(50px, 0px, 0)');
    });

    it('should only drag by touch on the X axis', async () => {
      const { getByText } = render(Draggable, { axis: 'x' });

      const element = getByText('Drag me!');

      expect(element).toBeInTheDocument();

      await touchDrag(element, 0, 0, 50, 50);

      expect(element).toHaveClass('svelte-draggable');
      expect(element).toHaveClass('svelte-draggable-dragged');
      expect(element).toHaveStyle('transform: translate3d(50px, 0px, 0)');
    });
  });

  describe('bound to the y axis', () => {
    it('renders a basic div', () => {
      const { getByText } = render(Draggable, { axis: 'y' });

      const element = getByText('Drag me!');

      expect(element).toBeInTheDocument();
      expect(element).not.toHaveClass('svelte-draggable');
      expect(element).not.toHaveClass('svelte-draggable-dragged');
      expect(element).toHaveStyle('transform: translate3d(0px, 0px, 0)');
    });

    it('should only drag on the Y axis', async () => {
      const { getByText } = render(Draggable, { axis: 'y' });

      const element = getByText('Drag me!');

      expect(element).toBeInTheDocument();

      await drag(element, 0, 0, 50, 50);

      expect(element).toHaveClass('svelte-draggable');
      expect(element).toHaveClass('svelte-draggable-dragged');
      expect(element).toHaveStyle('transform: translate3d(0px, 50px, 0)');
    });

    it('should only drag by touch on the Y axis', async () => {
      const { getByText } = render(Draggable, { axis: 'y' });

      const element = getByText('Drag me!');

      expect(element).toBeInTheDocument();

      await touchDrag(element, 0, 0, 50, 50);

      expect(element).toHaveClass('svelte-draggable');
      expect(element).toHaveClass('svelte-draggable-dragged');
      expect(element).toHaveStyle('transform: translate3d(0px, 50px, 0)');
    });
  });

  describe('bound to the none axis', () => {
    it('renders a basic div', () => {
      const { getByText } = render(Draggable, { axis: 'none' });

      const element = getByText('Drag me!');

      expect(element).toBeInTheDocument();
      expect(element).not.toHaveClass('svelte-draggable');
      expect(element).not.toHaveClass('svelte-draggable-dragged');
      expect(element).toHaveStyle('transform: translate3d(0px, 0px, 0)');
    });

    it('should not drag', async () => {
      const { getByText } = render(Draggable, { axis: 'none' });

      const element = getByText('Drag me!');

      expect(element).toBeInTheDocument();

      await drag(element, 0, 0, 50, 50);

      expect(element).toHaveClass('svelte-draggable');
      expect(element).toHaveClass('svelte-draggable-dragged');
      expect(element).toHaveStyle('transform: translate3d(0px, 0px, 0)');
    });

    it('should not drag by touch', async () => {
      const { getByText } = render(Draggable, { axis: 'none' });

      const element = getByText('Drag me!');

      expect(element).toBeInTheDocument();

      await touchDrag(element, 0, 0, 50, 50);

      expect(element).toHaveClass('svelte-draggable');
      expect(element).toHaveClass('svelte-draggable-dragged');
      expect(element).toHaveStyle('transform: translate3d(0px, 0px, 0)');
    });
  });
});
