export function typingEffect(element: HTMLElement, speed: number) {
	const text = element.innerHTML;

	element.innerHTML = '';

	let i = 0;
	const timer = setInterval(() => {
		if (i < text.length) element.append(text.charAt(i++));
	}, speed);

	return {
		destroy: () => clearInterval(timer),
	};
}
