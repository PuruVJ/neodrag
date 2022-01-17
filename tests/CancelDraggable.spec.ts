import '@testing-library/jest-dom';
import { render } from '@testing-library/svelte';
import CancelDraggable from './components/CancelDraggable.svelte';
import { drag, touchDrag } from './testHelpers';

describe('CancelDraggable', () => {
	it('renders a basic div', () => {
		const { getByText } = render(CancelDraggable);

		const element = getByText('This will drag!');

		expect(element).toBeInTheDocument();
		expect(element).not.toHaveClass('svelte-draggable');
		expect(element).not.toHaveClass('svelte-draggable-dragged');
		expect(element).toHaveStyle('transform: translate3d(0px, 0px, 0)');

		const cancelElement = getByText('You shall not drag!!');

		expect(cancelElement).toBeInTheDocument();
		expect(cancelElement).toHaveClass('cancel');
	});

	it('should drag by the main element', async () => {
		const { getByText } = render(CancelDraggable);

		const element = getByText('This will drag!');

		expect(element).toBeInTheDocument();

		await drag(element, 0, 0, 50, 50);

		expect(element).toHaveClass('svelte-draggable');
		expect(element).toHaveClass('svelte-draggable-dragged');
		expect(element).toHaveStyle('transform: translate3d(50px, 50px, 0)');
	});

	it('should not drag by the cancel element', async () => {
		const { getByText } = render(CancelDraggable);

		const cancelElement = getByText('You shall not drag!!');

		expect(cancelElement).toBeInTheDocument();

		await drag(cancelElement, 0, 0, 50, 50);

		const element = getByText('This will drag!');

		expect(element).toHaveClass('svelte-draggable');
		expect(element).not.toHaveClass('svelte-draggable-dragged');
		expect(element).toHaveStyle('transform: translate3d(0px, 0px, 0)');
	});

	it('should drag by the main element by touch', async () => {
		const { getByText } = render(CancelDraggable);

		const element = getByText('This will drag!');

		expect(element).toBeInTheDocument();

		await touchDrag(element, 0, 0, 50, 50);

		expect(element).toHaveClass('svelte-draggable');
		expect(element).toHaveClass('svelte-draggable-dragged');
		expect(element).toHaveStyle('transform: translate3d(50px, 50px, 0)');
	});

	it('should not drag by the cancel element by touch', async () => {
		const { getByText } = render(CancelDraggable);

		const cancelElement = getByText('You shall not drag!!');

		expect(cancelElement).toBeInTheDocument();

		await touchDrag(cancelElement, 0, 0, 50, 50);

		const element = getByText('This will drag!');

		expect(element).toHaveClass('svelte-draggable');
		expect(element).not.toHaveClass('svelte-draggable-dragged');
		expect(element).toHaveStyle('transform: translate3d(0px, 0px, 0)');
	});
});
