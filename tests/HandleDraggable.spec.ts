import '@testing-library/jest-dom';
import { render } from '@testing-library/svelte';
import HandleDraggable from './components/HandleDraggable.svelte';
import { drag, touchDrag } from './testHelpers';

describe('CancelDraggable', () => {
	it('renders a basic div', () => {
		const { getByText } = render(HandleDraggable);

		const element = getByText('You shall not drag!!');
		const handleElement = getByText('This will drag!');

		expect(element).toBeInTheDocument();
		expect(handleElement).toBeInTheDocument();

		expect(element).not.toHaveClass('svelte-draggable');
		expect(element).not.toHaveClass('svelte-draggable-dragged');
		expect(element).toHaveStyle('transform: translate3d(0px, 0px, 0)');
	});

	it('should drag by the handle element', async () => {
		const { getByText } = render(HandleDraggable);

		const element = getByText('You shall not drag!!');
		const handleElement = getByText('This will drag!');

		expect(element).toBeInTheDocument();
		expect(handleElement).toBeInTheDocument();

		await drag(handleElement, 0, 0, 50, 50);

		expect(element).toHaveClass('svelte-draggable');
		expect(element).toHaveClass('svelte-draggable-dragged');
		expect(element).toHaveStyle('transform: translate3d(50px, 50px, 0)');
	});

	it('should not drag by the main element', async () => {
		const { getByText } = render(HandleDraggable);

		const element = getByText('You shall not drag!!');
		const handleElement = getByText('This will drag!');

		expect(element).toBeInTheDocument();
		expect(handleElement).toBeInTheDocument();

		await drag(element, 0, 0, 50, 50);

		expect(element).toHaveClass('svelte-draggable');
		expect(element).not.toHaveClass('svelte-draggable-dragged');
		expect(element).toHaveStyle('transform: translate3d(0px, 0px, 0)');
	});

	it('should drag by the handle element by touch', async () => {
		const { getByText } = render(HandleDraggable);

		const element = getByText('You shall not drag!!');
		const handleElement = getByText('This will drag!');

		expect(element).toBeInTheDocument();
		expect(handleElement).toBeInTheDocument();

		await touchDrag(handleElement, 0, 0, 50, 50);

		expect(element).toHaveClass('svelte-draggable');
		expect(element).toHaveClass('svelte-draggable-dragged');
		expect(element).toHaveStyle('transform: translate3d(50px, 50px, 0)');
	});

	it('should not drag by the main element by touch', async () => {
		const { getByText } = render(HandleDraggable);

		const element = getByText('You shall not drag!!');

		expect(element).toBeInTheDocument();

		await touchDrag(element, 0, 0, 50, 50);

		expect(element).toHaveClass('svelte-draggable');
		expect(element).not.toHaveClass('svelte-draggable-dragged');
		expect(element).toHaveStyle('transform: translate3d(0px, 0px, 0)');
	});
});
