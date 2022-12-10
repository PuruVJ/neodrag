export function typingEffect(element: HTMLElement, speed: number) {
	const text = element.innerHTML;

	element.innerHTML = '';

	let i = 0;
	let timer = setInterval(function () {
		console.log(1);
		if (i < text.length) {
			element.append(text.charAt(i));
			i++;
		}
	}, speed);

	return {
		destroy: () => clearInterval(timer),
	};
}
