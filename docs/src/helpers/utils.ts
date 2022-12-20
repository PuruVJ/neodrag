export const browser = !import.meta.env.SSR;

export const isMac =
	browser && navigator.platform.toUpperCase().indexOf('MAC') >= 0;
export const isMobile =
	browser &&
	navigator.userAgent.match(/(iPad)|(iPhone)|(iPod)|(android)|(webOS)/i);
export const isDesktop = !isMobile;

export const elementsOverlap = (el1: HTMLElement, el2: HTMLElement) => {
	const domRect1 = el1.getBoundingClientRect();
	const domRect2 = el2.getBoundingClientRect();

	return !(
		domRect1.top > domRect2.bottom ||
		domRect1.right < domRect2.left ||
		domRect1.bottom < domRect2.top ||
		domRect1.left > domRect2.right
	);
};
