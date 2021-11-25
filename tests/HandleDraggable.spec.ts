import { test } from 'uvu';
import * as assert from 'uvu/assert';
import puppeteer from 'puppeteer';
import fs from 'fs';
import { fileURLToPath } from 'url';
import * as path from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const browserPromise = puppeteer.launch();
const pagePromise = browserPromise.then((browser) => browser.newPage());

test.after(async () => {
	const browser = await browserPromise;
	await browser.close();
});

async function reload() {
	const page = await pagePromise;
	await page.goto('file://' + path.resolve(__dirname, 'app', 'public', 'index.html'));
	return page;
}

test('renders a basic div', async () => {
	const getByText = (text: string, tag = 'div') => page.$x(`//${tag}[contains(., '${text}')]`);
	const page = await reload();

	const [element] = await getByText('You shall not drag!!');
	const [handleElement] = await getByText('This will drag!');

	assert.is(Boolean(element), true);
	assert.is(Boolean(handleElement), true);

	assert.not.ok(await element.evaluate((el) => el.classList.contains('svelte-draggable')));
	assert.not.ok(await element.evaluate((el) => el.classList.contains('svelte-draggable-dragged')));
	assert.is(await await element.evaluate((el) => getComputedStyle(el)), 'translate3d(0px, 0px, 0)');
});
/*
it('should drag by the handle element', async () => {
	const getByText = (text: string, tag = 'div') => page.$x(`//${tag}[contains(., '${text}')]`);
	const page = await reload();

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
*/
test.run();
